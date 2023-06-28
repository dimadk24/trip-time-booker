import { google } from 'googleapis'
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  WEBHOOK_DOMAIN,
} from '../config/app-config'
import { createAppLogger } from '../utils/logger'

const logger = createAppLogger('google-calendar')

export type Credentials = Parameters<
  InstanceType<(typeof google)['auth']['OAuth2']>['setCredentials']
>[0]

const createClient = async (credentials: Credentials) => {
  const oauth2Client = new google.auth.OAuth2({
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    redirectUri: '',
  })

  oauth2Client.setCredentials(credentials)

  const calendar = google.calendar({
    version: 'v3',
    auth: oauth2Client,
  })
  return calendar
}

export const registerWebhook = async (
  userId: string,
  credentials: Credentials
) => {
  logger.debug('Registering calendar webhook', { userId })

  const calendar = await createClient(credentials)

  const webhookURL = `${WEBHOOK_DOMAIN}/api/calendar-webhook`

  const { data } = await calendar.events.watch({
    calendarId: 'primary',
    requestBody: {
      id: 'main',
      token: userId,
      type: 'webhook',
      address: webhookURL,
    },
  })
  const { id, resourceId } = data

  logger.debug('Calendar webhook registered', {
    userId,
    webhookResouceId: resourceId,
    webhookURL,
    webhookId: id,
  })
  return { id, resourceId }
}

export const getJustChangedEvents = async (
  credentials: Credentials,
  userId: string
) => {
  const calendar = await createClient(credentials)

  const fiveMinBefore = new Date()
  fiveMinBefore.setMinutes(fiveMinBefore.getMinutes() - 5)

  const params = {
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    updatedMin: fiveMinBefore.toISOString(),
    showDeleted: false,
  }

  logger.debug('Getting recently changed events', { userId, ...params })
  const response = await calendar.events.list(params)
  const items = response.data.items || []
  logger.info('Got recently changed events', { count: items.length, userId })

  return items
}
