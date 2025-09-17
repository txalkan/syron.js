/**
 * Simplified wallet configuration
 * Universal network detection for all wallets
 */

// Bitcoin network type definitions
export enum BitcoinNetworkType {
    mainnet = 'BITCOIN_MAINNET',
    testnet = 'testnet',
    testnet4 = 'BITCOIN_TESTNET4',
}

/**
 * Get the target network type - universal for all wallets
 */
export function getTargetNetwork(): string {
    const isTestnet = process.env.NEXT_PUBLIC_SYRON_VERSION === 'testnet'
    return isTestnet ? BitcoinNetworkType.testnet4 : BitcoinNetworkType.mainnet
}

/**
 * Get mempool URL for current network
 */
export function getMempoolUrl(path: string): string {
    const isTestnet = process.env.NEXT_PUBLIC_SYRON_VERSION === 'testnet'
    const baseUrl = isTestnet
        ? 'https://mempool.space/testnet4'
        : 'https://mempool.space'
    return `${baseUrl}${path}`
}

/**
 * Get minter address based on Syron version and network
 */
export function getRunesMinterAddress(): string {
    const version = process.env.NEXT_PUBLIC_SYRON_VERSION
    const testnet = isTestnet()

    if (testnet) {
        return process.env.NEXT_PUBLIC_SYRON_RUNES_MINTER_TESTNET || ''
    }

    // Mainnet logic
    if (version === '2') {
        return process.env.NEXT_PUBLIC_SYRON_RUNES_MINTER_MAINNET2 || ''
    }

    return process.env.NEXT_PUBLIC_SYRON_RUNES_MINTER_MAINNET || ''
}

/**
 * Check if we're currently on testnet
 */
export function isTestnet(): boolean {
    return process.env.NEXT_PUBLIC_SYRON_VERSION === 'testnet'
}

/**
 * Get network display name
 */
export function getNetworkDisplayName(): string {
    return isTestnet() ? 'Testnet' : 'Mainnet'
}

/**
 * Parse network response from wallet APIs to BitcoinNetworkType
 */
export function parseBitcoinNetwork(network: string): string {
    if (network === 'livenet' || network === 'mainnet') {
        return BitcoinNetworkType.mainnet
    } else if (network === 'testnet' || network === 'testnet4') {
        return BitcoinNetworkType.testnet4
    }
    // Use config function for default fallback
    return isTestnet()
        ? BitcoinNetworkType.testnet4
        : BitcoinNetworkType.mainnet
}

// Legacy aliases for backward compatibility
export const getUnisatTargetNetwork = getTargetNetwork
export const getOKXTargetNetwork = () => (isTestnet() ? 'testnet' : 'mainnet')
export const getCurrentNetworkConfig = () => ({
    mempoolUrl: isTestnet()
        ? 'https://mempool.space/testnet4'
        : 'https://mempool.space',
    runesMinterAddress: getRunesMinterAddress(),
})

// Helper functions to safely access window objects
const getUnisatWindow = () =>
    typeof window !== 'undefined' ? (window as any).unisat : null
const getOkxWindow = () =>
    typeof window !== 'undefined' && (window as any).okxwallet
        ? (window as any).okxwallet.bitcoin
        : null
export { getUnisatWindow, getOkxWindow }
