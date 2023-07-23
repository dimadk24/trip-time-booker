/* eslint-disable jsx-a11y/anchor-is-valid */

import Image from 'next/image'
import { useSessionContext } from 'supertokens-auth-react/recipe/session'
import { signOut } from 'supertokens-web-js/recipe/thirdparty'
import logo from './icons8-delivery-time-100.png'

export function Header() {
  const session = useSessionContext()

  if (session.loading) {
    return null
  }

  const { userId } = session

  const onLogOut = async () => {
    await signOut()
  }

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
      <div className="flex items-center">
        <span className="text-gray-600 mr-2">{userId}</span>
        <div className="relative">
          <button className="text-gray-600 focus:outline-none">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </button>
          <div className="hidden absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg">
            <a
              href="#"
              className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
            >
              Relogin
            </a>
            <button
              onClick={onLogOut}
              className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
