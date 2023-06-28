import UserMetadata from 'supertokens-node/recipe/usermetadata'
import { type Credentials } from './googleCalendar'

export const getCredentials = async (userId: string): Promise<Credentials> => {
  const { metadata } = await UserMetadata.getUserMetadata(userId)
  return { refresh_token: metadata.googleOAuthRefreshToken }
}
