declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT?: string
      LOG_LEVEL: string
      NODE_ENV: 'development' | 'production' | 'test'
      SECRET_KEY: string
      SECRET_INIT_VECTOR: string

      GOOGLE_CLIENT_ID: string
      GOOGLE_CLIENT_SECRET: string
      SUPERTOKENS_CONNECTION_URI: string
      SUPERTOKENS_API_KEY: string
      NEXT_PUBLIC_DOMAIN: string
      NEXT_PUBLIC_SENTRY_DSN: string
      SERVER_SENTRY_DEBUG: '1' | '0' | ''

      GOOGLE_MAPS_API_KEY: string
      GOOGLE_CALENDAR_API_KEY: string
      GOOGLE_FIREBASE_KEY: string
      LOGTAIL_TOKEN: string

      DEV_LOCAL_WEBHOOK_DOMAIN?: string
      HOME_LOCATION: string
    }
  }
}

export {}
