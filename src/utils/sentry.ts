import * as Sentry from '@sentry/nextjs'
import { frontendEnv } from '../config/frontend-env'

const getSentryTransaction = () => {
  const transaction = Sentry.getCurrentHub().getScope().getTransaction()
  if (!transaction) {
    throw new Error('No sentry transaction')
  }
  return transaction
}

export const withSentrySpan = async <T>(
  fn: () => Promise<T>,
  spanOp: string,
  spanDescription: string
): Promise<T> => {
  if (!frontendEnv.NEXT_PUBLIC_SENTRY_DSN) {
    return fn()
  }
  const transaction = getSentryTransaction()
  const span = transaction.startChild({
    op: spanOp,
    description: spanDescription,
  })

  try {
    return await fn()
  } finally {
    span.finish()
  }
}
