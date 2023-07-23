import { Response, type Request } from 'express'
import { NextApiRequest, NextApiResponse } from 'next'
import supertokens from 'supertokens-node'
import ThirdPartyNode from 'supertokens-node/recipe/thirdparty'
import { backendEnv } from '@/src/config/backend-env'
import { getBackendConfig } from '@/src/config/supertokens/backend-config'
import { GoogleCalendarService } from '@/src/services/google-calendar'
import { getTripDuration } from '@/src/services/google-maps'
import {
  ProcessedEvent,
  createEventHash,
  getEventDoc,
} from '@/src/services/processed-events'
import { getCredentials, setUserMeta } from '@/src/services/user-meta'
import { decryptData } from '@/src/utils/encryption'
import { createAppLogger } from '@/src/utils/logger'
import { setSentryUser, withSentrySpan } from '@/src/utils/sentry'

const INVALID_CHANNEL_TOKEN = 'Invalid channel token'
const INVALID_RESOUCE_ID = 'Invalid x-goog-resource-id header'
const INVALID_RESOURCE_STATE = 'Invalid x-goog-resource-state header'

const TRIP_EVENT_GAP = 5 * 60 // 5 min

const moduleLogger = createAppLogger('calendar-webhook')

supertokens.init(getBackendConfig())

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
  setSentryUser(userId)

  const resourceState = headers['x-goog-resource-state']

  if (resourceState === 'sync') {
    logger.info('Confirmed registration with sync event')
    return res.status(200).send('OK')
  } else if (resourceState === 'not_exists') {
    logger.info('Received event for removed resource, skipping')
    return res.status(200).send('OK')
  } else if (resourceState === 'exists') {
    logger.info('Received event for existing resouce, processing')
  } else {
    logger.warn({ resourceState }, INVALID_RESOURCE_STATE)
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

    const { doc, eventRef } = await getEventDoc(userId, event)

    const firestoreLogger = eventLogger.child({ firestoreDocId: doc.id })

    if (doc.exists) {
      const docData = doc.data() as ProcessedEvent

      if (docData.hash === createEventHash(event)) {
        firestoreLogger.info(
          'Firestore doc already exists for current event version, skipping'
        )
        return
      }

      firestoreLogger.debug(
        'Firestore doc exists for the outdated version of the event, processsing'
      )
    } else {
      firestoreLogger.debug('No doc for event found in firestore, processing')
    }

    let newEventData: ProcessedEvent
    const data = doc.data() as ProcessedEvent | undefined

    if (doc.exists && data && !data.deleted) {
      await calendarService.deleteTripEvent(data.tripEventId)
    }

    if (event.status === 'cancelled') {
      if (!doc.exists || !data) {
        firestoreLogger.warn(
          'Out of sync: firestore doc does not exist for the already cancelled event'
        )
        return
      }
      if (!data.deleted) {
        firestoreLogger.debug('Event is cancelled, marking event as deleted')
        newEventData = {
          processed: true,
          deleted: true,
          hash: createEventHash(event),
          tripEventId: null,
        }
      }
    } else {
      firestoreLogger.debug(
        `${doc.exists ? 'Updating' : 'Creating'} firestore doc for the event`
      )
      const arrivalTimestamp =
        Date.parse(event.start.dateTime) / 1000 - TRIP_EVENT_GAP

      const duration = await withSentrySpan(
        () =>
          getTripDuration(
            backendEnv.HOME_LOCATION,
            event.location as string,
            arrivalTimestamp,
            userId
          ),
        'maps',
        'get trip duration'
      )

      const startTimestamp = arrivalTimestamp - duration
      const startDate = new Date(startTimestamp * 1000)
      const endDate = new Date(arrivalTimestamp * 1000)

      const possiblePlaceName = event.location.split(',')[0]

      const tripEventId = await withSentrySpan(
        () =>
          calendarService.createTripEvent(
            startDate,
            endDate,
            possiblePlaceName
          ),
        'calendar',
        'create trip event'
      )

      newEventData = {
        processed: true,
        deleted: false,
        hash: createEventHash(event),
        tripEventId,
      }
    }
    await withSentrySpan(
      () => eventRef.set(newEventData),
      'firestore',
      'save event'
    )
    firestoreLogger.debug(
      `${
        doc.exists ? 'Updated' : 'Created'
      } firestore doc for the processed event`
    )
  })

  await Promise.all(promises)

  res.status(200).send('OK')
}
