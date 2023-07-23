import { type Response } from 'express'
import type { NextApiRequest } from 'next'
import supertokens from 'supertokens-node'
import { type SessionRequest } from 'supertokens-node/framework/express'
import { superTokensNextWrapper } from 'supertokens-node/nextjs'
import { verifySession } from 'supertokens-node/recipe/session/framework/express'
import { getBackendConfig } from '@/src/config/supertokens/backend-config'
import {
  getCalendarWebhookData,
  getCredentials,
  setUserMeta,
} from '@/src/services/user-meta'
import { GoogleCalendarService } from '@/src/services/google-calendar'
import { createAppLogger } from '@/src/utils/logger'
import { setSentryUser } from '@/src/utils/sentry'

type ResponseData = {
  message: string
}

const logger = createAppLogger('watch-calendar')

supertokens.init(getBackendConfig())

export default async function watchCalendar(
  req: NextApiRequest & SessionRequest,
  res: Response<ResponseData>
) {
  if (req.method !== 'POST')
    return res.status(400).json({ message: 'Wrong method, use POST' })
  await superTokensNextWrapper(
    async (next) => {
      return verifySession()(req, res, next)
    },
    req,
    res
  )
  if (!req.session)
    return res.status(400).json({ message: 'No session provided' })

  const userId = req.session.getUserId()
  setSentryUser(userId)

  const { webhookStatus } = await getCalendarWebhookData(userId)

  if (webhookStatus === 'active') {
    logger.warn(
      "Trying to register calendar webhook while it's already registered"
    )
    return res.status(400).json({
      message: 'Calendar webhook is already registered. Unregister it first',
    })
  }

  const credentials = await getCredentials(userId)
  const calendarClient = new GoogleCalendarService(credentials, userId)

  const { id, resourceId } = await calendarClient.registerWebhook()

  await setUserMeta(userId, {
    calendarWebhookId: id,
    calendarWebhookResourceId: resourceId,
    webhookStatus: 'active',
  })

  res.status(200).json({ message: 'OK' })
}
