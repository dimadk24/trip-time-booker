import type { NextApiRequest } from 'next'
import { superTokensNextWrapper } from 'supertokens-node/nextjs'
import { verifySession } from 'supertokens-node/recipe/session/framework/express'
import { type SessionRequest } from 'supertokens-node/framework/express'
import { type Response } from 'express'
import supertokens from 'supertokens-node'
import { WebhookStatus, getUserMeta } from '@/src/services/user-meta'
import { setSentryUser } from '@/src/utils/sentry'
import { getBackendConfig } from '@/src/config/supertokens/backend-config'

type ResponseData =
  | {
      error: false
      data: {
        id: string
        webhookStatus: WebhookStatus
      }
    }
  | {
      error: true
      message: string
    }

supertokens.init(getBackendConfig())

export default async function userApi(
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
    return res.status(400).json({ error: true, message: 'No session provided' })

  const userId = req.session.getUserId()
  setSentryUser(userId)

  if (req.method === 'GET') {
    const userData = await getUserMeta(userId)
    return res.status(200).json({
      error: false,
      data: {
        id: userId,
        webhookStatus: userData.webhookStatus || 'not_active',
      },
    })
  }
}
