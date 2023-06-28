import {
  Client,
  Status,
  TravelMode,
  UnitSystem,
} from '@googlemaps/google-maps-services-js'
import { GOOGLE_MAPS_API_KEY } from '../config/app-config'
import { createAppLogger } from '../utils/logger'

const logger = createAppLogger('google-maps')

export const getTripDuration = async (
  origin: string,
  destination: string,
  arrivalTime: number,
  userId: string
) => {
  const client = new Client()

  logger.debug('Getting distance from maps')

  const eventData = {
    arrival_time: arrivalTime,
    destinations: [destination],
    origins: [origin],
  }

  const response = await client.distancematrix({
    params: {
      ...eventData,
      mode: TravelMode.transit,
      units: UnitSystem.metric,
      key: GOOGLE_MAPS_API_KEY,
    },
    timeout: 1000,
  })

  const firstEl = response.data.rows[0].elements[0]

  const status = firstEl.status
  if (status !== Status.OK) {
    logger.error('Invalid row status from google maps', {
      userId,
      status,
    })
    throw new Error('Invalid status')
  }
  logger.info('Successfully got distance matrix from maps')

  return firstEl.duration.value
}
