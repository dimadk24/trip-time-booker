import { SessionAuth } from 'supertokens-auth-react/recipe/session'
import { Header } from '@/components/header'
import { MainApp } from '@/components/main-app'

export default function Home() {
  return (
    <SessionAuth>
      <Header />
      <MainApp />
    </SessionAuth>
  )
}
