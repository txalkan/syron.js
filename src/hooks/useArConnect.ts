import { useCallback } from 'react'
import useAC from 'use-arconnect'
import { toast } from 'react-toastify'
import { useDispatch as _dispatchRedux, useSelector } from 'react-redux'
import { PERMISSIONS_TYPES, PERMISSIONS } from '../constants/arconnect'
import { updateLoginInfoArAddress } from '../app/actions'
import { RootState } from '../app/reducers'
import { updateArConnect } from '../store/arconnect'
import toastTheme from './toastTheme'

function useArConnect() {
    const arConnect = useAC()
    const dispatchRedux = _dispatchRedux()

    const loginInfo = useSelector((state: RootState) => state.modal)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const arAddress = loginInfo?.arAddr

    const walletSwitchListener = useCallback(
        (e: any) => dispatchRedux(updateLoginInfoArAddress(e.detail.address)),
        [dispatchRedux]
    )

    // Gets address if permissions are already granted.
    const connect = async () => {
        if (arConnect) {
            try {
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

                    dispatchRedux(updateLoginInfoArAddress(address))
                    window.addEventListener('walletSwitch', walletSwitchListener)
                } else {
                    await connectPermission()
                }
                updateArConnect(arConnect)
                // Event cleaner
                return () =>
                    window.removeEventListener('walletSwitch', walletSwitchListener)
            } catch (err) {
                toast.warning(String(err), {
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
        } else {
            // throw new Error(`Connect with ArConnect for more features.`)
            toast.info(`You can download ArConnect for more features.`, {
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
                window.location.reload()
                updateArConnect(null)
                dispatchRedux(updateLoginInfoArAddress(null!))
                toast.warning(`ArConnect rejected`, {
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
            if (arConnect) {
                try {
                    await arConnect.disconnect()
                    updateArConnect(null)
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
            }
        },
        [arConnect, dispatchRedux, walletSwitchListener]
    )

    // const verifyArConnect = async (action: any) => {
    //     connect().then(() => {
    //         action
    //     })
    //         .catch(err => {
    //             toast.warning(String(err), {
    //                 position: 'top-right',
    //                 autoClose: 2000,
    //                 hideProgressBar: false,
    //                 closeOnClick: true,
    //                 pauseOnHover: true,
    //                 draggable: true,
    //                 progress: undefined,
    //                 theme: toastTheme(isLight),
    //                 toastId: 3,
    //             })
    //         })
    // }

    return {
        connect,
        disconnect,
        isAuthenticated: !!arAddress,
        isArConnectInstalled: !!arConnect,
        // verifyArConnect,
    }
}

export default useArConnect
