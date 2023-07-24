import './globals.css'
import React from 'react'
import { AppProps } from 'next/app'
import SuperTokensReact, { SuperTokensWrapper } from 'supertokens-auth-react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { frontendConfig } from '../src/config/supertokens/frontend-config'
import { queryClient } from '@/src/frontend/react-query-client'

if (typeof window !== 'undefined') {
  SuperTokensReact.init(frontendConfig())
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <SuperTokensWrapper>
        <QueryClientProvider client={queryClient}>
          <Component {...pageProps} />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </SuperTokensWrapper>
      <ToastContainer />
    </>
  )
}

export default MyApp
