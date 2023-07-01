import { frontendEnv } from '../frontend-env'

export const appInfo = {
  // learn more about this on https://supertokens.com/docs/thirdpartyemailpassword/appinfo
  appName: 'Trip time booker',
  apiDomain: frontendEnv.NEXT_PUBLIC_APP_DOMAIN,
  websiteDomain: frontendEnv.NEXT_PUBLIC_APP_DOMAIN,
  apiBasePath: '/api/auth',
  websiteBasePath: '/auth',
}
