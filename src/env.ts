export const isDevelopment = process.env.NODE_ENV === 'development'
export const disableAuthCheck =
  isDevelopment && process.env.DISABLE_AUTH_CHECK === 'true'
export const disableExpiryCheck =
  isDevelopment && process.env.DISABLE_EXPIRY_CHECK === 'true'
