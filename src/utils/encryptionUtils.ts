import Cryptr from 'cryptr'
import { SECRET_KEY } from '../config/appConfig'

const cryptr = new Cryptr(SECRET_KEY)

export const encrypt = (string: string) => {
  return cryptr.encrypt(string)
}

export const decrypt = (string: string) => {
  return cryptr.decrypt(string)
}
