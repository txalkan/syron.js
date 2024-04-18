import { useStore } from 'effector-react'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { ZilPayBase } from '../../components/ZilPay/zilpay-base'
import { updateLoginInfoZilpay } from '../app/actions'
import { RootState } from '../app/reducers'
import { $dashboardState, updateDashboardState } from '../store/modal'
// @review import { updateTxList } from '../store/transactions'
import toastTheme from './toastTheme'
import { updateNet } from '../store/network'

function useZilpayHook() {
    const dispatch = useDispatch()
    const loginInfo = useSelector((state: RootState) => state.modal)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const dashboardState = useStore($dashboardState)

    const handleConnect = useCallback(async () => {
        try {
            const wallet = new ZilPayBase()
            const zp = await wallet.zilpay()
            const connected = await zp.wallet.connect()

            const network = zp.wallet.net
            updateNet(network)

            if (connected && zp.wallet.defaultAccount) {
                const address = zp.wallet.defaultAccount
                dispatch(updateLoginInfoZilpay(address))
                if (dashboardState === null) {
                    if (loginInfo.loggedInAddress) {
                        updateDashboardState('loggedIn')
                    } else {
                        updateDashboardState('connected')
                    }
                }
            }

            // const cache = window.localStorage.getItem(
            //     String(zp.wallet.defaultAccount?.base16)
            // )
            // if (cache) {
            //     updateTxList(JSON.parse(cache))
            // }
        } catch (err) {
            toast.warn(String(err), {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 12,
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, dashboardState, loginInfo.loggedInAddress])

    return {
        handleConnect,
    }
}

export default useZilpayHook
