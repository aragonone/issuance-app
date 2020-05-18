import EthersUtils from 'ethers-utils'
import BN from 'bn.js'

/**
 * Format an amount of units to be displayed.
 *
 * @param {BigNumber|String} value Amount of units to format.
 * @param {Number} options.digits Amount of digits on the token.
 * @param {Boolean} options.commas Use comma-separated groups.
 * @param {Boolean} options.replaceZeroBy The string to be returned when value is zero.
 * @param {Number} options.truncateToDecimalPlace Number of decimal places to show.
 */
export function formatUnits(
  value,
  {
    digits = 18,
    commas = false,
    replaceZeroBy = '',
    truncateToDecimalPlace,
  } = {}
) {
  if (typeof value === 'string') {
    value = EthersUtils.BigNumber(value)
  }

  if (value.lt(0) || digits < 0) {
    return ''
  }

  let valueBeforeCommas = EthersUtils.formatUnits(value.toString(), digits)

  // Replace 0 by an empty value
  if (valueBeforeCommas === '0.0') {
    return replaceZeroBy
  }

  // EthersUtils.formatUnits() adds a decimal even when 0, this removes it.
  valueBeforeCommas = valueBeforeCommas.replace(/\.0$/, '')

  if (typeof truncateToDecimalPlace === 'number') {
    const [whole = '', dec = ''] = valueBeforeCommas.split('.')
    if (dec) {
      const truncatedDec = dec
        .slice(0, truncateToDecimalPlace)
        .replace(/0*$/, '')
      valueBeforeCommas = truncatedDec ? `${whole}.${truncatedDec}` : whole
    }
  }
  return commas ? EthersUtils.commify(valueBeforeCommas) : valueBeforeCommas
}

/**
 * Parse a unit set for an input and return it as a BigNumber.
 *
 * @param {String} value Value to parse into an amount of units.
 * @param {Number} options.digits Amount of digits on the token.
 * @return {BigNumber}
 */
export function parseUnits(value, { digits = 18 } = {}) {
  value = value.replace(/,/g, '').trim()
  try {
    const result = EthersUtils.parseUnits(value || '0', digits)
    return result
  } catch (err) {
    return new BN(-1)
  }
}
