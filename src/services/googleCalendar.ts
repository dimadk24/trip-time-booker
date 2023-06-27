import { google } from 'googleapis'
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  WEBHOOK_DOMAIN,
} from '../config/appConfig'

export type Credentials = Parameters<
  InstanceType<(typeof google)['auth']['OAuth2']>['setCredentials']
>[0]

const createClient = async (credentials: Credentials) => {
  const oauth2Client = new google.auth.OAuth2({
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    redirectUri: '',
  })

  oauth2Client.setCredentials(credentials)

  const calendar = google.calendar({
    version: 'v3',
    auth: oauth2Client,
  })
  return calendar
}

export const registerWebhook = async (credentials: Credentials) => {
  const calendar = await createClient(credentials)

  const { data } = await calendar.events.watch({
    calendarId: 'primary',
    requestBody: {
      id: 'main',
      token: 'webhook-secret-key',
      type: 'webhook',
      address: `${WEBHOOK_DOMAIN}/api/calendar_webhook`,
    },
  })
  const { id, resourceId } = data
  return { id, resourceId }
}
