/**
 * Centralized Big.js utility with toformat support
 * Provides consistent Big.js configuration across the entire application
 */

import _Big from 'big.js'
import toformat from 'toformat'

// Create formatted Big.js instance
const Big = toformat(_Big)

// Set precision exponent to handle large numbers
Big.PE = 999

// Export the configured Big instance
export { Big }

// Export commonly used zero value
export const _0 = Big(0)

// Export commonly used values for convenience
export const _1 = Big(1)
export const _100 = Big(100)

// Export the original Big constructor for cases where you need it
export { _Big }

// Export toformat for advanced formatting needs
export { toformat }
