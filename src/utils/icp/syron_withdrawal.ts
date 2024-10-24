import useICPHook from '../../hooks/useICP'
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

        await addInscriptionInfo(txId)

        const res = await syronWithdrawal(ssi, txId, amt)

        await updateInscriptionInfo(txId)

        return res
    }

    return { syron_withdrawal }
}

export default useSyronWithdrawal
