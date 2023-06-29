declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT?: string
      LOG_LEVEL: string
      NODE_ENV: 'development' | 'production' | 'test'

      GOOGLE_CLIENT_ID: string
      GOOGLE_CLIENT_SECRET: string
      SUPERTOKENS_CONNECTION_URI: string
      SUPERTOKENS_API_KEY: string
      NEXT_PUBLIC_DOMAIN: string

      GOOGLE_MAPS_API_KEY: string
      GOOGLE_CALENDAR_API_KEY: string
      GOOGLE_FIREBASE_KEY: string

      DEV_LOCAL_WEBHOOK_DOMAIN?: string
      HOME_LOCATION: string
    }
  }
}

export {}
