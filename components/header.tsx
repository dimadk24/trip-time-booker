import { Dropdown } from 'flowbite-react'
import Image from 'next/image'
import { useSessionContext } from 'supertokens-auth-react/recipe/session'
import logo from './icons8-delivery-time-100.png'
import { logOut } from '@/src/frontend/user-utils'

export function Header() {
  const session = useSessionContext()

  if (session.loading) {
    return null
  }

  const { userId } = session

  return (
    <header className="bg-white border-b-2 border-gray-300 p-4 flex items-center justify-between">
      <div className="flex items-center">
        <Image
          src={logo}
          alt="Trip time booker logo"
          className="h-8 w-8 mr-3"
        />
        <span className="text-gray-800 text-lg">Trip time booker</span>
      </div>

      <Dropdown inline label={userId}>
        <Dropdown.Item onClick={logOut}>Sign out</Dropdown.Item>
      </Dropdown>
    </header>
  )
}
