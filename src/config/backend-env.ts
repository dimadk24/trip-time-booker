import { cleanEnv, json, port, str, url } from 'envalid'
import winston from 'winston'

type LogLevel =
  | 'error'
  | 'warn'
  | 'info'
  | 'http'
  | 'verbose'
  | 'debug'
  | 'silly'

export const backendEnv = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'test', 'production'] as const }),
  PORT: port(),

  SUPERTOKENS_CONNECTION_URI: url(),
  SUPERTOKENS_API_KEY: str(),
  GOOGLE_CLIENT_ID: str(),
  GOOGLE_CLIENT_SECRET: str(),
  GOOGLE_FIREBASE_KEY: json<Record<string, unknown>>(),
  GOOGLE_CALENDAR_API_KEY: str(),
  GOOGLE_MAPS_API_KEY: str(),
  LOGTAIL_TOKEN: str(),
  LOG_LEVEL: str({
    choices: Object.keys(winston.config.npm.levels) as LogLevel[],
    default: 'info',
  }),
  HOME_LOCATION: str(),
  SECRET_KEY: str(),
  SECRET_INIT_VECTOR: str(),

  DEV_LOCAL_WEBHOOK_DOMAIN: url({ default: '' }),

  NEXT_PUBLIC_APP_DOMAIN: url({ devDefault: 'http://localhost:3000' }),
  NEXT_PUBLIC_SENTRY_DSN: url(),
})
