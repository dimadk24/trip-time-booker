import crypto from 'crypto'
import { backendEnv } from '../config/backend-env'

export const hash = (string: string) =>
  crypto
    .createHash('sha256')
    .update([backendEnv.SECRET_KEY, string].join('-'), 'utf8')
    .digest('hex')
