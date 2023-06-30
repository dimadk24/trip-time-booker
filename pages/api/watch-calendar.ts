import { getBackendConfig } from '@/src/config/supertokens/backend-config'
import { GoogleCalendarService } from '@/src/services/google-calendar'
import { getCredentials } from '@/src/services/user-meta'
import { type Response } from 'express'
import type { NextApiRequest } from 'next'
import supertokens from 'supertokens-node'
import { type SessionRequest } from 'supertokens-node/framework/express'
import { superTokensNextWrapper } from 'supertokens-node/nextjs'
import { verifySession } from 'supertokens-node/recipe/session/framework/express'
import UserMetadata from 'supertokens-node/recipe/usermetadata'

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

  const credentials = await getCredentials(userId)
  const calendarClient = new GoogleCalendarService(credentials, userId)

  const { id, resourceId } = await calendarClient.registerWebhook()

  await UserMetadata.updateUserMetadata(userId, {
    calendarWebhookId: id,
    calendarWebhookResourceId: resourceId,
  })

  res.status(200).json({ message: 'OK' })
}
