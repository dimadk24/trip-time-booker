import ThirdPartyNode from 'supertokens-node/recipe/thirdparty'
import SessionNode from 'supertokens-node/recipe/session'
import UserMetadata from 'supertokens-node/recipe/usermetadata'
import Dashboard from 'supertokens-node/recipe/dashboard'
import { TypeInput } from 'supertokens-node/types'
import { backendEnv } from '../backend-env'
import { appInfo } from './app-info'
import { postAuth } from '@/src/post-auth'
import { createAppLogger } from '@/src/utils/logger'

const logger = createAppLogger('backend-config')

export const getBackendConfig = (): TypeInput => {
  return {
    framework: 'express',
    supertokens: {
      connectionURI: backendEnv.SUPERTOKENS_CONNECTION_URI,
      apiKey: backendEnv.SUPERTOKENS_API_KEY,
    },
    appInfo,
    recipeList: [
      ThirdPartyNode.init({
        signInAndUpFeature: {
          providers: [
            ThirdPartyNode.Google({
              clientId: backendEnv.GOOGLE_CLIENT_ID,
              clientSecret: backendEnv.GOOGLE_CLIENT_SECRET,
              scope: [
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/calendar.events',
              ],
            }),
          ],
        },
        override: {
          apis: (originalImplementation) => {
            return {
              ...originalImplementation,

              signInUpPOST: async function (input) {
                if (originalImplementation.signInUpPOST === undefined) {
                  throw Error(
                    'No singInUpPost method for the api implementation'
                  )
                }

                const response = await originalImplementation.signInUpPOST(
                  input
                )

                if (response.status === 'OK') {
                  const userId = response.user.id
                  logger.debug(
                    { userId },
                    'signInUpPost successful on provider, processing post auth'
                  )
                  postAuth(userId, response.authCodeResponse)
                } else {
                  logger.warn(
                    {
                      response,
                    },
                    'signInUpPost not successful on provider'
                  )
                }

                return response
              },
            }
          },
        },
      }),
      SessionNode.init(),
      UserMetadata.init(),
      Dashboard.init(),
    ],
    isInServerlessEnv: true,
  }
}
