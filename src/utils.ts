import { AddressZero } from 'ethers/constants'
import { DEFAULT_TOKEN_DECIMALS } from './constants'

export const isETH = (address: string) =>
  address === AddressZero || address === '0x0'

/*
 * @NOTE Don't trust the incoming decimals
 *
 * The incoming decimals can be virtually anything, so we have to test if it's
 * a number, and return that number (even if that number is 0).
 * If it's not a number then fallback to the default token decimals value.
 */
export const getTokenDecimalsWithFallback = (
  decimals: any,
  fallbackDecimals?: any,
): number => {
  if (Number.isInteger(decimals) && decimals >= 0) {
    return decimals
  }
  if (Number.isInteger(fallbackDecimals) && fallbackDecimals >= 0) {
    return fallbackDecimals
  }
  return DEFAULT_TOKEN_DECIMALS
}
