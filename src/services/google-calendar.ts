import { google } from 'googleapis'
import { backendEnv } from '../config/backend-env'
import { createAppLogger } from '../utils/logger'
import { encryptData } from '../utils/encryption'
import { frontendEnv } from '../config/frontend-env'

const WEBHOOK_DOMAIN =
  backendEnv.NODE_ENV === 'development'
    ? backendEnv.DEV_LOCAL_WEBHOOK_DOMAIN
    : frontendEnv.NEXT_PUBLIC_APP_DOMAIN

const logger = createAppLogger('google-calendar')

export type Credentials = Parameters<
  InstanceType<(typeof google)['auth']['OAuth2']>['setCredentials']
>[0]

type CalendarClient = ReturnType<(typeof google)['calendar']>

const FAILED_TO_UNREGISTER_WEBHOOK = `Failed to unregister calendar webhook`

export class GoogleCalendarService {
  client: CalendarClient

  userId: string

  constructor(credentials: Credentials, userId: string) {
    const oauth2Client = new google.auth.OAuth2({
      clientId: backendEnv.GOOGLE_CLIENT_ID,
      clientSecret: backendEnv.GOOGLE_CLIENT_SECRET,
      redirectUri: '',
    })

    oauth2Client.setCredentials(credentials)

    this.client = google.calendar({
      version: 'v3',
      auth: oauth2Client,
    })

    this.userId = userId
  }

  async registerWebhook() {
    logger.debug('Registering calendar webhook', { userId: this.userId })

    const webhookURL = `${WEBHOOK_DOMAIN}/api/calendar-webhook`

    const { data } = await this.client.events.watch({
      calendarId: 'primary',
      requestBody: {
        id: 'main',
        token: encryptData(this.userId),
        type: 'webhook',
        address: webhookURL,
      },
    })
    const { id, resourceId } = data

    logger.info('Calendar webhook registered', {
      userId: this.userId,
      webhookResouceId: resourceId,
      webhookURL,
      webhookId: id,
    })
    return { id, resourceId }
  }

  async unregisterWebhook(id: string, resourceId: string) {
    logger.debug('Unregistering calendar webhook', {
      userId: this.userId,
    })

    const { status, data } = await this.client.channels.stop({
      requestBody: {
        id,
        resourceId,
      },
    })
    if (status !== 204) {
      logger.error(FAILED_TO_UNREGISTER_WEBHOOK, {
        userId: this.userId,
        webhookResourceId: resourceId,
        webhookId: id,
        calendarApi: {
          statusCode: status,
          data,
        },
      })
      throw new Error(FAILED_TO_UNREGISTER_WEBHOOK)
    }

    logger.info('Successfully unregistered calendar webhook', {
      userId: this.userId,
      webhookResouceId: resourceId,
      webhookId: id,
    })
    return { id, resourceId }
  }

  async getJustChangedEvents() {
    const fiveMinBefore = new Date()
    fiveMinBefore.setMinutes(fiveMinBefore.getMinutes() - 5)

    logger.debug('Getting recently changed events', {
      userId: this.userId,
    })
    const response = await this.client.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      updatedMin: fiveMinBefore.toISOString(),
      showDeleted: false,
    })
    const items = response.data.items || []
    logger.info('Got recently changed events', {
      count: items.length,
      userId: this.userId,
    })

    return items
  }

  async createTripEvent(start: Date, end: Date, placeName: string) {
    const params = {
      start: {
        dateTime: start.toISOString(),
      },
      end: {
        dateTime: end.toISOString(),
      },
      summary: `Trip to the ${placeName}`,
      description: '\n---\nCreated by Trip Time Booker',
      reminders: {
        useDefault: true,
      },
    }

    logger.debug('Creating trip event', { userId: this.userId })

    await this.client.events.insert({
      calendarId: 'primary',
      requestBody: params,
    })

    logger.info('Successfully created trip event', {
      userId: this.userId,
    })
  }
}
