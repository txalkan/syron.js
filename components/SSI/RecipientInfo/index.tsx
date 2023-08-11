import React, { useEffect, useState } from 'react'
import * as tyron from 'tyron'
import Image from 'next/image'
import { useSelector } from 'react-redux'
import { ZilPayBase } from '../../ZilPay/zilpay-base'
import { RootState } from '../../../src/app/reducers'
import { useStore } from 'effector-react'
import { $originatorAddress } from '../../../src/store/originatorAddress'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import ArrowDownReg from '../../../src/assets/icons/dashboard_arrow_down_icon.svg'
import ArrowDownBlack from '../../../src/assets/icons/dashboard_arrow_down_icon_black.svg'
import ArrowUpReg from '../../../src/assets/icons/dashboard_arrow_up_icon.svg'
import ArrowUpBlack from '../../../src/assets/icons/dashboard_arrow_up_icon_black.svg'
import smartContract from '../../../src/utils/smartContract'
import { useTranslation } from 'next-i18next'
import { Spinner } from '../..'
import { $net } from '../../../src/store/network'

interface InputType {
    recipient_tld?: string
    recipient_domain?: string
    recipient_subdomain?: string
    address: string
}

function Component(props: InputType) {
    const net = $net.state.net as 'mainnet' | 'testnet'

    const { recipient_tld, recipient_domain, recipient_subdomain, address } =
        props
    const { t } = useTranslation()
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const ArrowDown = isLight ? ArrowDownBlack : ArrowDownReg
    const ArrowUp = isLight ? ArrowUpBlack : ArrowUpReg

    const [toggleInfo, setToggleInfo] = useState(false)

    return (
        <>
            <div
                onClick={() => {
                    setToggleInfo(!toggleInfo)
                }}
                className={styles.header}
            >
                {/* @review: translate */}
                <div className={styles.txt} style={{ marginRight: '20px' }}>
                    recipient info
                </div>
                <Image src={toggleInfo ? ArrowUp : ArrowDown} alt="ico-arrow" />
            </div>
            {toggleInfo && (
                <ul className={styles.walletInfoWrapper}>
                    {recipient_domain && (
                        <li className={styles.originatorAddr}>
                            <span style={{ textTransform: 'none' }}>
                                {recipient_subdomain !== '' &&
                                    recipient_subdomain !== 'did' &&
                                    `${recipient_subdomain}@`}
                            </span>
                            {recipient_domain}.
                            {recipient_tld === '' ? 'ssi' : recipient_tld}
                        </li>
                    )}
                    <li className={styles.originatorAddr}>
                        {t('ADDRESS')}:{' '}
                        <a
                            style={{
                                textTransform: 'lowercase',
                            }}
                            href={`https://viewblock.io/zilliqa/address/${address}?network=${net}`}
                            rel="noreferrer"
                            target="_blank"
                        >
                            ...{address.slice(-10)}
                        </a>
                    </li>
                </ul>
            )}
        </>
    )
}

export default Component
