import UserMetadata from 'supertokens-node/recipe/usermetadata'
import { decryptData } from '../utils/encryption'

export const getCredentials = async (
  userId: string
): Promise<{ refresh_token: string }> => {
  const { metadata } = await UserMetadata.getUserMetadata(userId)
  return { refresh_token: decryptData(metadata.googleOAuthRefreshToken) }
}

export const getCalendarWebhookData = async (
  userId: string
): Promise<{
  calendarWebhookId: string | undefined
  calendarWebhookResourceId: string | undefined
}> => {
  const { metadata } = await UserMetadata.getUserMetadata(userId)
  return {
    calendarWebhookId: metadata.calendarWebhookId,
    calendarWebhookResourceId: metadata.calendarWebhookResourceId,
  }
}
