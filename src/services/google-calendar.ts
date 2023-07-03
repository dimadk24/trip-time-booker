import { type pino } from 'pino'
import { google } from 'googleapis'
import { backendEnv } from '../config/backend-env'
import { createAppLogger } from '../utils/logger'
import { encryptData } from '../utils/encryption'
import { frontendEnv } from '../config/frontend-env'

const WEBHOOK_DOMAIN =
  backendEnv.NODE_ENV === 'development'
    ? backendEnv.DEV_LOCAL_WEBHOOK_DOMAIN
    : frontendEnv.NEXT_PUBLIC_APP_DOMAIN

export type Credentials = Parameters<
  InstanceType<(typeof google)['auth']['OAuth2']>['setCredentials']
>[0]

type CalendarClient = ReturnType<(typeof google)['calendar']>

const FAILED_TO_UNREGISTER_WEBHOOK = `Failed to unregister calendar webhook`
const webhookName = backendEnv.NODE_ENV === 'production' ? 'main' : 'dev-main'

export class GoogleCalendarService {
  client: CalendarClient

  userId: string

  logger: pino.BaseLogger

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
    const logger = createAppLogger('google-calendar')
    this.logger = logger.child({ userId })
  }

  async registerWebhook() {
    this.logger.debug('Registering calendar webhook')

    const webhookURL = `${WEBHOOK_DOMAIN}/api/calendar-webhook`

    const { data } = await this.client.events.watch({
      calendarId: 'primary',
      requestBody: {
        id: webhookName,
        token: encryptData(this.userId),
        type: 'webhook',
        address: webhookURL,
      },
    })
    const { id, resourceId } = data

    this.logger.info(
      {
        webhookResouceId: resourceId,
        webhookURL,
        webhookName,
        webhookId: id,
      },
      'Calendar webhook registered'
    )
    return { id, resourceId }
  }

  async unregisterWebhook(id: string, resourceId: string) {
    this.logger.debug('Unregistering calendar webhook')

    const { status, data } = await this.client.channels.stop({
      requestBody: {
        id,
        resourceId,
      },
    })
    if (status !== 204) {
      this.logger.error(
        {
          webhookResourceId: resourceId,
          webhookId: id,
          calendarApi: {
            statusCode: status,
            data,
          },
        },
        FAILED_TO_UNREGISTER_WEBHOOK
      )
      throw new Error(FAILED_TO_UNREGISTER_WEBHOOK)
    }

    this.logger.info(
      {
        webhookResouceId: resourceId,
        webhookId: id,
      },
      'Successfully unregistered calendar webhook'
    )
    return { id, resourceId }
  }

  async getJustChangedEvents() {
    const fiveMinBefore = new Date()
    fiveMinBefore.setMinutes(fiveMinBefore.getMinutes() - 5)

    this.logger.debug('Getting recently changed events')
    const response = await this.client.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      updatedMin: fiveMinBefore.toISOString(),
      showDeleted: false,
    })
    const items = response.data.items || []
    this.logger.info(`Got ${items.length} recently changed events`)

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

    this.logger.debug('Creating trip event')

    await this.client.events.insert({
      calendarId: 'primary',
      requestBody: params,
    })

    this.logger.info('Successfully created trip event')
  }
}
