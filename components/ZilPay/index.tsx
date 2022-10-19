import { ReactNode, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import { useDispatch } from 'react-redux'
import { useStore } from 'effector-react'
import { useSelector } from 'react-redux'
import * as tyron from 'tyron'
import { ZilPayBase } from './zilpay-base'
import { Block, Net } from '../../src/types/zil-pay'
import {
    $transactions,
    updateTxList,
    clearTxList,
    writeNewList,
} from '../../src/store/transactions'
import {
    updateDashboardState,
    updateModalDashboard,
    $dashboardState,
} from '../../src/store/modal'
import {
    updateLoginInfoAddress,
    updateLoginInfoZilpay,
    UpdateNet,
} from '../../src/app/actions'
import { RootState } from '../../src/app/reducers'
import toastTheme from '../../src/hooks/toastTheme'
import routerHook from '../../src/hooks/router'

let observer: any = null
let observerNet: any = null
let observerBlock: any = null

export interface ZilAddress {
    base16: string
    bech32: string
}

export const ZilPay: React.FC = () => {
    const zcrypto = tyron.Util.default.Zcrypto()
    const dispatch = useDispatch()
    const dashboardState = useStore($dashboardState)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const { logOff } = routerHook()

    const hanldeObserverState = useCallback(
        (zp) => {
            if (zp.wallet.net) {
                dispatch(UpdateNet(zp.wallet.net))
            }

            if (observerNet) {
                observerNet.unsubscribe()
            }
            if (observer) {
                observer.unsubscribe()
            }
            if (observerBlock) {
                observerBlock.unsubscribe()
            }

            observerNet = zp.wallet
                .observableNetwork()
                .subscribe((net: Net) => {
                    dispatch(UpdateNet(net))
                })

            observer = zp.wallet
                .observableAccount()
                .subscribe(async (address: ZilAddress) => {
                    if (loginInfo.zilAddr.bech32 !== address.bech32) {
                        dispatch(updateLoginInfoZilpay(address))
                        if (loginInfo.address) {
                            await tyron.SearchBarUtil.default
                                .Resolve(loginInfo.net, loginInfo.address)
                                .then(async (result: any) => {
                                    const did_controller =
                                        zcrypto.toChecksumAddress(
                                            result.controller
                                        )
                                    if (
                                        did_controller.toLowerCase() !==
                                        address?.base16.toLowerCase()
                                    ) {
                                        //@todo-i-fixed remove local storage with global log off function
                                        logOff()
                                        toast.warn(
                                            `DID Controller not valid anymore, disconnecting...`,
                                            {
                                                position: 'bottom-left',
                                                autoClose: 2000,
                                                hideProgressBar: false,
                                                closeOnClick: true,
                                                pauseOnHover: true,
                                                draggable: true,
                                                progress: undefined,
                                                theme: toastTheme(isLight),
                                                toastId: 14,
                                            }
                                        )
                                    }
                                })
                        }
                    }

                    clearTxList()

                    const cache = window.localStorage.getItem(
                        String(zp.wallet.defaultAccount?.base16)
                    )

                    if (cache) {
                        updateTxList(JSON.parse(cache))
                    }
                })

            observerBlock = zp.wallet
                .observableBlock()
                .subscribe(async (block: Block) => {
                    let list = $transactions.getState()
                    for (
                        let index = 0;
                        index < block.TxHashes.length;
                        index++
                    ) {
                        const element = block.TxHashes[index]

                        for (let i = 0; i < list.length; i++) {
                            const tx = list[i]

                            if (tx.confirmed) {
                                continue
                            }

                            if (element.includes(tx.hash)) {
                                try {
                                    const res =
                                        await zp.blockchain.getTransaction(
                                            tx.hash
                                        )
                                    if (
                                        res &&
                                        res.receipt &&
                                        res.receipt.errors
                                    ) {
                                        tx.error = true
                                    }
                                    list[i].confirmed = true
                                } catch {
                                    continue
                                }
                            }
                        }
                    }
                    const listOrPromises = list.map(async (tx) => {
                        if (tx.confirmed) {
                            return tx
                        }

                        try {
                            const res = await zp.blockchain.getTransaction(
                                tx.hash
                            )

                            if (res && res.receipt && res.receipt.errors) {
                                tx.error = true
                            }

                            tx.confirmed = true
                            return tx
                        } catch {
                            return tx
                        }
                    })

                    list = await Promise.all(listOrPromises)
                    writeNewList(list)
                })

            const cache = window.localStorage.getItem(
                String(zp.wallet.defaultAccount?.base16)
            )

            if (cache) {
                updateTxList(JSON.parse(cache))
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [loginInfo, dispatch]
    )

    const handleConnect = useCallback(async () => {
        try {
            const wallet = new ZilPayBase()
            const zp = await wallet.zilpay()
            const connected = await zp.wallet.connect()

            const network = zp.wallet.net
            dispatch(UpdateNet(network))

            if (connected && zp.wallet.defaultAccount) {
                const address = zp.wallet.defaultAccount
                dispatch(updateLoginInfoZilpay(address))
                if (dashboardState === null) {
                    if (loginInfo.address) {
                        updateDashboardState('loggedIn')
                    } else {
                        updateDashboardState('connected')
                    }
                }
            }

            const cache = window.localStorage.getItem(
                String(zp.wallet.defaultAccount?.base16)
            )
            if (cache) {
                updateTxList(JSON.parse(cache))
            }
        } catch (err) {
            toast.error(String(err), {
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
    }, [dispatch, dashboardState, loginInfo.address])

    useEffect(() => {
        if (dashboardState === null) {
            handleConnect()
        } else {
            const wallet = new ZilPayBase()
            wallet
                .zilpay()
                .then((zp: any) => {
                    hanldeObserverState(zp)
                })
                .catch(() => {
                    updateModalDashboard(false)
                    // handleConnect()
                    // toast.info(`Unlock the ZilPay browser extension.`, {
                    //     position: 'top-center',
                    //     autoClose: 2000,
                    //     hideProgressBar: false,
                    //     closeOnClick: true,
                    //     pauseOnHover: true,
                    //     draggable: true,
                    //     progress: undefined,
                    //     theme: toastTheme(isLight),
                    //     toastId: 1,
                    // })
                })
        }

        return () => {
            if (observer) {
                observer.unsubscribe()
            }
            if (observerNet) {
                observerNet.unsubscribe()
            }
            if (observerBlock) {
                observerBlock.unsubscribe()
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        // handleConnect,
        hanldeObserverState,
        // loginInfo,
        // dispatch,
        // dashboardState,
    ])

    //@todo-r remove zilpay connection
    const disconnectZilpay = () => {
        dispatch(updateLoginInfoZilpay(null!))
        toast.info('ZilPay wallet disconnected.', {
            position: 'top-center',
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: toastTheme(isLight),
            toastId: 2,
        })
        updateModalDashboard(false)
    }

    return <></>
}

export default ZilPay
