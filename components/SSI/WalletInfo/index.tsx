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
import TyronNameReg from '../../../src/assets/icons/W_Tyron_grey.svg'
import TyronNameDark from '../../../src/assets/icons/W_Tyron_white.svg'
import ZilpayReg from '../../../src/assets/icons/W_zilpay_grey.svg'
import ZilpayDark from '../../../src/assets/icons/W_zilpay_white.svg'
import AddressReg from '../../../src/assets/icons/W-Address_grey.svg'
import AddressDark from '../../../src/assets/icons/W-Address_white.svg'
import BalanceReg from '../../../src/assets/icons/W-balance_grey.svg'
import BalanceDark from '../../../src/assets/icons/W-balance_white.svg'
import smartContract from '../../../src/utils/smartContract'
import { useTranslation } from 'next-i18next'
import { Spinner } from '../..'
import { updateShowZilpay } from '../../../src/store/modal'

interface InputType {
    currency: string
}

function Component(props: InputType) {
    const { currency } = props
    const { t } = useTranslation()
    const { getSmartContract } = smartContract()
    const zcrypto = tyron.Util.default.Zcrypto()
    const originator_address = useStore($originatorAddress)
    const net = useSelector((state: RootState) => state.modal.net)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const ArrowDown = isLight ? ArrowDownBlack : ArrowDownReg
    const ArrowUp = isLight ? ArrowUpBlack : ArrowUpReg
    const TyronName = isLight ? TyronNameDark : TyronNameReg
    const ZilpayIco = isLight ? ZilpayDark : ZilpayReg
    const AddressIco = isLight ? AddressDark : AddressReg
    const BalanceIco = isLight ? BalanceDark : BalanceReg

    const [toggleInfoZilpay, setToggleInfoZilpay] = useState(false)
    const [loadingInfoBal, setLoadingInfoBal] = useState(false)
    const [infoBal, setInfoBal] = useState(0)

    const fetchInfoBalance = async (id: string, addr?: string) => {
        let token_addr: string
        if (currency !== '') {
            try {
                setLoadingInfoBal(true)
                if (id !== 'zil') {
                    const init_addr =
                        await tyron.SearchBarUtil.default.fetchAddr(
                            net,
                            'did',
                            'init'
                        )
                    const get_services = await getSmartContract(
                        init_addr,
                        'services'
                    )
                    const services = await tyron.SmartUtil.default.intoMap(
                        get_services.result.services
                    )
                    token_addr = services.get(id)
                    const balances = await getSmartContract(
                        token_addr,
                        'balances'
                    )
                    const balances_ = await tyron.SmartUtil.default.intoMap(
                        balances.result.balances
                    )
                    try {
                        if (addr) {
                            const balance_didxwallet = balances_.get(
                                addr!.toLowerCase()!
                            )
                            if (balance_didxwallet !== undefined) {
                                const _currency =
                                    tyron.Currency.default.tyron(id)
                                const finalBalance =
                                    balance_didxwallet / _currency.decimals
                                setInfoBal(Number(finalBalance.toFixed(2)))
                            }
                        } else {
                            const balance_zilpay = balances_.get(
                                loginInfo.zilAddr.base16.toLowerCase()
                            )
                            if (balance_zilpay !== undefined) {
                                const _currency =
                                    tyron.Currency.default.tyron(id)
                                const finalBalance =
                                    balance_zilpay / _currency.decimals
                                setInfoBal(Number(finalBalance.toFixed(2)))
                            }
                        }
                    } catch (error) {
                        setInfoBal(0)
                    }
                } else {
                    if (addr) {
                        const balance = await getSmartContract(
                            addr!,
                            '_balance'
                        )
                        const balance_ = balance.result._balance
                        const zil_balance = Number(balance_) / 1e12
                        setInfoBal(Number(zil_balance.toFixed(2)))
                    } else {
                        const zilpay = new ZilPayBase().zilpay
                        const zilPay = await zilpay()
                        const blockchain = zilPay.blockchain
                        const zilliqa_balance = await blockchain.getBalance(
                            loginInfo.zilAddr.base16.toLowerCase()
                        )
                        const zilliqa_balance_ =
                            Number(zilliqa_balance.result!.balance) / 1e12

                        setInfoBal(Number(zilliqa_balance_.toFixed(2)))
                    }
                }
                setLoadingInfoBal(false)
            } catch (error) {
                setInfoBal(null!)
                setLoadingInfoBal(false)
            }
        }
    }

    useEffect(() => {
        setToggleInfoZilpay(false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [originator_address])

    useEffect(() => {
        if (originator_address?.value === 'zilliqa') {
            fetchInfoBalance(currency.toLowerCase())
        } else {
            fetchInfoBalance(currency.toLowerCase(), originator_address?.value)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loginInfo.zilAddr])

    return (
        <div>
            <div
                onClick={() => {
                    setToggleInfoZilpay(!toggleInfoZilpay)
                    if (originator_address?.value === 'zilliqa') {
                        fetchInfoBalance(currency.toLowerCase())
                    } else {
                        fetchInfoBalance(
                            currency.toLowerCase(),
                            originator_address?.value
                        )
                    }
                }}
                className={styles.zilpayWalletInfo}
            >
                <div className={styles.txt} style={{ marginRight: '20px' }}>
                    {t('Wallet')} Info
                </div>
                <Image
                    src={toggleInfoZilpay ? ArrowUp : ArrowDown}
                    alt="ico-arrow"
                />
            </div>
            {toggleInfoZilpay && (
                <ul className={styles.walletInfoWrapper}>
                    <li className={styles.originatorAddr}>
                        {originator_address?.value !== 'zilliqa' ? (
                            <div style={{ display: 'flex' }}>
                                <div className={styles.txtLeftIco}>
                                    <Image src={TyronName} alt="ico-txt" />
                                </div>
                                <span className={styles.txtLeftInfo}>
                                    Name:
                                </span>{' '}
                                <span style={{ textTransform: 'none' }}>
                                    {originator_address?.domain !== '' &&
                                        originator_address?.domain !== 'did' &&
                                        `${originator_address?.domain}@`}
                                </span>
                                <span style={{ textTransform: 'uppercase' }}>
                                    {originator_address?.username}
                                </span>
                                .
                                {originator_address?.domain === 'did'
                                    ? 'did'
                                    : 'ssi'}
                            </div>
                        ) : (
                            <div style={{ display: 'flex' }}>
                                <div className={styles.txtLeftIco}>
                                    <Image src={ZilpayIco} alt="ico-txt" />
                                </div>
                                <span className={styles.txtLeftInfo}>
                                    Name:
                                </span>{' '}
                                ZilPay
                            </div>
                        )}
                    </li>
                    <li className={styles.originatorAddr}>
                        <div style={{ display: 'flex' }}>
                            <div className={styles.txtLeftIco2}>
                                <Image src={AddressIco} alt="ico-txt" />
                            </div>
                            <span className={styles.txtLeftInfo}>
                                {t('Address')}:
                            </span>{' '}
                            {originator_address?.value === 'zilliqa' ? (
                                <a
                                    style={{
                                        textTransform: 'lowercase',
                                    }}
                                    href={`https://viewblock.io/zilliqa/address/${loginInfo.zilAddr?.bech32}?network=${net}`}
                                    rel="noreferrer"
                                    target="_blank"
                                >
                                    {loginInfo.zilAddr?.bech32.slice(0, 8)}...
                                    {loginInfo.zilAddr?.bech32.slice(-5)}
                                </a>
                            ) : (
                                <a
                                    style={{
                                        textTransform: 'lowercase',
                                    }}
                                    href={`https://viewblock.io/zilliqa/address/${originator_address?.value}?network=${net}`}
                                    rel="noreferrer"
                                    target="_blank"
                                >
                                    {zcrypto
                                        ?.toBech32Address(
                                            originator_address?.value!
                                        )
                                        .slice(0, 8)}
                                    ...
                                    {zcrypto
                                        ?.toBech32Address(
                                            originator_address?.value!
                                        )
                                        .slice(-5)}
                                </a>
                            )}
                        </div>
                    </li>
                    <li className={styles.originatorAddr}>
                        <div style={{ display: 'flex' }}>
                            <div className={styles.txtLeftIco2}>
                                <Image src={BalanceIco} alt="ico-txt" />
                            </div>
                            <span className={styles.txtLeftInfo}>
                                {t('Balance')}:
                            </span>{' '}
                            <span
                                style={{
                                    color: isLight ? '#000' : '#dbe4eb',
                                }}
                            >
                                {loadingInfoBal ? (
                                    <Spinner />
                                ) : infoBal === null &&
                                  currency.toLowerCase() === 'zil' ? (
                                    <div
                                        onClick={() => updateShowZilpay(true)}
                                        style={{ marginTop: '10px' }}
                                        className={`button small ${
                                            isLight ? 'black' : ''
                                        }`}
                                    >
                                        Unlock Zilpay
                                    </div>
                                ) : (
                                    `${infoBal} ${currency}`
                                )}
                            </span>
                        </div>
                    </li>
                </ul>
            )}
        </div>
    )
}

export default Component
