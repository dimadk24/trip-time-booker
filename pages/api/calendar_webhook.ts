import { NextApiRequest, NextApiResponse } from 'next'
import { type Request, Response } from 'express'

export default async function superTokens(
  req: NextApiRequest & Request,
  res: NextApiResponse & Response
) {
  console.log(req.headers)
  console.log(req.body)
  res.status(200).send('OK')
}
