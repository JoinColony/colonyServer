import { JWT, JWK } from 'jose'

import { disableExpiryCheck } from './env'

const JWT_KEY = JWK.asKey(process.env.JWT_SECRET)

export const getTokenForAddress = (address: string) =>
  JWT.sign({ address }, JWT_KEY, {
    algorithm: 'HS256',
    audience: 'https://api.colony.io',
    expiresIn: '2 hours',
    header: {
      typ: 'JWT',
    },
    issuer: 'https://colony.io',
  })

export const getAddressFromToken = (token: string) => {
  if (typeof token != 'string') throw new Error('No token given')
  if (token.startsWith('Bearer ')) {
    // Remove Bearer from string
    token = token.slice(7, token.length)
  }

  const { address, exp } = JWT.decode(token) as { address: string; exp: number }

  if (!disableExpiryCheck && Date.now() > exp) {
    throw new Error('Authentication token expired')
  }

  return address
}
