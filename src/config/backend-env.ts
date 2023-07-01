import { bool, cleanEnv, json, port, str, url } from 'envalid'

export const backendEnv = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'test', 'production'] }),
  PORT: port(),

  SUPERTOKENS_CONNECTION_URI: url(),
  SUPERTOKENS_API_KEY: str(),
  GOOGLE_CLIENT_ID: str(),
  GOOGLE_CLIENT_SECRET: str(),
  GOOGLE_FIREBASE_KEY: json(),
  GOOGLE_CALENDAR_API_KEY: str(),
  GOOGLE_MAPS_API_KEY: str(),
  LOGTAIL_TOKEN: str(),
  LOG_LEVEL: str({
    choices: ['DEBUG', 'INFO', 'WARN', 'ERROR'],
    default: 'INFO',
  }),
  HOME_LOCATION: str(),
  SECRET_KEY: str(),
  SECRET_INIT_VECTOR: str(),
  SERVER_SENTRY_DEBUG: bool(),

  DEV_LOCAL_WEBHOOK_DOMAIN: url({ default: '' }),

  NEXT_PUBLIC_APP_DOMAIN: url({ devDefault: 'http://localhost:3000' }),
  NEXT_PUBLIC_SENTRY_DSN: url(),
})
