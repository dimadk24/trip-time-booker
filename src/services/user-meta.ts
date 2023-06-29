import UserMetadata from 'supertokens-node/recipe/usermetadata'

export const getCredentials = async (
  userId: string
): Promise<{ refresh_token: string }> => {
  const { metadata } = await UserMetadata.getUserMetadata(userId)
  return { refresh_token: metadata.googleOAuthRefreshToken }
}
