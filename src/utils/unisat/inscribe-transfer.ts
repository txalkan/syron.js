import {
    getMinterAddress,
    MinterType,
    getWalletWindow,
} from '../../config/wallet'
import { InscribeOrderData } from './api-types'
import { transaction_status } from './httpUtils'

export const inscribe_transfer = async (
    sdb: string,
    brc20_amt: number,
    fee_rate: number,
    walletType: 'unisat' | 'okx' | null,
    collateral?: number,
    network_fee?: number
): Promise<string> => {
    if (sdb === '') {
        throw new Error('SDB Loading Error')
    }

    // @brc20
    const ticker = 'SYRON'

    let receiveAddress = getMinterAddress(MinterType.BRC20)

    console.log(
        'receiveAddress for inscribe-transfer (brc20 minter)',
        receiveAddress
    )

    if (!receiveAddress) {
        // Enhanced error message with environment variable debugging
        const version = process.env.NEXT_PUBLIC_SYRON_VERSION
        const isTestnet = process.env.NEXT_PUBLIC_SYRON_VERSION === 'testnet'
        const expectedEnvVar = isTestnet
            ? 'NEXT_PUBLIC_SYRON_MINTER_TESTNET'
            : version === '2'
              ? 'NEXT_PUBLIC_SYRON_MINTER_MAINNET2'
              : 'NEXT_PUBLIC_SYRON_MINTER_MAINNET'

        console.error('Environment variable debugging:', {
            version,
            isTestnet,
            expectedEnvVar,
            NEXT_PUBLIC_SYRON_VERSION: process.env.NEXT_PUBLIC_SYRON_VERSION,
            NEXT_PUBLIC_SYRON_MINTER_MAINNET: process.env
                .NEXT_PUBLIC_SYRON_MINTER_MAINNET
                ? 'SET'
                : 'NOT_SET',
            NEXT_PUBLIC_SYRON_MINTER_MAINNET2: process.env
                .NEXT_PUBLIC_SYRON_MINTER_MAINNET2
                ? 'SET'
                : 'NOT_SET',
            NEXT_PUBLIC_SYRON_MINTER_TESTNET: process.env
                .NEXT_PUBLIC_SYRON_MINTER_TESTNET
                ? 'SET'
                : 'NOT_SET',
        })

        throw new Error(
            `The receiver address is not defined. Expected environment variable: ${expectedEnvVar}. ` +
                `Current version: ${version || 'undefined'}, isTestnet: ${isTestnet}. ` +
                `Please check your environment configuration.`
        )
    }

    let devAddress
    let devFee
    if (!collateral) {
        // Choose treasury addr based on version
        let treasury_addr = process.env.NEXT_PUBLIC_SYRON_TREASURY_MAINNET
        const version = process.env.NEXT_PUBLIC_SYRON_VERSION
        if (version === '2') {
            treasury_addr = process.env.NEXT_PUBLIC_SYRON_TREASURY_MAINNET2
        } else if (version === 'testnet') {
            treasury_addr = process.env.NEXT_PUBLIC_SYRON_TREASURY_TESTNET
        }
        devAddress = treasury_addr
        devFee = 546 // @governance brc-20 withdrawal fee
    } else {
        devAddress = sdb // deposit the collateral into the SDB
        devFee = collateral
    }

    let outputValue = 330

    if (network_fee) {
        outputValue += network_fee
    }

    // @dev Inscribe-transfer order
    const order: InscribeOrderData = await fetch(
        `/api/post-unisat-brc20-transfer?receiveAddress=${receiveAddress}&feeRate=${fee_rate}&devAddress=${devAddress}&devFee=${devFee}&brc20Ticker=${ticker}&brc20Amount=${brc20_amt}&outputValue=${outputValue}`
    )
        .then((response) => {
            if (!response.ok) {
                throw new Error(
                    `The inscribe-transfer order request failed with status ${response.status}`
                )
            }
            return response.json()
        })
        .then((res) => res.data)

    console.log('Inscribe-transfer order: ', JSON.stringify(order, null, 2))

    const walletWindow = getWalletWindow(walletType)

    const txId = await walletWindow
        .sendBitcoin(order.payAddress, order.amount, order.feeRate)
        .then(async (txId1) => {
            console.log(
                'Inscribe-Transfer: Unconfirmed - Transaction ID #1',
                txId1
            )

            await transaction_status(txId1)
            const order_ = await fetch(
                `/api/get-unisat-brc20-order?id=${order.orderId}`
            )
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(
                            `The get-order API request failed with status ${response.status}`
                        )
                    }
                    return response.json()
                })
                .then((res) => res.data)

            console.log('Order From OrderId', JSON.stringify(order_, null, 2))
            const inscription_id = order_.files[0].inscriptionId

            const txId = inscription_id.slice(0, -2)

            await transaction_status(txId)
            console.log(
                'Inscribe-Transfer: Confirmed - Transaction ID #2',
                txId
            )

            return txId
        })

    return String(txId)
}
