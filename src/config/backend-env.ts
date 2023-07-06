import { cleanEnv, json, str, url } from 'envalid'
import { pino } from 'pino'

type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'
const logLevels = Object.values(pino.levels.labels) as LogLevel[]

export const backendEnv = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'test', 'production'] as const }),

  SUPERTOKENS_CONNECTION_URI: url(),
  SUPERTOKENS_API_KEY: str(),
  GOOGLE_CLIENT_ID: str(),
  GOOGLE_CLIENT_SECRET: str(),
  GOOGLE_FIREBASE_KEY: json<Record<string, unknown>>(),
  GOOGLE_CALENDAR_API_KEY: str(),
  GOOGLE_MAPS_API_KEY: str(),
  LOGTAIL_TOKEN: str({ devDefault: '' }),
  LOG_LEVEL: str({
    choices: logLevels,
    default: 'info',
  }),
  HOME_LOCATION: str(),
  SECRET_KEY: str(),
  SECRET_INIT_VECTOR: str(),

  DEV_LOCAL_WEBHOOK_DOMAIN: url({ default: '' }),
})
