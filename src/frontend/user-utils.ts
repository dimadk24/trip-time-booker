import { signOut } from 'supertokens-web-js/recipe/thirdparty'
import { appInfo } from '../config/supertokens/app-info'

export const logOut = async () => {
  await signOut()
  window.location.href = appInfo.websiteBasePath
}
