import ThirdPartyReact from 'supertokens-auth-react/recipe/thirdparty'
import SessionReact from 'supertokens-auth-react/recipe/session'
import Router from 'next/router'
import { type WindowHandlerInterface } from 'supertokens-web-js/utils/windowHandler/types'
import { appInfo } from './appInfo'

export const frontendConfig = () => {
  return {
    appInfo,
    recipeList: [
      ThirdPartyReact.init({
        signInAndUpFeature: {
          providers: [ThirdPartyReact.Google.init()],
        },
      }),
      SessionReact.init(),
    ],
    windowHandler: (oI: WindowHandlerInterface) => {
      return {
        ...oI,
        location: {
          ...oI.location,
          setHref: (href: string) => {
            Router.push(href)
          },
        },
      }
    },
  }
}
