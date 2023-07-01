// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'
import { backendEnv } from './src/config/backend-env'

if (backendEnv.NEXT_PUBLIC_SENTRY_DSN)
  Sentry.init({
    dsn: backendEnv.NEXT_PUBLIC_SENTRY_DSN,

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 0.2,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
  })
