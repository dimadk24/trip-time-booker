import ThirdPartyNode from 'supertokens-node/recipe/thirdparty'
import SessionNode from 'supertokens-node/recipe/session'
import UserMetadata from 'supertokens-node/recipe/usermetadata'
import Dashboard from 'supertokens-node/recipe/dashboard'
import { TypeInput } from 'supertokens-node/types'
import { appInfo } from './appInfo'

export const getBackendConfig = (): TypeInput => {
  return {
    framework: 'express',
    supertokens: {
      connectionURI: process.env.SUPERTOKENS_CONNECTION_URI,
      apiKey: process.env.SUPERTOKENS_API_KEY,
    },
    appInfo,
    recipeList: [
      ThirdPartyNode.init({
        signInAndUpFeature: {
          providers: [
            ThirdPartyNode.Google({
              clientId: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
                  const accessToken = response.authCodeResponse.access_token
                  const userId = response.user.id
                  await UserMetadata.updateUserMetadata(userId, {
                    googleAccessToken: accessToken,
                  })
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
