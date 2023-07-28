import { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { usePlacesWidget } from 'react-google-autocomplete'
import { Label, TextInput } from 'flowbite-react'
import { XMarkIcon } from './x-mark-icon'
import { CheckMarkIcon } from './check-mark-icon'
import {
  invalidateUser,
  setUserData,
  useUserQuery,
} from '@/src/frontend/user-query'
import { frontendEnv } from '@/src/config/frontend-env'
import { UserResponse } from '@/src/types'

const mapsApiKey = frontendEnv.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

export function MainApp() {
  const { isSuccess, data: user } = useUserQuery()
  const [updating, setUpdating] = useState(false)

  const onSelectHomeLocation = async (value: string) => {
    const loadingToastId = toast.info('Saving home location...', {
      autoClose: false,
      position: 'bottom-left',
    })

    try {
      setUpdating(true)

      const { data: responseData } = await axios.put<UserResponse>(
        '/api/user',
        {
          homeLocation: value,
        }
      )
      if (responseData.error) {
        throw new Error(responseData.message)
      }

      setUserData(responseData.data)
      toast.success('Successfully saved home location', {
        position: 'bottom-left',
      })
    } finally {
      setUpdating(false)
      toast.dismiss(loadingToastId)
    }
  }

  const { ref: autocompleteInputRef } = usePlacesWidget<HTMLInputElement>({
    apiKey: mapsApiKey,
    onPlaceSelected: (place) => {
      onSelectHomeLocation(place.formatted_address)
    },
    options: {
      types: ['address'],
    },
  })

  useEffect(() => {
    if (isSuccess && autocompleteInputRef.current) {
      autocompleteInputRef.current.value = user.homeLocation
    }
  }, [isSuccess, user, autocompleteInputRef])

  const webhookStatus = user?.webhookStatus || 'not_active'

  const onToggleWebhookSubscription = async () => {
    const apiEndpoint =
      webhookStatus === 'not_active' ? 'watch-calendar' : 'unwatch-calendar'
    const loadingToastId = toast.info(
      webhookStatus === 'not_active'
        ? 'Enabling webhook...'
        : 'Disabling webhook...',
      { autoClose: false, position: 'bottom-left' }
    )

    try {
      setUpdating(true)

      const { data: responseData } = await axios.post<{ message: string }>(
        `/api/${apiEndpoint}`
      )
      if (responseData.message !== 'OK') {
        throw new Error(responseData.message)
      }

      await invalidateUser()
      toast.success(
        `Successfully ${
          webhookStatus === 'not_active' ? 'enabled' : 'disabled'
        } webhook`,
        { position: 'bottom-left' }
      )
    } finally {
      setUpdating(false)
      toast.dismiss(loadingToastId)
    }
  }

  return (
    <main className="p-8">
      <div className="flex flex-col items-center justify-center">
        <div className="max-w-md">
          <div className="mb-2 block">
            <Label htmlFor="homeLocation" value="Home location" />
          </div>
          <div className="flex mb-4">
            <TextInput
              id="homeLocation"
              ref={autocompleteInputRef}
              disabled={updating}
              onBlur={(event) => {
                if (event.target.value === '' && user?.homeLocation) {
                  onSelectHomeLocation('')
                }
              }}
            />
            <button
              className="ml-2"
              onClick={() => onSelectHomeLocation('')}
              disabled={updating || !user?.homeLocation}
            >
              Clear
            </button>
          </div>
        </div>
        <div className="mb-6">
          <span className="text-gray-800 text-lg mr-3">
            Calendar webhook subscription status:
          </span>
          <span
            className={`px-2 py-1 border-2 rounded-2xl ${
              webhookStatus === 'not_active'
                ? 'border-red-400'
                : 'border-green-400'
            }`}
          >
            <span style={{ position: 'relative', top: '-1px' }}>
              {webhookStatus === 'not_active' ? (
                <XMarkIcon />
              ) : (
                <CheckMarkIcon />
              )}
            </span>
            {webhookStatus.replace('_', ' ')}
          </span>
        </div>
        <button
          onClick={onToggleWebhookSubscription}
          disabled={updating}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-2 px-4 rounded-lg"
        >
          {webhookStatus === 'not_active' ? 'Enable' : 'Disable'} webhook
          subscription
        </button>
      </div>
    </main>
  )
}
