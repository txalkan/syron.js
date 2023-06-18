/*
ZilPay.io
Copyright (c) 2023 by Rinat <https://github.com/hicaru>
All rights reserved.
You acknowledge and agree that ZilPay owns all legal right, title and interest in and to the work, software, application, source code, documentation and any other documents in this file (collectively, the Program), including any intellectual property rights which subsist in the Program (whether those rights happen to be registered or not, and wherever in the world those rights may exist), whether in source code or any other form.
Subject to the limited license below, you may not (and you may not permit anyone else to) distribute, publish, copy, modify, merge, combine with another program, create derivative works of, reverse engineer, decompile or otherwise attempt to extract the source code of, the Program or any part thereof, except that you may contribute to this software.
You are granted a non-exclusive, non-transferable, non-sublicensable license to distribute, publish, copy, modify, merge, combine with another program or create derivative works of the Program (such resulting program, collectively, the Resulting Program) solely for Non-Commercial Use as long as you:
1. give prominent notice (Notice) with each copy of the Resulting Program that the Program is used in the Resulting Program and that the Program is the copyright of ZilPay; and
2. subject the Resulting Program and any distribution, publication, copy, modification, merger therewith, combination with another program or derivative works thereof to the same Notice requirement and Non-Commercial Use restriction set forth herein.
Non-Commercial Use means each use as described in clauses (1)-(3) below, as reasonably determined by ZilPay in its sole discretion:
1. personal use for research, personal study, private entertainment, hobby projects or amateur pursuits, in each case without any anticipated commercial application;
2. use by any charitable organization, educational institution, public research organization, public safety or health organization, environmental protection organization or government institution; or
3. the number of monthly active users of the Resulting Program across all versions thereof and platforms globally do not exceed 10,000 at any time.
You will not use any trade mark, service mark, trade name, logo of ZilPay or any other company or organization in a way that is likely or intended to cause confusion about the owner or authorized user of such marks, names or logos.
If you have any questions, comments or interest in pursuing any other use cases, please reach out to us at mapu@ssiprotocol.com.*/

//@review

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
    // updateTxList, @review
    // clearTxList,
    // writeNewList,
} from '../../src/store/transactions'
import {
    updateDashboardState,
    updateModalDashboard,
    $dashboardState,
    updateUnlockToast,
    $unlockToast,
} from '../../src/store/modal'
import {
    updateLoginInfoAddress,
    updateLoginInfoZilpay,
    UpdateNet,
} from '../../src/app/actions'
import { RootState } from '../../src/app/reducers'
import toastTheme from '../../src/hooks/toastTheme'
import routerHook from '../../src/hooks/router'
import zilpayHook from '../../src/hooks/zilpayHook'

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
    const { handleConnect } = zilpayHook()

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

                    // clearTxList()

                    // const cache = window.localStorage.getItem(
                    //     String(zp.wallet.defaultAccount?.base16)
                    // )

                    // if (cache) {
                    //     updateTxList(JSON.parse(cache))
                    // }
                })

            // observerBlock = zp.wallet
            //     .observableBlock()
            //     .subscribe(async (block: Block) => {
            //         let list = $transactions.getState()
            //         for (
            //             let index = 0;
            //             index < block.TxHashes.length;
            //             index++
            //         ) {
            //             const element = block.TxHashes[index]

            //             for (let i = 0; i < list.length; i++) {
            //                 const tx = list[i]

            //                 if (tx.confirmed) {
            //                     continue
            //                 }

            //                 if (element.includes(tx.hash)) {
            //                     try {
            //                         const res =
            //                             await zp.blockchain.getTransaction(
            //                                 tx.hash
            //                             )
            //                         if (
            //                             res &&
            //                             res.receipt &&
            //                             res.receipt.errors
            //                         ) {
            //                             tx.error = true
            //                         }
            //                         list[i].confirmed = true
            //                     } catch {
            //                         continue
            //                     }
            //                 }
            //             }
            //         }
            //         const listOrPromises = list.map(async (tx) => {
            //             if (tx.confirmed) {
            //                 return tx
            //             }

            //             try {
            //                 const res = await zp.blockchain.getTransaction(
            //                     tx.hash
            //                 )

            //                 if (res && res.receipt && res.receipt.errors) {
            //                     tx.error = true
            //                 }

            //                 tx.confirmed = true
            //                 return tx
            //             } catch {
            //                 return tx
            //             }
            //         })

            //         list = await Promise.all(listOrPromises)
            //         writeNewList(list)
            //     })

            // const cache = window.localStorage.getItem(
            //     String(zp.wallet.defaultAccount?.base16)
            // )

            // if (cache) {
            //     updateTxList(JSON.parse(cache))
            // }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [loginInfo, dispatch]
    )

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
                    if ($unlockToast.getState()) {
                        toast.info(`Unlock the ZilPay browser extension.`, {
                            position: 'top-center',
                            autoClose: 2000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: toastTheme(isLight),
                            toastId: 1,
                        })
                    }
                    updateUnlockToast(false)
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

    //@todo-x remove zilpay connection
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
