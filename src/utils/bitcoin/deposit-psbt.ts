import { getWalletWindow } from '../../config/wallet'
import { useWalletInfoStore } from '../../store/wallet_info'
import { mempoolFeeRate, mempoolUtxos } from './mempool'
import * as btc from 'bitcoinjs-lib'
import * as ecc from '@bitcoinerlab/secp256k1'
import type { Big } from 'big.js'

// Initialize ECC library once at module level
btc.initEccLib(ecc)

interface Utxo {
    txid: string
    vout: number
    value: bigint // sats
    address?: string
    pubkeyHex?: string // 33B (P2WPKH) or 32B x-only (P2TR)
    witnessUtxo?: {
        script: Uint8Array
        value: bigint
    }
}

interface DepositPsbtParams {
    /** Collateral amount in satoshis */
    collateralAmount: Big
    /** Fee amount in satoshis */
    feeAmount: Big
    /** SDB address (recipient of the deposit) */
    sdbAddress: string
    /** Loading state setter function */
    setIsLoading: (loading: boolean) => void
}

interface DepositPsbtResult {
    /** Transaction ID if successful */
    txId?: string
    /** Error message if failed */
    error?: string
    /** Success status */
    success: boolean
}

/**
 * Validates deposit parameters before creating PSBT
 */
const validateDepositParams = (
    params: DepositPsbtParams
): { valid: boolean; error?: string } => {
    const { collateralAmount, feeAmount, sdbAddress } = params

    if (!collateralAmount || !feeAmount || !sdbAddress) {
        return {
            valid: false,
            error: 'All parameters are required',
        }
    }

    const collateralAmountNumber = Number(collateralAmount)
    const feeAmountNumber = Number(feeAmount)

    if (isNaN(collateralAmountNumber) || collateralAmountNumber < 3000) {
        return {
            valid: false,
            error: 'Collateral amount must be greater than 3000 sats',
        }
    }

    if (
        isNaN(feeAmountNumber) ||
        feeAmountNumber < 1000 ||
        feeAmountNumber > 2999
    ) {
        return {
            valid: false,
            error: 'Fee amount must be between 1000 and 2999 satoshis',
        }
    }

    // Basic address validation (Bitcoin address format)
    if (
        !sdbAddress.startsWith('bc1') &&
        !sdbAddress.startsWith('1') &&
        !sdbAddress.startsWith('3')
    ) {
        return {
            valid: false,
            error: 'Invalid Bitcoin address format',
        }
    }

    return { valid: true }
}

function isTaprootAddress(addr: string) {
    return addr.startsWith('bc1p')
}

function isP2WPKHAddress(addr: string) {
    return addr.startsWith('bc1') && addr.length === 42
}

function isLegacyAddress(addr: string) {
    return addr.startsWith('1') && addr.length >= 26 && addr.length <= 35
}

function isP2SHAddress(addr: string) {
    return addr.startsWith('3') && addr.length >= 26 && addr.length <= 35
}

function isValidBitcoinAddress(addr: string): boolean {
    return (
        isTaprootAddress(addr) ||
        isP2WPKHAddress(addr) ||
        isLegacyAddress(addr) ||
        isP2SHAddress(addr)
    )
}

function validateUtxo(utxo: Utxo): { valid: boolean; error?: string } {
    if (!utxo.txid || utxo.txid.length !== 64) {
        return {
            valid: false,
            error: 'Invalid txid format (must be 64 hex characters)',
        }
    }

    if (typeof utxo.vout !== 'number' || utxo.vout < 0) {
        return {
            valid: false,
            error: 'Invalid vout (must be non-negative number)',
        }
    }

    if (typeof utxo.value !== 'bigint' || utxo.value <= BigInt(0)) {
        return {
            valid: false,
            error: 'Invalid value (must be positive bigint in sats)',
        }
    }

    if (!utxo.address || !isValidBitcoinAddress(utxo.address)) {
        return { valid: false, error: 'Invalid Bitcoin address format' }
    }

    if (
        !utxo.pubkeyHex ||
        (utxo.pubkeyHex.length !== 64 && utxo.pubkeyHex.length !== 66)
    ) {
        return {
            valid: false,
            error: 'Invalid pubkey format (must be 64 or 66 hex characters)',
        }
    }

    return { valid: true }
}

function getBtcjsNetwork(walletNetwork?: string) {
    const byEnv =
        process.env.NEXT_PUBLIC_SYRON_VERSION === 'testnet'
            ? btc.networks.testnet
            : btc.networks.bitcoin
    if (!walletNetwork) return byEnv
    const isTn = walletNetwork.toLowerCase().includes('testnet')
    return isTn ? btc.networks.testnet : btc.networks.bitcoin
}

function buildPsbt({
    utxos,
    outputs,
    network,
}: {
    utxos: Utxo[]
    outputs: { address: string; value: number }[]
    network: btc.networks.Network
}): btc.Psbt {
    const psbt = new btc.Psbt({ network })

    for (const u of utxos) {
        if (!u.address) {
            throw new Error('UTXO address is required to build PSBT input')
        }

        if (!u.witnessUtxo) {
            const output = btc.address.toOutputScript(u.address, network)
            const script =
                typeof Buffer !== 'undefined'
                    ? Buffer.from(output)
                    : (output as any)
            u.witnessUtxo = {
                script,
                value: BigInt(u.value),
            }
        }

        const baseInput = {
            hash: u.txid,
            index: u.vout,
            witnessUtxo: u.witnessUtxo,
        }

        psbt.addInput(baseInput as any)
    }

    for (const o of outputs) {
        psbt.addOutput({ address: o.address, value: BigInt(o.value) })
    }

    return psbt
}

async function signAndPushPsbt(
    psbt: btc.Psbt,
    walletType: any,
    network: btc.networks.Network,
    toSignInputs: Array<{ index: number; publicKey?: string; address?: string }>
) {
    const psbtHex = psbt.toHex()

    const walletWindow = getWalletWindow(walletType)
    if (!walletWindow) throw new Error(`Wallet ${walletType} not available`)

    console.log(
        `Signing PSBT with ${walletType} wallet, toSignInputs:`,
        JSON.stringify(toSignInputs, null, 2)
    )

    // Use the predetermined wallet window
    if (typeof walletWindow.signPsbt !== 'function') {
        throw new Error('Connected wallet does not support PSBT signing')
    }

    const signedPsbtHex: string = await walletWindow.signPsbt(psbtHex, {
        autoFinalized: true,
        toSignInputs,
    })

    const signed = btc.Psbt.fromHex(signedPsbtHex, { network })
    try {
        signed.finalizeAllInputs()
    } catch (e) {
        console.log('PSBT already finalized or finalization failed:', e)
    }
    const rawTxHex = signed.extractTransaction().toHex()

    console.log(
        'Broadcasting raw transaction:',
        rawTxHex.substring(0, 50) + '...'
    )

    if (typeof walletWindow.pushTx === 'function') {
        console.log(`Broadcasting with ${walletType} pushTx`)
        // OKX pushTx(rawTxHex); UniSat pushTx({ rawtx }) – support both shapes
        try {
            return await walletWindow.pushTx(rawTxHex)
        } catch (_) {
            return await walletWindow.pushTx({ rawtx: rawTxHex })
        }
    }

    throw new Error('Connected wallet does not support broadcasting (pushTx)')
}

/**
 * Creates and signs a PSBT for Bitcoin deposit to SDB address
 *
 * @param params - Deposit parameters
 * @returns Promise<DepositPsbtResult>
 */
const createDepositPsbt = async (
    params: DepositPsbtParams
): Promise<DepositPsbtResult> => {
    const { collateralAmount, feeAmount, sdbAddress, setIsLoading } = params

    try {
        setIsLoading(true)

        // Get wallet info
        const { wallet } = useWalletInfoStore.getState()
        if (!wallet || !wallet.type || !wallet.network) {
            return {
                success: false,
                error: 'No wallet connected',
            }
        }

        const depositAmount = Number(collateralAmount.add(feeAmount))
        const { utxos, change } = await fetchWalletUtxos(
            wallet.address!,
            wallet.publicKey!,
            BigInt(depositAmount),
            sdbAddress
        )

        const outputs = [
            {
                address: sdbAddress,
                value: Number(collateralAmount),
            },
            {
                address: sdbAddress,
                value: Number(feeAmount),
            },
        ]

        if (change > 0) {
            outputs.push({ address: wallet.address!, value: Number(change) })
        }

        // Determine network from wallet store's network (fallback to env)
        const btcjsNetwork = getBtcjsNetwork(wallet.network)

        if (utxos.length > 0) {
            console.log(
                'Creating deposit PSBT (multi-input) with provided utxos/outputs',
                JSON.stringify(
                    {
                        utxoCount: utxos.length,
                        outputs,
                    },
                    null,
                    2
                )
            )

            // Validate all UTXOs before building PSBT
            for (const [i, utxo] of utxos.entries()) {
                const { valid, error } = validateUtxo(utxo)
                if (!valid) {
                    return {
                        success: false,
                        error: `UTXO ${i} validation failed: ${error}`,
                    }
                }
            }

            const psbt = buildPsbt({
                utxos,
                outputs,
                network: btcjsNetwork,
            })
            const toSignInputs = utxos.map((utxo, index) => {
                return { index, publicKey: utxo.pubkeyHex }
            })
            const txId = await signAndPushPsbt(
                psbt,
                wallet.type,
                btcjsNetwork,
                toSignInputs
            )

            return {
                success: true,
                txId: String(txId),
            }
        }
        return {
            success: false,
            error: 'No available UTXOs found for wallet address',
        }
    } catch (error) {
        console.error('Error creating deposit PSBT:', error)

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : typeof error === 'object' &&
                        error !== null &&
                        'message' in error
                      ? (error as { message: string }).message
                      : JSON.stringify(error),
        }
    } finally {
        setIsLoading(false)
    }
}

const DUST = 330

type AddrType = 'p2wpkh' | 'p2tr'

const IN_VB = { p2wpkh: 68, p2tr: 57 } as const
const OUT_VB = { p2wpkh: 31, p2tr: 43 } as const

function addrType(addr: string): AddrType {
    return addr.startsWith('bc1p') ? 'p2tr' : 'p2wpkh'
}

function estimateVbytes(
    nIn: number,
    inType: AddrType,
    nOut: number,
    outTypes: AddrType[]
) {
    const base = 10
    const inBytes = nIn * IN_VB[inType]
    const outBytes = outTypes.reduce((sum, type) => sum + OUT_VB[type], 0)
    return (
        base +
        inBytes +
        outBytes +
        (nOut - outTypes.length) * OUT_VB[outTypes[0]]
    )
}

function selectUtxosGreedy(
    utxos: { txid: string; vout: number; value: number }[],
    target: number,
    feeRate: number,
    walletType: AddrType,
    sdbType: AddrType
) {
    const selected: Utxo[] = []
    let inSum = 0

    for (const utxo of utxos) {
        selected.push({ ...utxo, value: BigInt(utxo.value) })
        inSum += utxo.value

        const nIn = selected.length

        const outTypesNoChange = [sdbType, sdbType]
        const vbytesNoChange = estimateVbytes(
            nIn,
            walletType,
            outTypesNoChange.length,
            outTypesNoChange
        )
        const feeNoChange = Math.ceil(vbytesNoChange * feeRate)
        const changeNoChange = inSum - target - feeNoChange
        console.log('changeNoChange', changeNoChange)

        if (changeNoChange === 0 || changeNoChange < DUST) {
            if (inSum >= target + feeNoChange) {
                return {
                    inputs: selected,
                    change: 0,
                    fee: feeNoChange,
                }
            }
        } else {
            const outTypesWithChange = [sdbType, sdbType, walletType]
            const vbytesWithChange = estimateVbytes(
                nIn,
                walletType,
                outTypesWithChange.length,
                outTypesWithChange
            )
            const feeWithChange = Math.ceil(vbytesWithChange * feeRate)
            const change = inSum - target - feeWithChange
            console.log('change', change)
            if (change >= DUST && inSum >= target + feeWithChange) {
                return {
                    inputs: selected,
                    change,
                    fee: feeWithChange,
                }
            }
        }
    }

    return {
        error: 'insufficient funds for target + fee',
        inputs: [],
        change: 0,
        fee: 0,
    }
}

/**
 * Fetch UTXOs for the connected wallet address
 * @param walletAddress - The wallet address to fetch UTXOs for
 * @returns Array of selected UTXOs for PSBT creation and change amount
 */
async function fetchWalletUtxos(
    walletAddress: string,
    publicKey: string,
    depositAmount: bigint,
    sdbAddress: string
): Promise<{ utxos: Utxo[]; change: bigint }> {
    try {
        console.log(
            `Fetching UTXOs for wallet address: ${walletAddress}, publicKey: ${publicKey}`
        )

        const mempoolUtxosData = await mempoolUtxos(walletAddress)

        if (!mempoolUtxosData || mempoolUtxosData.length === 0) {
            console.log('No UTXOs found for wallet address')
            return { utxos: [], change: BigInt(0) }
        }

        const selection = await selectNeededUtxos(
            mempoolUtxosData,
            depositAmount,
            walletAddress,
            sdbAddress
        )

        const formattedUtxos: Utxo[] = selection.utxos.map((utxo: any) => ({
            txid: utxo.txid,
            vout: utxo.vout,
            value: utxo.value,
            address: walletAddress,
            pubkeyHex: publicKey,
        }))

        console.log(
            `Selected ${formattedUtxos.length} UTXOs totaling ${selection.totalValue} sats (change: ${selection.change} sats)`
        )
        return { utxos: formattedUtxos, change: selection.change }
    } catch (error) {
        console.error('Error fetching wallet UTXOs:', error)
        return { utxos: [], change: BigInt(0) }
    }
}

/**
 * Hook for using deposit PSBT functionality
 */
export const useDepositPsbt = () => {
    const createDeposit = async (
        params: DepositPsbtParams
    ): Promise<DepositPsbtResult> => {
        // Validate parameters first
        const validation = validateDepositParams(params)
        if (!validation.valid) {
            return {
                success: false,
                error: validation.error,
            }
        }

        return createDepositPsbt(params)
    }

    return {
        createDeposit,
    }
}

async function selectNeededUtxos(
    mempoolUtxosData: { txid: string; vout: number; value: number }[],
    depositAmount: bigint,
    walletAddress: string,
    sdbAddress: string
): Promise<{
    utxos: Utxo[]
    change: bigint
    totalValue: bigint
}> {
    if (depositAmount < BigInt(3000)) {
        throw new Error('Requested amount must be greater than 3000 sats')
    }

    const feeRate = await mempoolFeeRate()

    const sorted = [...mempoolUtxosData].sort((a, b) => b.value - a.value)

    const target = Number(depositAmount)
    const result = selectUtxosGreedy(
        sorted,
        target,
        feeRate,
        addrType(walletAddress),
        addrType(sdbAddress)
    )

    console.log('result', result)

    if ('error' in result) {
        throw new Error(result.error)
    }

    const totalValue = result.inputs.reduce(
        (sum, utxo) => sum + BigInt(utxo.value),
        BigInt(0)
    )

    return {
        utxos: result.inputs,
        change: BigInt(result.change),
        totalValue,
    }
}
