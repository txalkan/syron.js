import React, { useState, useEffect } from 'react'
import styles from './styles.module.scss'
import { updateDonation } from '../../src/store/donation'
import Image from 'next/image'
import icoDown from '../../src/assets/icons/ssi_icon_3arrowsDown.svg'
import icoUp from '../../src/assets/icons/ssi_icon_3arrowsUp.svg'

import icoDex from '../../src/assets/icons/ssi_icon_tydraDEX.svg'

import { useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'
import { useStore } from 'react-stores'
import { useStore as effectorStore } from 'effector-react'
import { $resolvedInfo } from '../../src/store/resolvedInfo'
import { $doc } from '../../src/store/did-doc'
import { $net } from '../../src/store/network'
import { $wallet } from '../../src/store/wallet'
import { DragonDex } from '../../src/mixins/dex'
import { useTranslation } from 'next-i18next'
import { SyronForm } from '../syron-102'
import useFetch from '../../src/hooks/fetch'

const dex = new DragonDex()
function Component() {
    const { t } = useTranslation()
    const [active, setActive] = useState('trade')

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

    const { fetchDoc } = useFetch(resolvedInfo)
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

    const start_pair = [
        {
            value: '0',
            meta: {
                name: 'Bitcoin',
                symbol: 'BTC',
                decimals: 8,
            },
        },
        {
            value: '0',
            meta: {
                name: 'Syron U$D',
                symbol: 'SU$D',
                decimals: 8,
            },
        },
    ]

    // @dev (syron)
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
                    {/* @review (translate) */}
                    <div className={styles.icoWrapper2}>
                        {/* <Image
                            src={icoDex}
                            alt="trade-ico"
                            height="44"
                            width="44"
                        /> */}
                        <div className={styles.titleX}>
                            Self-Sovereign Identity Vault
                        </div>
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
                            <SyronForm startPair={start_pair} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Component
