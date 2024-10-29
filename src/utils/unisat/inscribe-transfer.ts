import { InscribeOrderData } from './api-types'
import { mempoolFeeRate, transaction_status } from './httpUtils'

export const inscribe_transfer = async (
    sdb: string,
    amt: number,
    collateral?: number
): Promise<string> => {
    if (sdb === '') {
        throw new Error('SDB Loading Error')
    }

    const ticker = 'SYRON' // @mainnet

    let receiveAddress = process.env.NEXT_PUBLIC_SYRON_MINTER_MAINNET! // @mainnet
    if (!receiveAddress) {
        throw new Error('The receiver address is not defined')
    }

    let devAddress
    let devFee
    if (!collateral) {
        devAddress = receiveAddress // the Syron Minter
        devFee = 1000 // the gas fee to withdraw SYRON
    } else {
        devAddress = sdb // deposit the collateral into the SDB
        devFee = collateral
    }

    // @dev The transaction fee rate in sat/vB @mainnet
    let feeRate = await mempoolFeeRate()
    console.log('Fee Rate', feeRate)
    if (!feeRate) {
        feeRate = 5
    }

    // @dev Inscribe-transfer order
    const order: InscribeOrderData = await fetch(
        `/api/post-unisat-brc20-transfer?receiveAddress=${receiveAddress}&feeRate=${feeRate}&devAddress=${devAddress}&devFee=${devFee}&brc20Ticker=${ticker}&brc20Amount=${amt}`
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

    const unisat = (window as any).unisat

    const txId = await unisat
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
