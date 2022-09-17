import { useCallback } from 'react'
import useAC from 'use-arconnect'
import { toast } from 'react-toastify'
import { useStore } from 'effector-react'
import { useDispatch as _dispatchRedux, useSelector } from 'react-redux'
import { PERMISSIONS_TYPES, PERMISSIONS } from '../constants/arconnect'
import { $ar_address, updateArAddress } from '../../src/store/ar_address'
import { updateLoginInfoArAddress } from '../app/actions'
import { RootState } from '../app/reducers'
import { useTranslation } from 'next-i18next'
import { $arconnect, updateArConnect } from '../store/arconnect'
import toastTheme from './toastTheme'

function useArConnect() {
    const { t } = useTranslation()
    const arConnect = useAC()
    const dispatchRedux = _dispatchRedux()

    const loginInfo = useSelector((state: RootState) => state.modal)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const arAddress = loginInfo?.arAddr
    const ar_address = useStore($ar_address)

    const walletSwitchListener = useCallback(
        (e: any) => dispatchRedux(updateLoginInfoArAddress(e.detail.address)),
        [dispatchRedux]
    )

    // Gets address if permissions are already granted.
    const connect = async () => {
        if (arConnect) {
            try {
                updateArConnect(arConnect)

                const permissions = await arConnect.getPermissions()
                if (permissions.includes(PERMISSIONS_TYPES.ACCESS_ADDRESS)) {
                    const address = await arConnect.getActiveAddress()
                    // toast.info(
                    //     `${t('Arweave wallet connected to')} ${address.slice(
                    //         0,
                    //         6
                    //     )}...${address.slice(-6)}`,
                    //     {
                    //         position: 'top-center',
                    //         autoClose: 2000,
                    //         hideProgressBar: false,
                    //         closeOnClick: true,
                    //         pauseOnHover: true,
                    //         draggable: true,
                    //         progress: undefined,
                    //         theme: toastTheme(isLight),
                    //         toastId: 2,
                    //     }
                    // )

                    // @todo-i why is it duplicated with both updateLoginInfoArAddress & updateArAddess?
                    dispatchRedux(updateLoginInfoArAddress(address))
                    updateArAddress(address)
                    window.addEventListener(
                        'walletSwitch',
                        walletSwitchListener
                    )
                } else {
                    connectPermission()
                }
                // Event cleaner
                return () =>
                    window.removeEventListener(
                        'walletSwitch',
                        walletSwitchListener
                    )
            } catch (err) {
                toast.error(t(String(err)), {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 2,
                })
            }
        }
    }

    const connectPermission = useCallback(
        async (callback?: () => void) => {
            try {
                await arConnect.connect(PERMISSIONS)
                const address = await arConnect.getActiveAddress()

                dispatchRedux(updateLoginInfoArAddress(address))
                window.addEventListener('walletSwitch', walletSwitchListener)
                callback?.()
                // toast.info(
                //     `${t('Arweave wallet connected to')} ${address.slice(
                //         0,
                //         6
                //     )}...${address.slice(-6)}`,
                //     {
                //         position: 'top-center',
                //         autoClose: 2000,
                //         hideProgressBar: false,
                //         closeOnClick: true,
                //         pauseOnHover: true,
                //         draggable: true,
                //         progress: undefined,
                //         theme: toastTheme(isLight),
                //         toastId: 2,
                //     }
                // )
            } catch {
                dispatchRedux(updateLoginInfoArAddress(null!))
                toast.error(`Couldn't connect with ArConnect`, {
                    position: 'top-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 3,
                })
            }
        },
        [arConnect, walletSwitchListener, dispatchRedux]
    )

    const disconnect = useCallback(
        async (callback?: () => void) => {
            try {
                await arConnect.disconnect()
                dispatchRedux(updateLoginInfoArAddress(null!))
                window.removeEventListener('walletSwitch', walletSwitchListener)
                callback?.()
                // toast.info(t('ArConnect disconnected!'), {
                //     position: 'top-center',
                //     autoClose: 2000,
                //     hideProgressBar: false,
                //     closeOnClick: true,
                //     pauseOnHover: true,
                //     draggable: true,
                //     progress: undefined,
                //     theme: toastTheme(isLight),
                // })
            } catch {
                toast.error('Failed to disconnect ArConnect.', {
                    position: 'top-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 4,
                })
            }
        },
        [arConnect, dispatchRedux, walletSwitchListener]
    )

    const verifyArConnect = async (action: any) => {
        if (arAddress === null) {
            connect().then(() => {
                action
            })
        } else {
            action
        }
    }

    return {
        connect,
        disconnect,
        isAuthenticated: !!arAddress,
        isArConnectInstalled: !!arConnect,
        arAddress: ar_address,
        verifyArConnect,
    }
}

export default useArConnect
