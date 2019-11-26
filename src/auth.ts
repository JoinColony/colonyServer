import { JWT, JWK } from 'jose'

// FIXME use ENV
const jwtKey = JWK.asKey('seeeecret')

export const getTokenForAddress = (address: string) =>
  JWT.sign({ address }, jwtKey, {
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

  // FIXME enable this check
  // if (Date.now() > exp) {
  //   throw new Error('Authentication token expired')
  // }

  return address
}
