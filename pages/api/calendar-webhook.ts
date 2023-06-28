import { NextApiRequest, NextApiResponse } from 'next'
import { type Request, Response } from 'express'
import ThirdPartyNode from 'supertokens-node/recipe/thirdparty'
import { getCredentials } from '@/src/services/user-meta'
import { getJustCreatedEvents } from '@/src/services/google-calendar'
import { decrypt } from '@/src/utils/encryption-utils'

export default async function calendarWebhook(
  req: NextApiRequest & Request,
  res: NextApiResponse & Response
) {
  const { headers } = req

  let userId = headers['x-goog-channel-token']

  if (typeof userId !== 'string')
    return res.status(401).send('Invalid channel token')

  userId = decrypt(userId)

  const user = await ThirdPartyNode.getUserById(userId)
  if (!user) {
    return res.status(401).send('Invalid channel token')
  }

  if (headers['x-goog-resource-state'] !== 'exists')
    return res.status(200).send('OK')

  if (typeof headers['x-goog-resource-id'] !== 'string') {
    return res.status(400).send('Invalid x-goog-resource-id header')
  }

  const credentials = await getCredentials(userId)
  const justCreatedEvents = await getJustCreatedEvents(credentials)

  const promises = justCreatedEvents.map(async (event) => {
    if (!event.location) return
    console.log(event.location)
    // get time from maps api
    // create events
  })

  await Promise.all(promises)

  res.status(200).send('OK')
}
