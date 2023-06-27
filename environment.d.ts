declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT?: string
      NODE_ENV: 'development' | 'production' | 'test'

      GOOGLE_CLIENT_ID: string
      GOOGLE_CLIENT_SECRET: string
      SUPERTOKENS_CONNECTION_URI: string
      SUPERTOKENS_API_KEY: string
      NEXT_PUBLIC_DOMAIN: string

      GOOGLE_MAPS_API_KEY: string
    }
  }
}

export {}
