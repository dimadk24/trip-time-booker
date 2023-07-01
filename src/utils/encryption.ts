import crypto from 'crypto'
import { SECRET_INIT_VECTOR, SECRET_KEY } from '../config/app-config'

const encryptionMethod = 'aes-256-cbc'

const key = crypto
  .createHash('sha512')
  .update(SECRET_KEY)
  .digest('hex')
  .substring(0, 32)
const encryptionInitVector = crypto
  .createHash('sha512')
  .update(SECRET_INIT_VECTOR)
  .digest('hex')
  .substring(0, 16)

export function encryptData(data: string): string {
  const cipher = crypto.createCipheriv(
    encryptionMethod,
    key,
    encryptionInitVector
  )
  return Buffer.from(
    cipher.update(data, 'utf8', 'hex') + cipher.final('hex')
  ).toString('base64')
}

export function decryptData(encryptedData: string): string {
  const buff = Buffer.from(encryptedData, 'base64')
  const decipher = crypto.createDecipheriv(
    encryptionMethod,
    key,
    encryptionInitVector
  )
  return (
    decipher.update(buff.toString('utf8'), 'hex', 'utf8') +
    decipher.final('utf8')
  )
}
