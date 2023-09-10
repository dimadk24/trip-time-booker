import './_load-env'
import '../sentry.server.config'
import * as Sentry from '@sentry/nextjs'
import { getUsersCollection } from '@/src/services/user-meta'
import { unwatchCalendar, watchCalendar } from '@/src/services/user-service'
import { createAppLogger } from '@/src/utils/logger'

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

refreshWebhookRegistration().catch((err) => {
  logger.error(err)
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
})
