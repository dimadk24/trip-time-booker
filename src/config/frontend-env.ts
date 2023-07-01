import { cleanEnv, str, url } from 'envalid'

const env = {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_APP_DOMAIN: process.env.NEXT_PUBLIC_APP_DOMAIN,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
}

export const frontendEnv = cleanEnv(env, {
  NODE_ENV: str({ choices: ['development', 'test', 'production'] }),

  NEXT_PUBLIC_APP_DOMAIN: url({ devDefault: 'http://localhost:3000' }),
  NEXT_PUBLIC_SENTRY_DSN: url(),
})
