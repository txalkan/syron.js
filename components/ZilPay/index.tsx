import React from 'react'
import { toast } from 'react-toastify'
import { useDispatch } from 'react-redux'
import { useStore } from 'effector-react'
import { useSelector } from 'react-redux'
import { ZilPayBase } from './zilpay-base'
import { Block, Net } from '../../src/types/zil-pay'
import {
    $transactions,
    updateTxList,
    clearTxList,
    writeNewList,
} from '../../src/store/transactions'
import { updateNet } from '../../src/store/wallet-network'
import {
    updateDashboardState,
    updateModalDashboard,
    $dashboardState,
} from '../../src/store/modal'
import { updateLoginInfoZilpay } from '../../src/app/actions'
import { RootState } from '../../src/app/reducers'

let observer: any = null
let observerNet: any = null
let observerBlock: any = null

export interface ZilAddress {
    base16: string
    bech32: string
}

export const ZilPay: React.FC = () => {
    const dispatch = useDispatch()
    const dashboardState = useStore($dashboardState)
    const loginInfo = useSelector((state: RootState) => state.modal)

    const hanldeObserverState = React.useCallback(
        (zp) => {
            if (zp.wallet.net) {
                updateNet(zp.wallet.net)
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
                    updateNet(net)
                })

            observer = zp.wallet
                .observableAccount()
                .subscribe(async (address: ZilAddress) => {
                    if (loginInfo.zilAddr.bech32 !== address.bech32) {
                        dispatch(updateLoginInfoZilpay(address))
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
        [loginInfo, dispatch]
    )

    const handleConnect = React.useCallback(async () => {
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
                theme: 'dark',
                toastId: 12,
            })
        }
    }, [dispatch, dashboardState, loginInfo.address])

    React.useEffect(() => {
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
                    handleConnect()
                    toast.info(`Unlock the ZilPay browser extension.`, {
                        position: 'top-center',
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: 'dark',
                        toastId: 1,
                    })
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
    }, [
        handleConnect,
        hanldeObserverState,
        loginInfo,
        dispatch,
        dashboardState,
    ])

    const disconnectZilpay = () => {
        dispatch(updateLoginInfoZilpay(null!))
        toast.info('Zilliqa wallet disconnected.', {
            position: 'top-center',
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'dark',
            toastId: 2,
        })
        updateModalDashboard(false)
    }

    return <></>
}

export default ZilPay
