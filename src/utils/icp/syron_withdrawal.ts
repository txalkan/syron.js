import useICPHook from '../../hooks/useICP'
import { updateIcpTx, updateInscriptionTx } from '../../store/syron'
import { inscribe_transfer } from '../unisat/inscribe-transfer'
import {
    addInscriptionInfo,
    updateInscriptionInfo,
} from '../unisat/inscription-info'

function useSyronWithdrawal() {
    const { syronWithdrawal } = useICPHook()

    const syron_withdrawal = async (ssi: string, sdb: string, amt: number) => {
        // @dev Inscribe-transfer transaction ID
        const devFee = 0
        const txId = await inscribe_transfer(sdb, devFee, amt)
        updateInscriptionTx(txId)

        await addInscriptionInfo(txId)

        try {
            const res = await syronWithdrawal(ssi, txId, amt)
            updateIcpTx(true)
            await updateInscriptionInfo(txId)
            return res
        } catch (error) {
            updateIcpTx(false)
        }
    }

    return { syron_withdrawal }
}

export default useSyronWithdrawal
