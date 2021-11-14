import { ForbiddenError } from 'apollo-server-errors'

export const checkAuth = async (promise: Promise<boolean>) => {
  let auth = false

  try {
    auth = await promise
  } catch (caughtError) {
    throw new Error(caughtError.message || caughtError.toString())
  }

  return auth
}

export const tryAuth = async (promise: Promise<boolean>) => {
  const auth = await checkAuth(promise)

  if (!auth) {
    throw new ForbiddenError('Not allowed')
  }
}
