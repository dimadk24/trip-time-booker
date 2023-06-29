import crypto from 'crypto'

export const hash = (string: string) =>
  crypto.createHash('sha256').update(string, 'utf8').digest('hex')
