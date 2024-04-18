import React, { useState, useEffect } from 'react'
import styles from './styles.module.scss'
import { updateDonation } from '../../src/store/donation'
import Image from 'next/image'
import icoDown from '../../src/assets/icons/ssi_icon_3arrowsDown.svg'
import icoUp from '../../src/assets/icons/ssi_icon_3arrowsUp.svg'
import icoDown2 from '../../src/assets/icons/ssi_icon_2arrowsDown.svg'
import icoUp2 from '../../src/assets/icons/ssi_icon_2arrowsUP.svg'

import icoDex from '../../src/assets/icons/ssi_icon_tydraDEX.svg'
import icoDefi from '../../src/assets/icons/ssi_icon_defix.svg'
import icoSbt from '../../src/assets/icons/ssi_icon_sbtx.svg'
import icoStake from '../../src/assets/icons/ssi_icon_stake.svg'

import icoReceive from '../../src/assets/icons/ssi_icon_receive.svg'
import icoDrop from '../../src/assets/icons/ssi_icon_drop.svg'
import icoZap from '../../src/assets/icons/ssi_icon_thunder.svg'
import icoFire from '../../src/assets/icons/ssi_icon_fire.svg'

import { useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'
import { SwapPair } from '../../src/types/swap'
import { SwapForm } from '../swap-form'
import { AddFunds, Balances, ClaimWallet, SBTxWALLET, ZILxWALLET } from '..'
import { PoolOverview } from '../pool'
import { useStore } from 'react-stores'
import { useStore as effectorStore } from 'effector-react'
import { $resolvedInfo } from '../../src/store/resolvedInfo'
import useFetch from '../../src/hooks/fetch'
import { $doc } from '../../src/store/did-doc'
import { $net } from '../../src/store/network'
import { $wallet } from '../../src/store/wallet'
import { DragonDex } from '../../src/mixins/dex'
import { useTranslation } from 'next-i18next'
type Prop = {
    startPair: SwapPair[]
}

const dex = new DragonDex()
export const Defix: React.FC<Prop> = ({ startPair }) => {
    const { t } = useTranslation()
    const [active, setActive] = useState('trade')
    const isLight = useSelector((state: RootState) => state.modal.isLight)

    const toggleActive = (id: string) => {
        resetState()
        if (id === active) {
            setActive('')
        } else {
            setActive(id)
        }
    }
    const resetState = () => {
        updateDonation(null)
        dex.updateState()
    }

    const [activeAcc, setActiveAcc] = useState('')
    const toggleActiveAcc = (id: string) => {
        if (id === activeAcc) {
            setActiveAcc('')
        } else {
            setActiveAcc(id)
        }
    }

    const { fetchDoc } = useFetch()
    const controller_ = effectorStore($doc)?.controller.toLowerCase()
    const resolvedInfo = useStore($resolvedInfo)

    const resolvedDomain =
        resolvedInfo?.user_domain! && resolvedInfo.user_domain
            ? resolvedInfo.user_domain
            : ''

    const loginInfo = useSelector((state: RootState) => state.modal)
    const zilpay_addr =
        loginInfo?.zilAddr !== null
            ? loginInfo?.zilAddr.base16.toLowerCase()
            : ''
    const net = $net.state.net as 'mainnet' | 'testnet'

    const wallet = useStore($wallet)
    useEffect(() => {
        console.log('/defix: UPDATE_DID_DOC')
        fetchDoc()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [net, wallet])
    useEffect(() => {
        if (wallet) {
            dex.updateState()
        }
    }, [wallet])

    return (
        <div className={styles.container}>
            {/* @dev: trade */}
            <div className={styles.cardActiveWrapper}>
                <div
                    onClick={() => toggleActive('trade')}
                    className={
                        active === 'trade' ? styles.cardActive : styles.card
                    }
                >
                    {/* @review: majin translates */}
                    <div className={styles.icoWrapper2}>
                        <Image
                            src={icoDex}
                            alt="trade-ico"
                            height="44"
                            width="44"
                        />
                        <div className={styles.titleX}>TyronDEX</div>
                    </div>
                    <div className={styles.icoWrapper}>
                        <Image
                            src={active === 'trade' ? icoUp : icoDown}
                            alt="toggle-ico"
                        />
                    </div>
                </div>
                {active === 'trade' && (
                    <div className={styles.cardSub}>
                        <div className={styles.wrapper}>
                            {/* @dev: SWAP */}
                            <SwapForm startPair={startPair} />
                        </div>
                    </div>
                )}
            </div>
            {/* @dev: account */}
            {resolvedDomain !== 'tydradex' && resolvedDomain !== 'tyrondex' && (
                <div className={styles.cardActiveWrapper}>
                    <div
                        onClick={() => toggleActive('account')}
                        className={
                            active === 'account'
                                ? styles.cardActive
                                : styles.card
                        }
                    >
                        <div className={styles.icoWrapper2}>
                            <Image
                                src={icoZap}
                                alt="account-ico"
                                height="44"
                                width="44"
                            />
                            <div className={styles.titleX}>DEFIxWALLET</div>
                        </div>
                        <div className={styles.icoWrapper}>
                            <Image
                                src={active === 'account' ? icoUp : icoDown}
                                alt="toggle-ico"
                            />
                        </div>
                    </div>
                    {active === 'account' && (
                        <div className={styles.cardSub}>
                            <div className={styles.wrapper}>
                                {controller_ === zilpay_addr ? (
                                    <div className={styles.subWrapperBal}>
                                        <Balances />
                                    </div>
                                ) : (
                                    <>
                                        <div className={styles.subWrapper}>
                                            {/* @dev: deposits */}
                                            <div
                                                onClick={() =>
                                                    toggleActiveAcc('receive')
                                                }
                                                className={
                                                    activeAcc === 'receive'
                                                        ? styles.cardActive2
                                                        : styles.card2
                                                }
                                            >
                                                {/* @review: majin translates */}
                                                <div
                                                    className={
                                                        styles.icoWrapper2
                                                    }
                                                >
                                                    <Image
                                                        src={icoReceive}
                                                        alt="receive-ico"
                                                    />
                                                    <div
                                                        className={
                                                            styles.title2
                                                        }
                                                    >
                                                        receive
                                                    </div>
                                                </div>
                                                <div
                                                    className={
                                                        styles.icoWrapper
                                                    }
                                                >
                                                    <Image
                                                        src={
                                                            activeAcc ===
                                                            'receive'
                                                                ? icoUp2
                                                                : icoDown2
                                                        }
                                                        alt="toggle-ico"
                                                    />
                                                </div>
                                            </div>
                                            {activeAcc === 'receive' && (
                                                <div
                                                    className={styles.cardSub2}
                                                >
                                                    <AddFunds type="funds" />
                                                </div>
                                            )}
                                        </div>

                                        <div className={styles.subWrapper}>
                                            <ClaimWallet title="CLAIM DEFIxWALLET" />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
            {/* @dev: Soulbound tokens */}
            {/* @dev: DeFi */}
            {/* @dev: staking */}
            {resolvedDomain !== 'tydradex' &&
                resolvedDomain !== 'tyrondex' &&
                controller_ === zilpay_addr && (
                    <>
                        <div className={styles.cardActiveWrapper}>
                            <div
                                onClick={() => toggleActive('sbt')}
                                className={
                                    active === 'sbt'
                                        ? styles.cardActive
                                        : styles.card
                                }
                            >
                                <div className={styles.icoWrapper2}>
                                    <Image
                                        src={icoSbt}
                                        alt="sbt-ico"
                                        height="44"
                                        width="44"
                                    />
                                    <div className={styles.title}>
                                        Soulbound
                                    </div>
                                </div>
                                <div className={styles.icoWrapper}>
                                    <Image
                                        src={active === 'sbt' ? icoUp : icoDown}
                                        alt="toggle-ico"
                                    />
                                </div>
                            </div>
                            {active === 'sbt' && (
                                <div className={styles.cardSub}>
                                    <div className={styles.wrapper}>
                                        <SBTxWALLET type="public" />
                                    </div>
                                    {controller_ === zilpay_addr && (
                                        <div className={styles.wrapper}>
                                            <SBTxWALLET type="wallet" />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className={styles.cardActiveWrapper}>
                            <div
                                onClick={() => toggleActive('pools')}
                                className={
                                    active === 'pools'
                                        ? styles.cardActive
                                        : styles.card
                                }
                            >
                                <div className={styles.icoWrapper2}>
                                    <Image
                                        src={icoDefi}
                                        alt="defi-ico"
                                        height="44"
                                        width="44"
                                    />
                                    <div className={styles.title}>earn</div>
                                </div>
                                <div className={styles.icoWrapper}>
                                    <Image
                                        src={
                                            active === 'pools' ? icoUp : icoDown
                                        }
                                        alt="toggle-ico"
                                    />
                                </div>
                            </div>
                            {active === 'pools' && (
                                <div className={styles.cardSub}>
                                    <div className={styles.wrapper}>
                                        <PoolOverview loading={false} />
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* <div className={styles.cardActiveWrapper}>
                        <div
                            onClick={() => toggleActive('stake')}
                            className={
                                active === 'stake'
                                    ? styles.cardActive
                                    : styles.card
                            }
                        >
                            <div className={styles.icoWrapper2}>
                                <Image src={icoStake} alt="stake-ico" height='44'
                                    width='44' />
                                <div className={styles.title}>staking</div>
                            </div>
                            <div className={styles.icoWrapper}>
                                <Image
                                    src={active === 'stake' ? icoUp : icoDown}
                                    alt="toggle-ico"
                                />
                            </div>
                        </div>
                        {active === 'stake' && (
                            <div className={styles.cardSub}>
                                <div className={styles.closeIcoWrapper}>
                                    <div
                                        onClick={() => toggleActive('')}
                                        className={styles.closeIco}
                                    >
                                        <Image
                                            width={10}
                                            src={CloseIco}
                                            alt="close-ico"
                                        />
                                    </div>
                                </div>
                                <div className={styles.wrapper}>
                                    <ZILxWALLET />
                                </div>
                            </div>
                        )}
                    </div> */}
                    </>
                )}
        </div>
    )
}

export default Defix
