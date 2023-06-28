import UserMetadata from 'supertokens-node/recipe/usermetadata'

import { Credentials, registerWebhook } from './services/googleCalendar'

type AuthCodeResponse = {
  access_token: string
  refresh_token: string
  expires_in: number
  scope: string
  token_type: string
  id_token: string
}

const convertAuthCodeResponse = (
  authCodeResponse: AuthCodeResponse
): Credentials => ({
  access_token: authCodeResponse.access_token,
  refresh_token: authCodeResponse.refresh_token,
  expiry_date: authCodeResponse.expires_in,
  scope: authCodeResponse.scope,
  token_type: authCodeResponse.token_type,
  id_token: authCodeResponse.id_token,
})

export async function postAuth(
  userId: string,
  authCodeResponse: AuthCodeResponse
) {
  const credentials = convertAuthCodeResponse(authCodeResponse)

  await UserMetadata.updateUserMetadata(userId, {
    googleOAuthRefreshToken: credentials.refresh_token,
  })

  const { id, resourceId } = await registerWebhook(userId, credentials)

  await UserMetadata.updateUserMetadata(userId, {
    calendarWebhookId: id,
    calendarWebhookResourceId: resourceId,
  })
}
