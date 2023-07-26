import {
  Client,
  Status,
  TravelMode,
  UnitSystem,
} from '@googlemaps/google-maps-services-js'
import { backendEnv } from '../config/backend-env'
import { createAppLogger } from '../utils/logger'

export const getTripDuration = async (
  origin: string,
  destination: string,
  arrivalTime: number,
  userId: string
) => {
  const client = new Client()

  const logger = createAppLogger('google-maps')
  const userLogger = logger.child({ userId })

  userLogger.debug('Getting distance from maps')

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
      key: backendEnv.BACKEND_GOOGLE_MAPS_API_KEY,
    },
    timeout: 1000,
  })

  const firstEl = response.data.rows[0].elements[0]

  const status = firstEl.status
  if (status !== Status.OK) {
    userLogger.error(
      {
        status,
      },
      'Invalid row status from google maps'
    )
    throw new Error('Invalid status')
  }
  userLogger.info('Successfully got distance matrix from maps')

  return firstEl.duration.value
}
