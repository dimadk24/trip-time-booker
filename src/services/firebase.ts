import firebase from 'firebase-admin'
import { backendEnv } from '../config/backend-env'

const firebaseConfig = backendEnv.GOOGLE_FIREBASE_KEY

try {
  firebase.initializeApp({
    credential: firebase.credential.cert(firebaseConfig),
  })
} catch (error) {
  /*
   * We skip the "already exists" message which is
   * not an actual error when we're hot-reloading.
   */
  // @ts-ignore
  if (!/already exists/u.test(error?.message)) {
    throw error
  }
}

export { firebase }
