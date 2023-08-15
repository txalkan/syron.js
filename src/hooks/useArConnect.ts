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
            console.log('ARCONNECT')
            try {
                const permissions = await arConnect
                    .getPermissions()
                    .catch((err) => {
                        throw err
                    })
                console.log('AR_PERMISSIONS:', permissions)
                if (permissions.includes(PERMISSIONS_TYPES.ACCESS_ADDRESS)) {
                    const address = await arConnect.getActiveAddress()
                    console.log('AR_ADDRESS:', address)
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
                    window.addEventListener(
                        'walletSwitch',
                        walletSwitchListener
                    )
                } else {
                    console.log('ARCONNECT_GETPERMISSION')
                    await connectPermission().catch((err) => {
                        throw err
                    })
                }
                updateArConnect(arConnect)
                // Event cleaner
                return () =>
                    window.removeEventListener(
                        'walletSwitch',
                        walletSwitchListener
                    )
            } catch (err) {
                console.error(err)
                // toast.warning(String(err), {
                //     position: 'top-right',
                //     autoClose: 3000,
                //     hideProgressBar: false,
                //     closeOnClick: true,
                //     pauseOnHover: true,
                //     draggable: true,
                //     progress: undefined,
                //     theme: toastTheme(isLight),
                //     toastId: 2,
                // })
            }
        } else {
            toast('To use the permaweb, connect ArConnect desktop wallet.', {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
                toastId: 5,
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
            } catch (err) {
                console.error(err)
                // window.location.reload()
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
                    window.removeEventListener(
                        'walletSwitch',
                        walletSwitchListener
                    )
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
                    toast.warn('Failed to disconnect ArConnect.', {
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
