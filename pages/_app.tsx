import './globals.css'
import React from 'react'
import { AppProps } from 'next/app'
import SuperTokensReact, { SuperTokensWrapper } from 'supertokens-auth-react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { frontendConfig } from '../src/config/supertokens/frontend-config'
import { queryClient } from '@/src/frontend/react-query-client'

if (typeof window !== 'undefined') {
  SuperTokensReact.init(frontendConfig())
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SuperTokensWrapper>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SuperTokensWrapper>
  )
}

export default MyApp
