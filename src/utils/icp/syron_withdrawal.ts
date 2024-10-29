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
            updateInscriptionTx(txId)
        }

        console.log('Inscribe-Transfer Transaction ID: ', txId)

        await addInscriptionInfo(txId)

        try {
            const res = await getSUSD(ssi, txId)
            updateIcpTx(true)
            await updateInscriptionInfo(txId)

            // updateInscriptionTx(null)
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
        tx_id?: string
    ) => {
        let txId: string
        if (tx_id) {
            txId = tx_id
        } else {
            // @dev Inscribe-transfer transaction ID
            txId = await inscribe_transfer(sdb, Number(amt))
            updateInscriptionTx(txId)
        }

        console.log('Inscribe-Transfer Transaction ID: ', txId)

        await addInscriptionInfo(txId)

        try {
            const dec = 1e8
            const amount = Number(amt.mul(dec))
            console.log('Withdrawal amount: ', amount)
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

    return { btc_to_syron, syron_withdrawal }
}

export default useSyronWithdrawal
