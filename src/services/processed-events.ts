import {
  type CollectionReference,
  type DocumentSnapshot,
  type DocumentReference,
} from 'firebase-admin/firestore'
import { createAppLogger } from '../utils/logger'
import { backendEnv } from '../config/backend-env'
import { withSentrySpan } from '../utils/sentry'
import { hash } from '../utils/hasher'
import { CalendarEvent } from './google-calendar'
import { getUsersCollection } from './user-meta'

export type ProcessedEvent =
  | {
      processed: true
      tripEventId: string
      deleted: false
      hash: string
    }
  | {
      processed: true
      tripEventId: null
      deleted: true
      hash: string
    }

const PROCESSED_EVENTS_COLLECTION =
  backendEnv.NODE_ENV === 'production'
    ? 'processed-events'
    : 'dev-processed-events'

const logger = createAppLogger('user-meta.processed-events')

export const createEventHash = (event: CalendarEvent) => {
  if (!event.start?.dateTime) {
    throw new Error(`start.dateTime does not exist for the event ${event.id}`)
  }
  const deleted = event.status === 'cancelled'
  const string = [event.start.dateTime, event.location, String(deleted)].join(
    '-'
  )
  return hash(string)
}

const getEventsCollection = (userId: string) => {
  return getUsersCollection()
    .doc(userId)
    .collection(
      PROCESSED_EVENTS_COLLECTION
    ) as CollectionReference<ProcessedEvent>
}

export const getEventDoc = async (
  userId: string,
  event: CalendarEvent
): Promise<{
  eventRef: DocumentReference<ProcessedEvent>
  doc: DocumentSnapshot<ProcessedEvent>
}> => {
  if (!event.id) {
    throw new Error('No id for event')
  }

  const userLogger = logger.child({ userId })
  userLogger.debug('Getting event doc from firestore')

  const eventRef = getEventsCollection(userId).doc(hash(event.id))
  const doc = await withSentrySpan(
    () => eventRef.get(),
    'processed-events',
    'get event'
  )

  userLogger.info('Got event doc from firestore')
  return { eventRef, doc }
}
