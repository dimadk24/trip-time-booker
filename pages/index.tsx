import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { SessionAuth } from 'supertokens-auth-react/recipe/session'
import { Header } from '@/components/header'
import { MainApp } from '@/components/main-app'
import { Footer } from '@/components/footer'
import { logOut } from '@/src/frontend/user-utils'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    if ('relogin' in router.query) {
      logOut()
    }
  }, [router])

  return (
    <SessionAuth>
      <Header />
      <MainApp />
      <Footer />
    </SessionAuth>
  )
}
