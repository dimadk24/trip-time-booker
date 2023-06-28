import { google } from 'googleapis'
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  WEBHOOK_DOMAIN,
} from '../config/app-config'

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

export const registerWebhook = async (
  userId: string,
  credentials: Credentials
) => {
  const calendar = await createClient(credentials)

  const { data } = await calendar.events.watch({
    calendarId: 'primary',
    requestBody: {
      id: 'main',
      token: userId,
      type: 'webhook',
      address: `${WEBHOOK_DOMAIN}/api/calendar_webhook`,
    },
  })
  const { id, resourceId } = data
  return { id, resourceId }
}

export const getJustCreatedEvents = async (credentials: Credentials) => {
  const calendar = await createClient(credentials)

  const fiveMinBefore = new Date()
  fiveMinBefore.setMinutes(fiveMinBefore.getMinutes() - 5)

  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    updatedMin: fiveMinBefore.toISOString(),
    showDeleted: false,
  })
  return response.data.items || []
}
