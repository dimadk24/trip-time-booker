/* eslint-disable no-console */
import './_load-env'
import '../sentry.server.config'
import axios from 'axios'
import * as Sentry from '@sentry/nextjs'
import { getUsersCollection } from '@/src/services/user-meta'
import { unwatchCalendar, watchCalendar } from '@/src/services/user-service'
import { createAppLogger } from '@/src/utils/logger'
import { backendEnv } from '@/src/config/backend-env'

const logger = createAppLogger('refresh-webhook')

async function refreshWebhookRegistration() {
  const transaction = Sentry.startTransaction({ name: 'refresh-webhooks' })
  Sentry.getCurrentHub().configureScope((scope) => scope.setSpan(transaction))

  logger.debug('Start refreshing webhooks')
  const users = await getUsersCollection()
    .where('webhookStatus', '==', 'active')
    .get()

  const userIds: string[] = []
  users.forEach((user) => {
    userIds.push(user.id)
  })

  const promises = userIds.map(async (userId) => {
    await unwatchCalendar(userId)
    await watchCalendar(userId)
  })

  await Promise.all(promises)

  logger.info('Refreshed webhooks for %d user(s)', userIds.length)
  transaction.finish()
}

let exitCode = 0

refreshWebhookRegistration()
  .catch((err) => {
    logger.error(err)
    console.error(err)
    exitCode = 1
  })
  .finally(() => {
    axios
      .get(`https://hc-ping.com/${backendEnv.REFRESH_WEBHOOK_HEALTLCHECK_ID}`)
      .catch((err) => {
        logger.error({ err }, 'Healthchecks ping failed')
        console.error('Healthchecks ping failed', err)
      })
      .finally(() => {
        process.exit(exitCode)
      })
  })
