import './globals.css'
import React from 'react'
import { AppProps } from 'next/app'
import Head from 'next/head'
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
      <Head>
        <link
          rel="apple-touch-icon"
          sizes="76x76"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
        <title>Trip time booker</title>
      </Head>
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
