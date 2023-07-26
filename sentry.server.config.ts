// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'
import { ProfilingIntegration } from '@sentry/profiling-node'
import { frontendEnv } from './src/config/frontend-env'
import { createAppLogger } from './src/utils/logger'
// during build nextjs imports this file in frontend
// therefore need to use frontend env, not backend

if (frontendEnv.NEXT_PUBLIC_SENTRY_DSN) {
  const logger = createAppLogger('sentry-server')
  Sentry.init({
    dsn: frontendEnv.NEXT_PUBLIC_SENTRY_DSN,

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 1,

    profilesSampleRate: 1.0, // Profiling sample rate is relative to tracesSampleRate
    integrations: [
      // Add profiling integration to list of integrations
      new ProfilingIntegration(),
    ],

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: frontendEnv.NEXT_PUBLIC_SERVER_SENTRY_DEBUG,

    beforeBreadcrumb(breadcrumb) {
      if (
        breadcrumb.type === 'http' &&
        breadcrumb.data &&
        breadcrumb.data['http.query'] &&
        breadcrumb.data.url.includes('maps/api/distancematrix/')
      ) {
        breadcrumb.data['http.query'] = '**filtered**'
        logger.debug({}, 'Removed http query data from sentry breadcrumbs')
      }
      return breadcrumb
    },
  })
}
