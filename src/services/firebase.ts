import admin from 'firebase-admin'
import { GOOGLE_FIREBASE_KEY } from '../config/app-config'

const firebaseConfig = GOOGLE_FIREBASE_KEY

try {
  admin.initializeApp({
    // @ts-ignore
    credential: admin.credential.cert(JSON.parse(firebaseConfig)),
  })
} catch (error) {
  /*
   * We skip the "already exists" message which is
   * not an actual error when we're hot-reloading.
   */
  // @ts-ignore
  if (!/already exists/u.test(error?.message)) {
    // @ts-ignore
    console.error('Firebase admin initialization error', error?.stack)
  }
}

export { admin as firebaseAdmin }
