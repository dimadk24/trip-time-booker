export type WebhookStatus = 'not_active' | 'active'

export type PublicUser = {
  id: string
  webhookStatus: WebhookStatus
  homeLocation: string
}

export type UserResponse =
  | {
      error: false
      data: PublicUser
    }
  | {
      error: true
      message: string
    }
