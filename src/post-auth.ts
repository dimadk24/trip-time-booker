import UserMetadata from 'supertokens-node/recipe/usermetadata'

import { Credentials } from './services/google-calendar'
import { encryptData } from './utils/encryption'
import { createAppLogger } from './utils/logger'

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

const logger = createAppLogger('post-auth')

export async function postAuth(
  userId: string,
  authCodeResponse: AuthCodeResponse
) {
  const credentials = convertAuthCodeResponse(authCodeResponse)
  const userLogger = logger.child({ userId })

  if (credentials.refresh_token) {
    await UserMetadata.updateUserMetadata(userId, {
      googleOAuthRefreshToken: encryptData(credentials.refresh_token),
    })
    userLogger.info('Set refresh token')
  } else {
    userLogger.debug('Subsequent user auth without refresh token')
  }
}
