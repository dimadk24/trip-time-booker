import ThirdPartyNode from 'supertokens-node/recipe/thirdparty'
import SessionNode from 'supertokens-node/recipe/session'
import UserMetadata from 'supertokens-node/recipe/usermetadata'
import Dashboard from 'supertokens-node/recipe/dashboard'
import { TypeInput } from 'supertokens-node/types'
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  SUPERTOKENS_API_KEY,
  SUPERTOKENS_CONNECTION_URI,
} from '../appConfig'
import { appInfo } from './appInfo'
import { postAuth } from '@/src/postAuth'

export const getBackendConfig = (): TypeInput => {
  return {
    framework: 'express',
    supertokens: {
      connectionURI: SUPERTOKENS_CONNECTION_URI,
      apiKey: SUPERTOKENS_API_KEY,
    },
    appInfo,
    recipeList: [
      ThirdPartyNode.init({
        signInAndUpFeature: {
          providers: [
            ThirdPartyNode.Google({
              clientId: GOOGLE_CLIENT_ID,
              clientSecret: GOOGLE_CLIENT_SECRET,
              scope: [
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/calendar.events.readonly',
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
                  postAuth(userId, response.authCodeResponse)
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
