import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
    updateLoggedInVersion,
    setTxId,
    updateLoginInfoAddress,
    updateLoginInfoArAddress,
    updateLoginInfoUsername,
    updateLoginInfoZilpay,
    updateHasDeFi,
} from '../app/actions'
import { RootState } from '../app/reducers'
import { updateArConnect } from '../store/arconnect'
import { updateBuyInfo } from '../store/buyInfo'
import { updateDashboardState, updateModalDashboard } from '../store/modal'
import { updatePrev } from '../store/router'
import toastTheme from './toastTheme'
import useArConnect from './useArConnect'
import { useCallback } from 'react'

function useRouterHook() {
    const Router = useRouter()
    const { t } = useTranslation()
    const { disconnect } = useArConnect()
    const dispatch = useDispatch()

    const isLight = useSelector((state: RootState) => state.modal.isLight)

    const navigate = (path) => {
        updatePrev(window.location.pathname)
        Router.push(path)
    }

    const logOff = () => {
        try {
            disconnect()
            // @dev remove wallets
            dispatch(updateLoginInfoZilpay(null!))
            dispatch(updateLoginInfoArAddress(null!))

            // @dev remove login info
            dispatch(updateLoginInfoUsername(null!))
            dispatch(updateLoggedInVersion(null!))
            dispatch(updateHasDeFi(false))
            dispatch(updateLoginInfoAddress(null!))

            updateDashboardState(null)
            dispatch(setTxId(''))
            updateArConnect(null)
            updateModalDashboard(false)
            updateBuyInfo(null)
            Router.push('/')
            setTimeout(() => {
                const message = t('You have logged off')
                toast.info(message, {
                    position: 'bottom-center',
                    autoClose: 2222,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 1,
                })
            }, 400)
        } catch (error) {
            console.error(error)
        }
    }

    return {
        navigate,
        logOff,
    }
}

export default useRouterHook
