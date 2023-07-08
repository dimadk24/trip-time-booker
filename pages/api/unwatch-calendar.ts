import type { NextApiRequest } from 'next'
import { superTokensNextWrapper } from 'supertokens-node/nextjs'
import { verifySession } from 'supertokens-node/recipe/session/framework/express'
import supertokens from 'supertokens-node'
import { type SessionRequest } from 'supertokens-node/framework/express'
import { type Response } from 'express'
import { getBackendConfig } from '@/src/config/supertokens/backend-config'
import {
  getCalendarWebhookData,
  getCredentials,
  setUserMeta,
} from '@/src/services/user-meta'
import { GoogleCalendarService } from '@/src/services/google-calendar'
import { setSentryUser } from '@/src/utils/sentry'

type ResponseData = {
  message: string
}

supertokens.init(getBackendConfig())

export default async function watchCalendar(
  req: NextApiRequest & SessionRequest,
  res: Response<ResponseData>
) {
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

  const credentials = await getCredentials(userId)
  const { calendarWebhookId, calendarWebhookResourceId } =
    await getCalendarWebhookData(userId)

  if (!calendarWebhookId || !calendarWebhookResourceId) {
    return res
      .status(400)
      .json({ message: 'Webhook is not registered, cannot unregister' })
  }

  const calendarClient = new GoogleCalendarService(credentials, userId)

  await calendarClient.unregisterWebhook(
    calendarWebhookId,
    calendarWebhookResourceId
  )

  await setUserMeta(userId, {
    calendarWebhookId: null,
    calendarWebhookResourceId: null,
  })

  res.status(200).json({ message: 'OK' })
}
