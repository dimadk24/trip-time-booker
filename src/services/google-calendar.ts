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

type CalendarClient = ReturnType<(typeof google)['calendar']>

export class GoogleCalendarService {
  client: CalendarClient

  constructor(credentials: Credentials) {
    const oauth2Client = new google.auth.OAuth2({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      redirectUri: '',
    })

    oauth2Client.setCredentials(credentials)

    this.client = google.calendar({
      version: 'v3',
      auth: oauth2Client,
    })
  }

  async registerWebhook(userId: string) {
    logger.debug('Registering calendar webhook', { userId })

    const webhookURL = `${WEBHOOK_DOMAIN}/api/calendar-webhook`

    const { data } = await this.client.events.watch({
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

  async getJustChangedEvents(userId: string) {
    const fiveMinBefore = new Date()
    fiveMinBefore.setMinutes(fiveMinBefore.getMinutes() - 5)

    const params = {
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      updatedMin: fiveMinBefore.toISOString(),
      showDeleted: false,
    }

    logger.debug('Getting recently changed events', { userId, ...params })
    const response = await this.client.events.list(params)
    const items = response.data.items || []
    logger.info('Got recently changed events', { count: items.length, userId })

    return items
  }
}
