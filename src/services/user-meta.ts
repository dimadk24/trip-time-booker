import { type CollectionReference } from 'firebase-admin/firestore'
import { decryptData } from '../utils/encryption'
import { createAppLogger } from '../utils/logger'
import { backendEnv } from '../config/backend-env'
import { getSentryTransaction } from '../utils/sentry'
import { firestore } from './firestore'

type UserMetaData = {
  googleOAuthRefreshToken: string | null
  calendarWebhookId: string | null
  calendarWebhookResourceId: string | null
}

const initialData = {
  googleOAuthRefreshToken: null,
  calendarWebhookId: null,
  calendarWebhookResourceId: null,
}

const USERS_COLLECTIONS =
  backendEnv.NODE_ENV === 'production' ? 'users' : 'dev-users'

const logger = createAppLogger('user-meta')

const getUsersCollection = () => {
  return firestore.collection(
    USERS_COLLECTIONS
  ) as CollectionReference<UserMetaData>
}

export const getUserMeta = async (userId: string): Promise<UserMetaData> => {
  const userLogger = logger.child({ userId })

  const transaction = getSentryTransaction()

  const span = transaction.startChild({
    op: 'user-meta',
    description: 'get user meta',
  })
  userLogger.debug('Getting user meta')
  const doc = getUsersCollection().doc(userId)
  const docRef = await doc.get()
  if (!docRef.exists) {
    await doc.set(initialData)
    span.finish()
    userLogger.info('UserMeta doc did not exist, created')
    return initialData
  }
  span.finish()
  userLogger.info('Got user meta')
  return docRef.data() as UserMetaData
}

export const setUserMeta = async (
  userId: string,
  data: Partial<UserMetaData>
) => {
  const userLogger = logger.child({ userId })
  userLogger.debug('Setting user meta')

  const transaction = getSentryTransaction()
  const span = transaction.startChild({
    op: 'user-meta',
    description: 'set user meta',
  })

  await getUsersCollection().doc(userId).set(data, { merge: true })

  span.finish()
  userLogger.info('Set user meta')
}

export const getCredentials = async (
  userId: string
): Promise<{ refresh_token: string }> => {
  const metadata = await getUserMeta(userId)
  if (!metadata.googleOAuthRefreshToken) {
    const NO_REFRESH_TOKEN = 'No google refresh token in user meta'
    logger.error({ userId }, NO_REFRESH_TOKEN)
    throw new Error(NO_REFRESH_TOKEN)
  }
  return { refresh_token: decryptData(metadata.googleOAuthRefreshToken) }
}

export const getCalendarWebhookData = async (
  userId: string
): Promise<{
  calendarWebhookId: string | null
  calendarWebhookResourceId: string | null
}> => {
  const metadata = await getUserMeta(userId)
  return {
    calendarWebhookId: metadata.calendarWebhookId,
    calendarWebhookResourceId: metadata.calendarWebhookResourceId,
  }
}
