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
 * Minter type enum for different token standards
 */
export enum MinterType {
    BRC20 = 'BRC20',
    RUNES = 'RUNES',
}

/**
 * Get minter address based on type, Syron version and network
 */
export function getMinterAddress(type: MinterType): string {
    const version = process.env.NEXT_PUBLIC_SYRON_VERSION
    const testnet = isTestnet()

    // Determine environment variable keys based on minter type
    const envKeys = {
        testnet:
            type === MinterType.BRC20
                ? 'NEXT_PUBLIC_SYRON_MINTER_TESTNET'
                : 'NEXT_PUBLIC_SYRON_RUNES_MINTER_TESTNET',
        mainnet2:
            type === MinterType.BRC20
                ? 'NEXT_PUBLIC_SYRON_MINTER_MAINNET2'
                : 'NEXT_PUBLIC_SYRON_RUNES_MINTER_MAINNET2',
        mainnet:
            type === MinterType.BRC20
                ? 'NEXT_PUBLIC_SYRON_MINTER_MAINNET'
                : 'NEXT_PUBLIC_SYRON_RUNES_MINTER_MAINNET',
    }

    if (testnet) {
        return process.env[envKeys.testnet] || ''
    }

    // Mainnet logic
    if (version === '2') {
        return process.env[envKeys.mainnet2] || ''
    }

    return process.env[envKeys.mainnet] || ''
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
    runesMinterAddress: getMinterAddress(MinterType.RUNES),
})

// Helper functions to safely access window objects

/**
 * Check if we're in OKX mobile in-app browser
 * OKX mobile injects both window.unisat and window.okxwallet for compatibility
 */
const isOKXMobileBrowser = (): boolean => {
    if (typeof window === 'undefined') return false

    // Check user agent for OKX mobile app (most reliable indicator)
    const userAgent = navigator?.userAgent || ''
    const isOKXUserAgent =
        userAgent.includes('OKApp') || userAgent.includes('okx')

    // Check if OKX wallet is present
    const hasOKX = !!(window as any).okxwallet

    // BOTH conditions must be true: OKX wallet object exists AND user agent indicates OKX mobile
    // This prevents false positives from desktop OKX extension
    return hasOKX && isOKXUserAgent
}

const getUnisatWindow = () => {
    if (typeof window === 'undefined') return null

    // If we're in OKX mobile browser, don't return unisat even if it exists
    // This prevents confusion where OKX injects unisat for compatibility
    if (isOKXMobileBrowser()) {
        console.log('OKX mobile browser detected, skipping unisat check')
        return null
    }

    // Check for unisat object
    const unisat = (window as any).unisat
    if (unisat) {
        // console.log('Unisat wallet detected:', {
        //     hasRequestAccounts: typeof unisat.requestAccounts === 'function',
        //     hasGetAccounts: typeof unisat.getAccounts === 'function',
        //     hasGetChain: typeof unisat.getChain === 'function',
        //     hasSwitchChain: typeof unisat.switchChain === 'function',
        // })
        return unisat
    }

    console.log('Unisat wallet not found on window object')
    return null
}

const getOkxWindow = () => {
    if (typeof window === 'undefined') return null

    if ((window as any).okxwallet) {
        const okx = (window as any).okxwallet.bitcoin
        if (okx) {
            // console.log('OKX wallet detected:', {
            //     hasRequestAccounts: typeof okx.requestAccounts === 'function',
            //     hasGetAccounts: typeof okx.getAccounts === 'function',
            // })
            return okx
        }
    }

    console.log('OKX wallet not found on window object')
    return null
}

/**
 * Get the appropriate wallet window based on wallet type
 * This provides a unified interface for wallet operations
 *
 * On desktop: Returns the specific wallet provider (unisat or okxwallet.bitcoin)
 * On OKX mobile: OKX injects window.unisat for compatibility, so both work
 *
 * @param walletType - 'unisat' or 'okx'
 * @returns The wallet provider object or null
 */
const getWalletWindow = (walletType: 'unisat' | 'okx' | null | undefined) => {
    if (typeof window === 'undefined' || !walletType) return null

    if (walletType === 'okx') {
        return getOkxWindow()
    } else if (walletType === 'unisat') {
        return getUnisatWindow()
    } else {
        return null
    }
}

export { getUnisatWindow, getOkxWindow, getWalletWindow, isOKXMobileBrowser }
