import { NextApiRequest, NextApiResponse } from 'next'
import { type Request, Response } from 'express'
import ThirdPartyNode from 'supertokens-node/recipe/thirdparty'
import supertokens from 'supertokens-node'
import { getCredentials } from '@/src/services/user-meta'
import { GoogleCalendarService } from '@/src/services/google-calendar'
import { getTripDuration } from '@/src/services/google-maps'
import { backendEnv } from '@/src/config/backend-env'
import { createAppLogger } from '@/src/utils/logger'
import { getBackendConfig } from '@/src/config/supertokens/backend-config'
import { hash } from '@/src/utils/hasher'
import { decryptData } from '@/src/utils/encryption'
import { firestore } from '@/src/services/firestore'
import { getSentryTransaction } from '@/src/utils/sentry'

const INVALID_CHANNEL_TOKEN = 'Invalid channel token'
const INVALID_RESOUCE_ID = 'Invalid x-goog-resource-id header'
const INVALID_RESOURCE_STATE = 'Invalid x-goog-resource-state header'

type CalendarEvent = Awaited<
  ReturnType<InstanceType<typeof GoogleCalendarService>['getJustChangedEvents']>
>[number]

const TRIP_EVENT_GAP = 5 * 60 // 5 min

const moduleLogger = createAppLogger('calendar-webhook')

supertokens.init(getBackendConfig())

const createFirestoreIdForEvent = (userId: string, event: CalendarEvent) => {
  if (!event.start?.dateTime) {
    throw new Error(`start.dateTime does not exist for the event ${event.id}`)
  }
  const string = [userId, event.id, event.start.dateTime, event.location].join(
    '-'
  )
  return hash(string)
}

const PROCESSED_EVENTS_COLLECTION =
  backendEnv.NODE_ENV === 'production'
    ? 'processed-events'
    : 'dev-processed-events'

export default async function calendarWebhook(
  req: NextApiRequest & Request,
  res: NextApiResponse & Response
) {
  moduleLogger.debug('Calendar webhook called')
  const { headers } = req

  const channelToken = headers['x-goog-channel-token']

  if (typeof channelToken !== 'string') {
    moduleLogger.warn({ token: channelToken }, INVALID_CHANNEL_TOKEN)
    return res.status(401).send(INVALID_CHANNEL_TOKEN)
  }

  const userId = decryptData(channelToken)
  const user = await ThirdPartyNode.getUserById(userId)
  if (!user) {
    moduleLogger.warn(
      { token: userId },
      'No user can be found by channel token'
    )
    return res.status(401).send(INVALID_CHANNEL_TOKEN)
  }
  const logger = moduleLogger.child({ userId })

  const resourceState = headers['x-goog-resource-state']

  if (resourceState === 'sync') {
    logger.info('Confirmed registration with sync event')
    return res.status(200).send('OK')
  } else if (resourceState === 'not_exists') {
    logger.info('Received event for removed resource, skipping')
    return res.status(200).send('OK')
  } else if (resourceState === 'exists') {
    logger.info('Received event for new resouce, processing')
  } else {
    logger.error({ resourceState }, INVALID_RESOURCE_STATE)
    return res.status(400).send(INVALID_RESOURCE_STATE)
  }

  const resouceId = headers['x-goog-resource-id']
  if (typeof resouceId !== 'string') {
    logger.warn({ resouceId }, INVALID_RESOUCE_ID)
    return res.status(400).send(INVALID_RESOUCE_ID)
  }

  logger.debug('Validation checks passed, processing event')

  const credentials = await getCredentials(userId)

  const calendarService = new GoogleCalendarService(credentials, userId)

  const justCreatedEvents = await calendarService.getJustChangedEvents()

  const promises = justCreatedEvents.map(async (event) => {
    const eventId = event.id
    const eventLogger = logger.child({ eventId })
    if (!event.location) {
      eventLogger.debug('No location for event, skipping')
      return
    }
    if (!event.start?.dateTime) {
      eventLogger.debug('No start datetime for event, skipping')
      return
    }

    const transaction = getSentryTransaction()

    const firestoreDocId = createFirestoreIdForEvent(userId, event)

    let span = transaction.startChild({
      op: 'firestore',
      description: 'get doc',
    })
    const eventRef = firestore
      .collection(PROCESSED_EVENTS_COLLECTION)
      .doc(firestoreDocId)
    const doc = await eventRef.get()
    span.finish()

    const firestoreLogger = eventLogger.child({ firestoreDocId })

    if (doc.exists) {
      firestoreLogger.info('Firestore doc already exists for event, skipping')
      return
    }

    firestoreLogger.debug(
      'No doc for event found in firestore, processing event'
    )

    const arrivalTimestamp =
      Date.parse(event.start.dateTime) / 1000 - TRIP_EVENT_GAP

    span = transaction.startChild({
      op: 'maps',
      description: 'get trip duration',
    })
    const duration = await getTripDuration(
      backendEnv.HOME_LOCATION,
      event.location,
      arrivalTimestamp,
      userId
    )
    span.finish()

    const startTimestamp = arrivalTimestamp - duration
    const startDate = new Date(startTimestamp * 1000)
    const endDate = new Date(arrivalTimestamp * 1000)

    const possiblePlaceName = event.location.split(',')[0]

    span = transaction.startChild({
      op: 'calendar',
      description: 'create trip event',
    })
    await calendarService.createTripEvent(startDate, endDate, possiblePlaceName)
    span.finish()

    span = transaction.startChild({
      op: 'firestore',
      description: 'save event',
    })
    await eventRef.set({
      processed: true,
    })
    span.finish()
    firestoreLogger.debug('Created firestore doc for the processed event')
  })

  await Promise.all(promises)

  res.status(200).send('OK')
}
