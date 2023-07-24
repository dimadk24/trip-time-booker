import { SessionAuth } from 'supertokens-auth-react/recipe/session'
import { Header } from '@/components/header'
import { MainApp } from '@/components/main-app'
import { Footer } from '@/components/footer'

export default function Home() {
  return (
    <SessionAuth>
      <Header />
      <MainApp />
      <Footer />
    </SessionAuth>
  )
}
