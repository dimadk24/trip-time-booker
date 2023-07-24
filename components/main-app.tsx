import { useState } from 'react'
import { toast } from 'react-toastify'
import { invalidateUser, useUserQuery } from '@/src/frontend/user-query'

export function MainApp() {
  const { isSuccess, data: user } = useUserQuery()
  const [updating, setUpdating] = useState(false)

  if (!isSuccess) return null
  const { webhookStatus } = user

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

      const response = await fetch(`/api/${apiEndpoint}`, { method: 'POST' })
      const json = await response.json()
      if (json.message !== 'OK') {
        throw new Error(json.message)
      }
      if (!response.ok) {
        throw new Error(`Request error, response status: ${response.status}`)
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
        <div className="mb-6">
          <span className="text-gray-800 text-lg mr-3">
            Calendar webhook subscription status:
          </span>
          <span className="px-2 py-0.5 border-2 border-blue-400 rounded-2xl">
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
