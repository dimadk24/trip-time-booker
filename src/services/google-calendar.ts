import { type pino } from 'pino'
import { google } from 'googleapis'
import { backendEnv } from '../config/backend-env'
import { createAppLogger } from '../utils/logger'
import { encryptData } from '../utils/encryption'
import { frontendEnv } from '../config/frontend-env'
import { sendNotification } from './notifications'

const WEBHOOK_DOMAIN =
  backendEnv.NODE_ENV === 'development'
    ? backendEnv.DEV_LOCAL_WEBHOOK_DOMAIN
    : frontendEnv.NEXT_PUBLIC_APP_DOMAIN

const webhookURL = `${WEBHOOK_DOMAIN}/api/calendar-webhook`

const secondsInDay = 86400
const msInDay = secondsInDay * 1000
const webhookExpirationDays = 20 * msInDay

export type Credentials = Parameters<
  InstanceType<(typeof google)['auth']['OAuth2']>['setCredentials']
>[0]

type CalendarClient = ReturnType<(typeof google)['calendar']>

export type CalendarEvent = Awaited<
  ReturnType<InstanceType<typeof GoogleCalendarService>['getJustChangedEvents']>
>[number]

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

  async withPossibleAuthFailure<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn()
    } catch (e) {
      this.logger.debug(e, 'Request error')
      if (e instanceof Error && e.message.includes('invalid_grant')) {
        await sendNotification(
          `Need to login again, please open ${frontendEnv.NEXT_PUBLIC_APP_DOMAIN}?relogin=true`
        )
        this.logger.debug('Sent relogin notification')
      }
      throw e
    }
  }

  async registerWebhook() {
    this.logger.debug('Registering calendar webhook')

    const now = Date.now()
    const expiration = now + webhookExpirationDays

    const { data } = await this.withPossibleAuthFailure(() =>
      this.client.events.watch({
        calendarId: 'primary',
        requestBody: {
          id: webhookName,
          token: encryptData(this.userId),
          type: 'webhook',
          address: webhookURL,
          expiration: String(expiration),
        },
      })
    )
    const { id, resourceId } = data

    this.logger.info(
      {
        webhookResouceId: resourceId,
        webhookURL,
        webhookId: id,
        expiration,
      },
      'Calendar webhook registered'
    )
    return { id, resourceId }
  }

  async unregisterWebhook(id: string, resourceId: string) {
    this.logger.debug('Unregistering calendar webhook')

    const { status, data } = await this.withPossibleAuthFailure(() =>
      this.client.channels.stop({
        requestBody: {
          id,
          resourceId,
        },
      })
    )
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
    const response = await this.withPossibleAuthFailure(() =>
      this.client.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        updatedMin: fiveMinBefore.toISOString(),
        showDeleted: true,
      })
    )
    const items = response.data.items || []
    this.logger.info(`Got ${items.length} recently changed event(s)`)

    return items
  }

  async createTripEvent(
    start: Date,
    end: Date,
    placeName: string
  ): Promise<string> {
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

    const response = await this.withPossibleAuthFailure(() =>
      this.client.events.insert({
        calendarId: 'primary',
        requestBody: params,
      })
    )

    this.logger.info('Successfully created trip event')
    if (typeof response.data.id !== 'string') {
      this.logger.error(
        { id: response.data.id },
        'Not valid id for created trip event'
      )
      throw new Error('Not valid id for created trip event')
    }
    return response.data.id
  }

  async deleteTripEvent(id: string) {
    this.logger.debug({ tripEventId: id }, 'Deleting trip event')

    try {
      await this.withPossibleAuthFailure(() =>
        this.client.events.delete({
          calendarId: 'primary',
          eventId: id,
        })
      )
      this.logger.info({ tripEventId: id }, 'Deleted trip event')
    } catch (e) {
      if (e instanceof Error && e.message === 'Resource has been deleted') {
        this.logger.info({ tripEventId: id }, 'Trip event already deleted')
      } else {
        throw e
      }
    }
  }
}
