export const PUBLIC_APP_DOMAIN = process.env.NEXT_PUBLIC_DOMAIN

export const {
  SUPERTOKENS_CONNECTION_URI,
  SUPERTOKENS_API_KEY,

  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,

  GOOGLE_CALENDAR_API_KEY,
  GOOGLE_MAPS_API_KEY,
} = process.env

export const WEBHOOK_DOMAIN = (
  process.env.NODE_ENV === 'development'
    ? process.env.DEV_LOCAL_WEBHOOK_DOMAIN
    : PUBLIC_APP_DOMAIN
) as string