import { GoogleCalendarService } from './google-calendar'
import {
  getCalendarWebhookData,
  getCredentials,
  setUserMeta,
} from './user-meta'

export class UserServiceError extends Error {}

export async function watchCalendar(userId: string) {
  const { webhookStatus } = await getCalendarWebhookData(userId)

  if (webhookStatus === 'active') {
    throw new UserServiceError('Calendar webhook is already registered')
  }

  const credentials = await getCredentials(userId)
  const calendarClient = new GoogleCalendarService(credentials, userId)

  const { id, resourceId } = await calendarClient.registerWebhook()

  await setUserMeta(userId, {
    calendarWebhookId: id,
    calendarWebhookResourceId: resourceId,
    webhookStatus: 'active',
  })
}

export async function unwatchCalendar(userId: string) {
  const credentials = await getCredentials(userId)
  const { calendarWebhookId, calendarWebhookResourceId, webhookStatus } =
    await getCalendarWebhookData(userId)

  if (webhookStatus === 'not_active') {
    throw new UserServiceError('Webhook is not registered, cannot unregister')
  }

  if (!calendarWebhookId || !calendarWebhookResourceId) {
    throw new UserServiceError('Missing webhook id or webhook resouce id')
  }

  const calendarClient = new GoogleCalendarService(credentials, userId)

  await calendarClient.unregisterWebhook(
    calendarWebhookId,
    calendarWebhookResourceId
  )

  await setUserMeta(userId, {
    calendarWebhookId: null,
    calendarWebhookResourceId: null,
    webhookStatus: 'not_active',
  })
}
