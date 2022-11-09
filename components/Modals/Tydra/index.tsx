import { useStore } from 'effector-react'
import {
    $investorItems,
    $modalInvestor,
    $modalTydra,
    updateInvestorModal,
    updateModalTx,
    updateModalTxMinimized,
    updateTydraModal,
} from '../../../src/store/modal'
import CloseReg from '../../../src/assets/icons/ic_cross.svg'
import CloseBlack from '../../../src/assets/icons/ic_cross_black.svg'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import * as tyron from 'tyron'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../src/app/reducers'
import Spinner from '../../Spinner'
import { AddFunds, Donate, Selector } from '../..'
import { useTranslation } from 'next-i18next'
import smartContract from '../../../src/utils/smartContract'
import routerHook from '../../../src/hooks/router'
import { $resolvedInfo } from '../../../src/store/resolvedInfo'
import Tydra from '../../../src/assets/logos/tydra.json'
import arweave from '../../../src/config/arweave'
import { ZilPayBase } from '../../ZilPay/zilpay-base'
import { setTxId, setTxStatusLoading } from '../../../src/app/actions'
import ThreeDots from '../../Spinner/ThreeDots'
import CloseIcoReg from '../../../src/assets/icons/ic_cross.svg'
import CloseIcoBlack from '../../../src/assets/icons/ic_cross_black.svg'
import { $donation, updateDonation } from '../../../src/store/donation'
import { toast } from 'react-toastify'
import toastTheme from '../../../src/hooks/toastTheme'

function Component() {
    const { t } = useTranslation()
    const { getSmartContract } = smartContract()
    const { navigate } = routerHook()
    const dispatch = useDispatch()
    const net = useSelector((state: RootState) => state.modal.net)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const modalTydra = useStore($modalTydra)
    const resolvedInfo = useStore($resolvedInfo)
    const donation = useStore($donation)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const Close = isLight ? CloseBlack : CloseReg
    const CloseIco = isLight ? CloseIcoBlack : CloseIcoReg
    const version = parseInt(resolvedInfo?.version?.split('_')[1]!)

    const [currency, setCurrency] = useState('')
    const [txName, setTxName] = useState('')
    const [res, setRes] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isEnough, setIsEnough] = useState(true)
    const username = resolvedInfo?.name
    const domain = resolvedInfo?.domain
    const domainNavigate = domain !== '' ? domain + '@' : ''

    const handleOnChange = (value) => {
        setCurrency(value)
    }

    const submitAr = async () => {
        setIsLoading(true)
        try {
            const data = {
                name: 'Nawelito',
                net: 'tyron.network',
                first_owner: loginInfo?.arAddr,
                resource: Tydra.img,
            }

            const transaction = await arweave.createTransaction({
                data: JSON.stringify(data),
            })

            transaction.addTag('Content-Type', 'application/json')

            window.arweaveWallet.dispatch(transaction).then((res) => {
                setRes(res.id)
            })
        } catch (err) {
            console.log(err)
        }
        setIsLoading(false)
    }

    const fetchZilBalance = async (id: string) => {
        let token_addr: string
        try {
            if (id !== 'zil') {
                const init_addr = await tyron.SearchBarUtil.default.fetchAddr(
                    net,
                    'init',
                    'did'
                )
                const get_services = await getSmartContract(
                    init_addr,
                    'services'
                )
                const services = await tyron.SmartUtil.default.intoMap(
                    get_services.result.services
                )
                token_addr = services.get(id)
                const balances = await getSmartContract(token_addr, 'balances')
                const balances_ = await tyron.SmartUtil.default.intoMap(
                    balances.result.balances
                )

                let res = 0
                try {
                    const balance_zilpay = balances_.get(
                        loginInfo.zilAddr.base16.toLowerCase()
                    )
                    if (balance_zilpay !== undefined) {
                        const _currency = tyron.Currency.default.tyron(id)
                        const finalBalance = balance_zilpay / _currency.decimals
                        res = Number(finalBalance.toFixed(2))
                    }
                } catch (error) {
                    res = 0
                }
                return res
            } else {
                const zilpay = new ZilPayBase().zilpay
                const zilPay = await zilpay()
                const blockchain = zilPay.blockchain
                const zilliqa_balance = await blockchain.getBalance(
                    loginInfo.zilAddr.base16.toLowerCase()
                )
                const zilliqa_balance_ =
                    Number(zilliqa_balance.result!.balance) / 1e12

                let res = Number(zilliqa_balance_.toFixed(2))
                return res
            }
        } catch (error) {
            let res = 0
            return res
        }
    }

    const sendTxn = async () => {
        setIsEnough(true)
        setIsLoading(true)
        let freeList = false
        const init_addr = await tyron.SearchBarUtil.default.fetchAddr(
            net,
            'init',
            'did'
        )
        let params: any = []
        let contract = init_addr
        let currency_ = 'zil'
        let price = 1000
        if (version >= 6) {
            currency_ = currency
            contract = resolvedInfo?.addr!
            const donation_ = await tyron.Donation.default.tyron(donation!)
            const tyron_ = {
                vname: 'tyron',
                type: 'Option Uint128',
                value: donation_,
            }
            params.push(tyron_)
        }
        switch (currency_.toLowerCase()) {
            case 'tyron':
                price = 30
                break
            case '$si':
                price = 30
                break
            case 'zusdt':
                price = 30
                break
            case 'xsgd':
                price = 40
                break
            case 'xidr':
                price = 150000
                break
        }
        const balance = await fetchZilBalance(currency_.toLowerCase())
        if (price > balance) {
            setIsLoading(false)
            setIsEnough(false)
            toast.error(
                `Insufficient balance, the cost is ${price} ${currency_}`,
                {
                    position: 'top-center',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 2,
                }
            )
        } else {
            try {
                const get_free_list = await getSmartContract(
                    init_addr,
                    'tydra_free_list'
                )
                const freelist: Array<string> =
                    get_free_list.result.tydra_free_list
                const is_free = freelist.filter(
                    (val) => val === loginInfo.zilAddr.base16.toLowerCase()
                )
                if (is_free.length !== 0) {
                    freeList = true
                }
            } catch {
                freeList = false
            }
            const zilpay = new ZilPayBase()
            let tx = await tyron.Init.default.transaction(net)
            const domainId =
                '0x' +
                (await tyron.Util.default.HashString(resolvedInfo?.name!))
            const id = {
                vname: 'id',
                type: 'String',
                value: freeList ? 'free' : currency_.toLowerCase(),
            }
            params.push(id)
            const token_id = {
                vname: 'token_id',
                type: 'ByStr32',
                value: domainId,
            }
            params.push(token_id)
            const token_uri = {
                vname: 'token_uri',
                type: 'String',
                value: res,
            }
            params.push(token_uri)

            dispatch(setTxStatusLoading('true'))
            updateModalTxMinimized(false)
            updateModalTx(true)
            await zilpay
                .call({
                    contractAddress: contract,
                    transition: 'MintTydraNft',
                    params: params as unknown as Record<string, unknown>[],
                    amount: String(freeList ? 0 : price),
                })
                .then(async (res) => {
                    dispatch(setTxId(res.ID))
                    dispatch(setTxStatusLoading('submitted'))
                    tx = await tx.confirm(res.ID)
                    if (tx.isConfirmed()) {
                        setIsLoading(false)
                        dispatch(setTxStatusLoading('confirmed'))
                        setTimeout(() => {
                            window.open(
                                `https://v2.viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                            )
                        }, 1000)
                        updateTydraModal(false)
                        navigate(`/${domainNavigate}${username}/didx`)
                    } else if (tx.isRejected()) {
                        setIsLoading(false)
                        dispatch(setTxStatusLoading('failed'))
                    }
                })
                .catch((err) => {
                    setIsLoading(false)
                    dispatch(setTxStatusLoading('rejected'))
                    updateModalTxMinimized(false)
                    updateModalTx(true)
                    throw err
                })
        }
    }

    const toggleActive = (id: string) => {
        // updateDonation(null)
        // resetState()
        setCurrency('')
        if (id === txName) {
            setTxName('')
        } else {
            setTxName(id)
        }
    }

    const outerClose = () => {
        if (window.confirm('Do you really want to close the modal?')) {
            updateDonation(null)
            setCurrency('')
            setRes('')
            updateTydraModal(false)
        }
    }

    const renderSend = () => {
        if (version < 6) {
            return true
        } else if (donation !== null) {
            return true
        } else {
            return false
        }
    }

    const optionCurrency = [
        {
            key: 'TYRON',
            name: 'TYRON',
        },
        {
            key: '$SI',
            name: '$SI',
        },
        {
            key: 'ZIL',
            name: 'ZIL',
        },
        {
            key: 'zUSDT',
            name: 'zUSDT',
        },
        {
            key: 'XSGD',
            name: 'XSGD',
        },
        {
            key: 'XIDR',
            name: 'XIDR',
        },
    ]

    if (!modalTydra) {
        return null
    }

    return (
        <>
            <div onClick={outerClose} className={styles.outerWrapper} />
            <div className={styles.container}>
                <div className={styles.innerContainer}>
                    <div className={styles.headerWrapper}>
                        <div onClick={outerClose} className="closeIcon">
                            <Image
                                alt="ico-close"
                                src={Close}
                                width={15}
                                height={15}
                            />
                        </div>
                        <h5 className={styles.headerTxt}>
                            Deploy TYDRA{currency}
                        </h5>
                    </div>
                    <div className={styles.cardWrapper}>
                        <div
                            onClick={() => toggleActive('deploy')}
                            className={
                                txName === 'deploy'
                                    ? styles.cardActive
                                    : styles.card
                            }
                        >
                            <div>DEPLOY</div>
                        </div>
                        <div className={styles.cardActiveWrapper}>
                            {txName === 'deploy' && (
                                <div className={styles.cardRight}>
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
                                    {res === '' ? (
                                        <div>
                                            {version >= 6 && (
                                                <div className={styles.select}>
                                                    <Selector
                                                        option={optionCurrency}
                                                        onChange={
                                                            handleOnChange
                                                        }
                                                        placeholder={t(
                                                            'Select coin'
                                                        )}
                                                    />
                                                </div>
                                            )}
                                            {currency !== '' || version < 6 ? (
                                                <div
                                                    className={
                                                        styles.btnWrapper
                                                    }
                                                >
                                                    <div
                                                        onClick={submitAr}
                                                        className={
                                                            isLight
                                                                ? 'actionBtnLight'
                                                                : 'actionBtn'
                                                        }
                                                    >
                                                        {isLoading ? (
                                                            <ThreeDots color="basic" />
                                                        ) : (
                                                            'DEPLOY TYDRA'
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <></>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            {version >= 6 && <Donate />}
                                            {renderSend() && (
                                                <>
                                                    <div
                                                        className={
                                                            styles.btnWrapper
                                                        }
                                                    >
                                                        <div
                                                            onClick={sendTxn}
                                                            className={
                                                                isLight
                                                                    ? 'actionBtnLight'
                                                                    : 'actionBtn'
                                                            }
                                                        >
                                                            {isLoading ? (
                                                                <ThreeDots color="basic" />
                                                            ) : (
                                                                'SEND TYDRA'
                                                            )}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    {/* <div className={styles.contentWrapper}>
                        <div className={styles.select}>
                            <Selector
                                option={option}
                                onChange={handleOnChange}
                                placeholder={t('Select coin')}
                            />
                        </div>
                        {currency !== '' && (
                            <div className={styles.btnWrapper}>
                                <div
                                    onClick={submitAr}
                                    className={
                                        isLight ? 'actionBtnLight' : 'actionBtn'
                                    }
                                >
                                    {isLoading ? (
                                        <ThreeDots color="basic" />
                                    ) : (
                                        'DEPLOY TYDRA'
                                    )}
                                </div>
                            </div>
                        )}
                    </div> */}
                </div>
            </div>
        </>
    )
}

export default Component
