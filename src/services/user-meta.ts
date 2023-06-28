import UserMetadata from 'supertokens-node/recipe/usermetadata'
import { type Credentials } from './google-calendar'

export const getCredentials = async (userId: string): Promise<Credentials> => {
  const { metadata } = await UserMetadata.getUserMetadata(userId)
  return { refresh_token: metadata.googleOAuthRefreshToken }
}
