import { superTokensNextWrapper } from 'supertokens-node/nextjs'
import { middleware } from 'supertokens-node/framework/express'
import { NextApiRequest, NextApiResponse } from 'next'
import { type Request, Response } from 'express'
import supertokens from 'supertokens-node'
import NextCors from 'nextjs-cors'
import { getBackendConfig } from '../../../src/config/supertokens/backendConfig'
import { API_DOMAIN } from '@/src/config/appConfig'

supertokens.init(getBackendConfig())

export default async function superTokens(
  req: NextApiRequest & Request,
  res: NextApiResponse & Response
) {
  await NextCors(req, res, {
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    origin: [API_DOMAIN],
    credentials: true,
    allowedHeaders: ['content-type', ...supertokens.getAllCORSHeaders()],
  })

  await superTokensNextWrapper(
    async (next) => {
      res.setHeader(
        'Cache-Control',
        'no-cache, no-store, max-age=0, must-revalidate'
      )
      await middleware()(req, res, next)
    },
    req,
    res
  )
  if (!res.writableEnded) {
    res.status(404).send('Not found')
  }
}
