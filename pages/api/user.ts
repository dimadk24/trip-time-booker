import type { NextApiRequest } from 'next'
import { superTokensNextWrapper } from 'supertokens-node/nextjs'
import { verifySession } from 'supertokens-node/recipe/session/framework/express'
import { type SessionRequest } from 'supertokens-node/framework/express'
import { type Response } from 'express'
import supertokens from 'supertokens-node'
import { getUserMeta, setUserMeta } from '@/src/services/user-meta'
import { setSentryUser } from '@/src/utils/sentry'
import { getBackendConfig } from '@/src/config/supertokens/backend-config'
import { PublicUser, UserResponse } from '@/src/types'

supertokens.init(getBackendConfig())

export default async function userApi(
  req: NextApiRequest & SessionRequest,
  res: Response<UserResponse>
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
        homeLocation: userData.homeLocation || '',
      },
    })
  }

  if (req.method === 'PUT') {
    const body = req.body as PublicUser
    const parsedUser = {
      webhookStatus: body.webhookStatus,
      homeLocation: body.homeLocation,
    }

    const userData = await getUserMeta(userId)
    if (parsedUser.homeLocation !== userData.homeLocation) {
      await setUserMeta(userId, {
        homeLocation: parsedUser.homeLocation,
      })
      return res.status(200).send({
        error: false,
        data: {
          id: userId,
          webhookStatus: userData.webhookStatus || 'not_active',
          homeLocation: parsedUser.homeLocation || '',
        },
      })
    }
    res.status(400).send({ error: true, message: 'Home location is the same' })
  }
}
