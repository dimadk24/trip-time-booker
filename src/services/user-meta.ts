import UserMetadata from 'supertokens-node/recipe/usermetadata'

export const getCredentials = async (
  userId: string
): Promise<{ refresh_token: string }> => {
  const { metadata } = await UserMetadata.getUserMetadata(userId)
  return { refresh_token: metadata.googleOAuthRefreshToken }
}

export const getCalendarWebhookData = async (
  userId: string
): Promise<{
  calendarWebhookId: string | null
  calendarWebhookResourceId: string | null
}> => {
  const { metadata } = await UserMetadata.getUserMetadata(userId)
  return {
    calendarWebhookId: metadata.calendarWebhookId,
    calendarWebhookResourceId: metadata.calendarWebhookResourceId,
  }
}
