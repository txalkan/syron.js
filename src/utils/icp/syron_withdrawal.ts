import Big from 'big.js'
import useICPHook, { parseTxOkArray } from '../../hooks/useICP'
import { updateIcpTx, updateInscriptionTx } from '../../store/syron'
import { inscribe_transfer } from '../unisat/inscribe-transfer'
import {
    addInscriptionInfo,
    updateInscriptionInfo,
} from '../unisat/inscription-info'
import { mempoolFeeRate } from '../unisat/httpUtils'

Big.PE = 999

function useSyronWithdrawal() {
    const {
        getSUSD,
        syronWithdrawal,
        syronWithdrawalRunes,
        sendSyron,
        buyBtc,
    } = useICPHook()

    const btc_to_syron = async (
        ssi: string,
        sdb: string,
        amt?: Big,
        collateral?: number,
        tx_id?: string
    ) => {
        try {
            let txId: string
            if (tx_id) {
                txId = tx_id
            } else {
                const fee = await mempoolFeeRate()

                if (!amt)
                    throw new Error('The inscribed amount cannot be missing')

                if (!fee) throw new Error('The fee rate cannot be missing')

                // @dev Inscribe-transfer transaction ID
                txId = await inscribe_transfer(
                    sdb,
                    Number(amt),
                    fee,
                    collateral
                )
            }

            console.log('Inscribe-Transfer Transaction ID: ', txId)

            updateInscriptionTx(txId)
            await addInscriptionInfo(txId)

            const res = await getSUSD(ssi, txId)
            updateIcpTx(true)

            await updateInscriptionInfo(txId)
            updateInscriptionTx(null)
            return res
        } catch (error) {
            updateIcpTx(false)
            throw error
        }
    }

    const syron_withdrawal = async (
        ssi: string,
        sdb: string,
        amt: Big,
        tx_id?: string,
        fee_rate?: number,
        network_fee?: number
    ) => {
        let txId: string
        if (tx_id) {
            txId = tx_id
        } else if (fee_rate) {
            // @dev Inscribe-transfer transaction ID
            txId = await inscribe_transfer(
                sdb,
                Number(amt),
                fee_rate,
                undefined, // collateral - not needed for withdrawal
                network_fee
            )
        } else {
            throw new Error('Transaction ID or fee rate must be provided')
        }

        console.log('Inscribe-Transfer Transaction ID: ', txId)

        try {
            updateInscriptionTx(txId)
            await addInscriptionInfo(txId)

            const dec = 1e8
            const amount = Number(amt.mul(dec))

            const res = await syronWithdrawal(ssi, txId, amount)
            updateIcpTx(true)

            await updateInscriptionInfo(txId)
            updateInscriptionTx(null)
            return res
        } catch (error) {
            updateIcpTx(false)
            throw error
        }
    }

    const runes_withdrawal = async (ssi: string, amt: Big) => {
        try {
            const dec = 1e8
            const amount = Number(amt.mul(dec))

            const res = await syronWithdrawalRunes(ssi, amount)
            updateIcpTx(true)
            return res
        } catch (error) {
            updateIcpTx(false)
            throw error
        }
    }

    const send_syron = async (
        ssi: string,
        recipient: string,
        amt: Big,
        isICP: boolean
    ) => {
        try {
            const dec = 1e8
            const amount = Number(amt.mul(dec))

            const res = await sendSyron(ssi, recipient, amount, isICP)

            return res
        } catch (error) {
            throw error
        }
    }

    const buy_btc = async (ssi: string, amt: Big, btcAmt: Big) => {
        try {
            const dec = 1e8
            const amount = Number(amt.mul(dec))
            const btcAmount = Number(btcAmt.mul(dec).round(0))

            const res = await buyBtc(ssi, amount, btcAmount)
            const array = parseTxOkArray(res)

            if (array.length > 0) return array
            return res
        } catch (error) {
            throw error
        }
    }

    return {
        btc_to_syron,
        syron_withdrawal,
        runes_withdrawal,
        send_syron,
        buy_btc,
    }
}

export default useSyronWithdrawal
