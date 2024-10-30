import Big from 'big.js'
import useICPHook from '../../hooks/useICP'
import { updateIcpTx, updateInscriptionTx } from '../../store/syron'
import { inscribe_transfer } from '../unisat/inscribe-transfer'
import {
    addInscriptionInfo,
    updateInscriptionInfo,
} from '../unisat/inscription-info'

Big.PE = 999

function useSyronWithdrawal() {
    const { getSUSD, syronWithdrawal } = useICPHook()

    const btc_to_syron = async (
        ssi: string,
        sdb: string,
        amt?: Big,
        collateral?: number,
        tx_id?: string
    ) => {
        let txId: string
        if (tx_id) {
            txId = tx_id
        } else {
            // @dev Inscribe-transfer transaction ID
            txId = await inscribe_transfer(sdb, Number(amt), collateral)
        }

        console.log('Inscribe-Transfer Transaction ID: ', txId)

        try {
            updateInscriptionTx(txId)
            await addInscriptionInfo(txId)

            const res = await getSUSD(ssi, txId)
            updateIcpTx(true)

            return res
        } catch (error) {
            updateIcpTx(false)
            throw error
        } finally {
            await updateInscriptionInfo(txId)
        }
    }

    const syron_withdrawal = async (
        ssi: string,
        sdb: string,
        amt: Big,
        tx_id?: string
    ) => {
        let txId: string
        if (tx_id) {
            txId = tx_id
        } else {
            // @dev Inscribe-transfer transaction ID
            txId = await inscribe_transfer(sdb, Number(amt))
        }

        console.log('Inscribe-Transfer Transaction ID: ', txId)

        try {
            updateInscriptionTx(txId)
            await addInscriptionInfo(txId)

            const dec = 1e8
            const amount = Number(amt.mul(dec))
            console.log('Withdrawal amount: ', amount)

            const res = await syronWithdrawal(ssi, txId, amount)
            updateIcpTx(true)

            updateInscriptionTx(null)
            return res
        } catch (error) {
            updateIcpTx(false)
            throw error
        } finally {
            await updateInscriptionInfo(txId)
        }
    }

    return { btc_to_syron, syron_withdrawal }
}

export default useSyronWithdrawal
