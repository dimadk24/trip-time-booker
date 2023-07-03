import admin from 'firebase-admin'
import { backendEnv } from '../config/backend-env'
import { createAppLogger } from '../utils/logger'

const firebaseConfig = backendEnv.GOOGLE_FIREBASE_KEY

const logger = createAppLogger('firebase')

try {
  admin.initializeApp({
    // @ts-ignore
    credential: admin.credential.cert(firebaseConfig),
  })
} catch (error) {
  /*
   * We skip the "already exists" message which is
   * not an actual error when we're hot-reloading.
   */
  // @ts-ignore
  if (!/already exists/u.test(error?.message)) {
    logger.error(
      // @ts-ignore
      { errorStack: error?.stack },
      'Firebase admin initialization error'
    )
  }
}

export { admin as firebaseAdmin }
