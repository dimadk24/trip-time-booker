import type { NextApiRequest } from 'next'
import { superTokensNextWrapper } from 'supertokens-node/nextjs'
import { verifySession } from 'supertokens-node/recipe/session/framework/express'
import supertokens from 'supertokens-node'
import { type SessionRequest } from 'supertokens-node/framework/express'
import { type Response } from 'express'
import { getBackendConfig } from '@/src/config/supertokens/backend-config'
import { setSentryUser } from '@/src/utils/sentry'
import { UserServiceError, unwatchCalendar } from '@/src/services/user-service'

type ResponseData = {
  message: string
}

supertokens.init(getBackendConfig())

export default async function unwatchCalendarRoute(
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

  try {
    await unwatchCalendar(userId)
  } catch (e) {
    if (e instanceof UserServiceError)
      return res.status(400).json({ message: e.message })
    else throw e
  }

  return res.status(200).json({ message: 'OK' })
}
