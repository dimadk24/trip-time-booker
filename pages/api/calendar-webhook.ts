import { NextApiRequest, NextApiResponse } from 'next'
import { type Request, Response } from 'express'
import ThirdPartyNode from 'supertokens-node/recipe/thirdparty'
import { getCredentials } from '@/src/services/user-meta'
import { GoogleCalendarService } from '@/src/services/google-calendar'
import { getTripDuration } from '@/src/services/google-maps'
import { HOME_LOCATION } from '@/src/config/app-config'
import { createAppLogger } from '@/src/utils/logger'

const INVALID_CHANNEL_TOKEN = 'Invalid channel token'
const INVALID_RESOUCE_ID = 'Invalid x-goog-resource-id header'
const INVALID_RESOURCE_STATE = 'Invalid x-goog-resource-state header'

const TRIP_EVENT_GAP = 5 * 60 // 5 min

const logger = createAppLogger('calendar-webhook')

export default async function calendarWebhook(
  req: NextApiRequest & Request,
  res: NextApiResponse & Response
) {
  logger.debug('Calendar webhook called')
  const { headers } = req

  const userId = headers['x-goog-channel-token']

  if (typeof userId !== 'string') {
    logger.warn(INVALID_CHANNEL_TOKEN, { token: userId })
    return res.status(401).send(INVALID_CHANNEL_TOKEN)
  }

  const user = await ThirdPartyNode.getUserById(userId)
  if (!user) {
    logger.warn('No user can be found by channel token', { token: userId })
    return res.status(401).send(INVALID_CHANNEL_TOKEN)
  }

  const resourceState = headers['x-goog-resource-state']

  if (resourceState === 'sync') {
    logger.info('Confirmed registration with sync event', { userId })
    return res.status(200).send('OK')
  } else if (resourceState === 'not_exists') {
    logger.info('Received event for removed resource, skipping')
    return res.status(200).send('OK')
  } else if (resourceState === 'exists') {
    logger.info('Received event for new resouce, processing', { userId })
  } else {
    logger.error(INVALID_RESOURCE_STATE, { resourceState })
    return res.status(400).send(INVALID_RESOURCE_STATE)
  }

  const resouceId = headers['x-goog-resource-id']
  if (typeof resouceId !== 'string') {
    logger.warn(INVALID_RESOUCE_ID, { resouceId })
    return res.status(400).send(INVALID_RESOUCE_ID)
  }

  logger.debug('Validation checks passed, processing event', { userId })

  const credentials = await getCredentials(userId)

  const calendarService = new GoogleCalendarService(credentials)

  const justCreatedEvents = await calendarService.getJustChangedEvents(userId)

  const promises = justCreatedEvents.map(async (event) => {
    const eventId = event.id
    if (!event.location) {
      logger.debug('No location for event', { eventId, userId })
      return
    }
    if (!event.start?.dateTime) {
      logger.warn('No start datetime for event', { eventId, userId })
      return
    }

    const arrivalTimestamp =
      Date.parse(event.start.dateTime) / 1000 - TRIP_EVENT_GAP

    const duration = await getTripDuration(
      HOME_LOCATION,
      event.location,
      arrivalTimestamp,
      userId
    )
    console.log(duration)

    // create events
  })

  await Promise.all(promises)

  res.status(200).send('OK')
}
