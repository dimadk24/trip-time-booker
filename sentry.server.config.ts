// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'
import { frontendEnv } from './src/config/frontend-env'
// during build nextjs imports this file in frontend
// therefore need to use frontend env, not backend

if (frontendEnv.NEXT_PUBLIC_SENTRY_DSN)
  Sentry.init({
    dsn: frontendEnv.NEXT_PUBLIC_SENTRY_DSN,

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 1,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: frontendEnv.NEXT_PUBLIC_SERVER_SENTRY_DEBUG,
  })
