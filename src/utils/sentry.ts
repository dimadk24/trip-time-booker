import * as Sentry from '@sentry/nextjs'
import { createAppLogger } from './logger'

const logger = createAppLogger('sentry')

export const getSentryTransaction = () => {
  const transaction = Sentry.getCurrentHub().getScope().getTransaction()
  if (!transaction) {
    logger.error('No Sentry transaction')
    throw new Error('No sentry transaction')
  }
  return transaction
}
