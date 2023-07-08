import React, { useState } from 'react'
import * as tyron from 'tyron'
import { useStore } from 'effector-react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../../src/app/reducers'
import { toast } from 'react-toastify'
import { ZilPayBase } from '../../../ZilPay/zilpay-base'
import { setTxId, setTxStatusLoading } from '../../../../src/app/actions'
import {
    updateModalTx,
    updateModalTxMinimized,
} from '../../../../src/store/modal'
// import { useTranslation } from 'next-i18next'
import { $resolvedInfo } from '../../../../src/store/resolvedInfo'
import toastTheme from '../../../../src/hooks/toastTheme'
import ThreeDots from '../../../Spinner/ThreeDots'
import smartContract from '../../../../src/utils/smartContract'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { $net } from '../../../../src/store/network'

function Component() {
    const dispatch = useDispatch()
    const net = $net.state.net as 'mainnet' | 'testnet'

    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark

    const resolvedInfo = useStore($resolvedInfo)
    const resolvedDomain = resolvedInfo?.user_domain
    const resolvedTLD = resolvedInfo?.user_tld
    const loginInfo = useSelector((state: RootState) => state.modal)
    const { getSmartContract } = smartContract()

    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (resolvedInfo !== null) {
            setLoading(true)
            try {
                if (loginInfo.zilAddr !== null) {
                    const addr = await tyron.SearchBarUtil.default.fetchAddr(
                        net,
                        resolvedTLD!,
                        resolvedDomain!
                    )
                    const get_list = await getSmartContract(
                        addr!,
                        'airdrop_list'
                    )
                    const list: Array<string> = get_list!.result.airdrop_list
                    const is_list = list.filter(
                        (val) => val === loginInfo.zilAddr.base16.toLowerCase()
                    )
                    if (is_list.length === 0) {
                        throw new Error('You are not on the airdrop list.')
                    }
                    const txID = 'Airdrop'
                    const zilpay = new ZilPayBase()
                    dispatch(setTxStatusLoading('true'))
                    updateModalTxMinimized(false)
                    updateModalTx(true)

                    let tx = await tyron.Init.default.transaction(net)

                    await zilpay
                        .call({
                            contractAddress: resolvedInfo?.addr!,
                            transition: txID,
                            params: [],
                            amount: String(0),
                        })
                        .then(async (res: any) => {
                            dispatch(setTxId(res.ID))
                            dispatch(setTxStatusLoading('submitted'))
                            tx = await tx.confirm(res.ID, 33)
                            if (tx.isConfirmed()) {
                                dispatch(setTxStatusLoading('confirmed'))
                                window.open(
                                    `https://viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                                )
                            } else if (tx.isRejected()) {
                                dispatch(setTxStatusLoading('failed'))
                            }
                            setLoading(false)
                        })
                        .catch(() => {
                            setLoading(false)
                            dispatch(setTxStatusLoading('idle'))
                            // throw new Error('Could not confirm the transaction.') @todo-x not thrown
                        })
                } else {
                    throw new Error('Click on CONNECT.')
                    // updateShowZilpay(true) @todo-x
                }
            } catch (error) {
                setLoading(false)
                dispatch(setTxStatusLoading('rejected'))
                updateModalTxMinimized(false)
                updateModalTx(true)
                toast.warn(String(error), {
                    position: 'top-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    // toastId: 2,
                })
            }
        }
    }

    return (
        <div className={styles.wrapper}>
            <h1>
                <div className={styles.username}>
                    {resolvedTLD && <span>{resolvedTLD}@</span>}
                    {resolvedDomain!?.length > 7 && (
                        <div className={styles.usernameMobile}>
                            <br />
                        </div>
                    )}
                    <span>{resolvedDomain}</span>
                    {resolvedDomain!?.length > 7 && (
                        <div className={styles.usernameMobile}>
                            <br />
                        </div>
                    )}
                    <span>.ssi</span>
                </div>{' '}
            </h1>
            {/* <h1 style={{ marginBottom: '14%' }}>airdrop.ssi</h1> */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginTop: '10%',
                    // alignItems: 'center',
                }}
            >
                <div
                    className={isLight ? 'actionBtnLight' : 'actionBtn'}
                    onClick={handleSubmit}
                >
                    {loading ? (
                        <ThreeDots color="yellow" />
                    ) : (
                        <>Claim $TYRON rewards</>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Component
