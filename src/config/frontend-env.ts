import { bool, cleanEnv, str, url } from 'envalid'

const env = {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_APP_DOMAIN: process.env.NEXT_PUBLIC_APP_DOMAIN,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  NEXT_PUBLIC_SERVER_SENTRY_DEBUG: process.env.NEXT_PUBLIC_SERVER_SENTRY_DEBUG,
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
}

export const frontendEnv = cleanEnv(env, {
  NODE_ENV: str({ choices: ['development', 'test', 'production'] as const }),

  NEXT_PUBLIC_APP_DOMAIN: url({ devDefault: 'http://localhost:3000' }),
  NEXT_PUBLIC_SENTRY_DSN: url({ devDefault: '' }),
  NEXT_PUBLIC_SERVER_SENTRY_DEBUG: bool({ default: false }),
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: str(),
})
