import { backendEnv } from '../config/backend-env'

export async function sendNotification(message: string) {
  await fetch(
    `https://ntfy.sh/dimadk24-trip-time-booker-${backendEnv.NTFY_KEY}`,
    {
      method: 'POST',
      body: message,
    }
  )
}
