import React, { useEffect, useState } from 'react'
import * as tyron from 'tyron'
import { useStore } from 'effector-react'
import { toast } from 'react-toastify'
import Image from 'next/image'
import { useDispatch, useSelector } from 'react-redux'
import styles from './styles.module.scss'
import { $resolvedInfo } from '../../../src/store/resolvedInfo'
import { RootState } from '../../../src/app/reducers'
import Selector from '../../Selector'
import { $arconnect } from '../../../src/store/arconnect'
import toastTheme from '../../../src/hooks/toastTheme'
import Ivms101 from './Wallet/Ivms101'
import VC from './Wallet/VC'
import { useTranslation } from 'next-i18next'
import { ZilPayBase } from '../../ZilPay/zilpay-base'
import { setTxId, setTxStatusLoading } from '../../../src/app/actions'
import { updateModalTx, updateModalTxMinimized } from '../../../src/store/modal'
import TransferOwnership from './Wallet/TransferOwnership'
import Pause from '../Pause'
import UpdatePublicEncryption from './Wallet/UpdatePublicEncryption'
import smartContract from '../../../src/utils/smartContract'
import Spinner from '../../Spinner'
import CloseIcoReg from '../../../src/assets/icons/ic_cross.svg'
import CloseIcoBlack from '../../../src/assets/icons/ic_cross_black.svg'
import { updateDonation } from '../../../src/store/donation'
import useArConnect from '../../../src/hooks/useArConnect'
import wallet from '../../../src/hooks/wallet'
import routerHook from '../../../src/hooks/router'
import fetch from '../../../src/hooks/fetch'
import { $isController } from '../../../src/store/controller'
import { $loadingDoc } from '../../../src/store/loading'

function Component() {
    const { t } = useTranslation()
    const { navigate } = routerHook()
    const { fetchDoc } = fetch()
    const resolvedInfo = useStore($resolvedInfo)
    const is_controller = useStore($isController)
    const loadingDoc = useStore($loadingDoc)
    const username = resolvedInfo?.name
    const domain = resolvedInfo?.domain
    const isLight = useSelector((state: RootState) => state.modal.isLight)

    // useEffect(() => {
    //     fetchDoc()
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [])

    if (loadingDoc) {
        return <Spinner />
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.content}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '10%',
                        flexDirection: 'column',
                    }}
                >
                    <div
                        style={{
                            textAlign: 'left',
                            marginTop: '10%',
                        }}
                    >
                        <div className={styles.cardHeadline}>
                            <h3
                                style={{
                                    color: '#dbe4eb',
                                    textTransform: 'none',
                                }}
                            >
                                Soulbound xWallet{' '}
                            </h3>{' '}
                        </div>
                        <h1>
                            <p className={styles.username}>
                                {domain}@{username}.did
                            </p>{' '}
                        </h1>
                    </div>
                    <div
                        style={{
                            marginTop: '100px',
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <h2>
                                <div
                                    onClick={() => {
                                        navigate(
                                            `/${resolvedInfo?.name}/sbt/public`
                                        )
                                    }}
                                    className={styles.flipCard}
                                >
                                    <div className={styles.flipCardInner}>
                                        <div className={styles.flipCardFront}>
                                            <p className={styles.cardTitle3}>
                                                SBT
                                            </p>
                                        </div>
                                        <div className={styles.flipCardBack}>
                                            <p className={styles.cardTitle2}>
                                                SBT
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </h2>
                            <h2 style={{ marginLeft: '20px' }}>
                                <div
                                    onClick={() => {
                                        // if (is_controller) {
                                        navigate(
                                            `/${resolvedInfo?.name}/sbt/wallet`
                                        )
                                        // } else {
                                        //     toast.error(
                                        //         t(
                                        //             'Only X’s DID Controller can access this wallet.',
                                        //             { name: resolvedInfo?.name }
                                        //         ),
                                        //         {
                                        //             position: 'bottom-right',
                                        //             autoClose: 3000,
                                        //             hideProgressBar: false,
                                        //             closeOnClick: true,
                                        //             pauseOnHover: true,
                                        //             draggable: true,
                                        //             progress: undefined,
                                        //             theme: toastTheme(isLight),
                                        //             toastId: 1,
                                        //         }
                                        //     )
                                        // }
                                    }}
                                    className={styles.flipCard}
                                >
                                    <div className={styles.flipCardInner}>
                                        <div className={styles.flipCardFront}>
                                            <p className={styles.cardTitle3}>
                                                {t('WALLET')}
                                            </p>
                                        </div>
                                        <div className={styles.flipCardBack}>
                                            <p className={styles.cardTitle2}>
                                                {t('WEB3 WALLET')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Component
