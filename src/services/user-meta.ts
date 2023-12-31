import { type CollectionReference } from 'firebase-admin/firestore'
import { decryptData } from '../utils/encryption'
import { createAppLogger } from '../utils/logger'
import { backendEnv } from '../config/backend-env'
import { withSentrySpan } from '../utils/sentry'
import { WebhookStatus } from '../types'
import { firestore } from './firestore'

type UserMetaData = {
  googleOAuthRefreshToken: string | null
  calendarWebhookId: string | null
  calendarWebhookResourceId: string | null
  webhookStatus: WebhookStatus | null
  homeLocation: string | null
}

const initialData: UserMetaData = {
  googleOAuthRefreshToken: null,
  calendarWebhookId: null,
  calendarWebhookResourceId: null,
  webhookStatus: 'not_active',
  homeLocation: '',
}

export const USERS_COLLECTIONS =
  backendEnv.NODE_ENV === 'production' ? 'users' : 'dev-users'

const logger = createAppLogger('user-meta')

export const getUsersCollection = () => {
  return firestore.collection(
    USERS_COLLECTIONS
  ) as CollectionReference<UserMetaData>
}

export const getUserMeta = async (userId: string): Promise<UserMetaData> => {
  return withSentrySpan(
    async () => {
      const userLogger = logger.child({ userId })
      userLogger.trace('Getting user meta')

      const doc = getUsersCollection().doc(userId)
      const docRef = await doc.get()
      if (!docRef.exists) {
        await doc.set(initialData)
        userLogger.trace('UserMeta doc did not exist, created')
        return initialData
      }
      userLogger.trace('Got user meta')
      return docRef.data() as UserMetaData
    },
    'user-meta',
    'get user meta'
  )
}

export const setUserMeta = async (
  userId: string,
  data: Partial<UserMetaData>
) => {
  const userLogger = logger.child({ userId })
  userLogger.trace('Setting user meta')

  await withSentrySpan(
    () => getUsersCollection().doc(userId).set(data, { merge: true }),
    'user-meta',
    'set user meta'
  )

  userLogger.trace('Set user meta')
}

export const getCredentials = async (
  userId: string
): Promise<{ refresh_token: string }> => {
  const metadata = await getUserMeta(userId)
  if (!metadata.googleOAuthRefreshToken) {
    const NO_REFRESH_TOKEN = 'No google refresh token in user meta'
    throw new Error(NO_REFRESH_TOKEN)
  }
  return { refresh_token: decryptData(metadata.googleOAuthRefreshToken) }
}

export const getCalendarWebhookData = async (
  userId: string
): Promise<{
  calendarWebhookId: string | null
  calendarWebhookResourceId: string | null
  webhookStatus: WebhookStatus | null
}> => {
  const metadata = await getUserMeta(userId)
  return {
    calendarWebhookId: metadata.calendarWebhookId,
    calendarWebhookResourceId: metadata.calendarWebhookResourceId,
    webhookStatus: metadata.webhookStatus,
  }
}
