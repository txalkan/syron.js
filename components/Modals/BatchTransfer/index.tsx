import { useStore } from 'effector-react'
import {
    $modalTransfer,
    $typeBatchTransfer,
    updateModalTx,
    updateModalTxMinimized,
    updateTransferModal,
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
import { Donate, Selector } from '../..'
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
import ContinueArrow from '../../../src/assets/icons/continue_arrow.svg'
import TickIco from '../../../src/assets/icons/tick.svg'
import { $donation, updateDonation } from '../../../src/store/donation'
import { TransitionParams } from 'tyron/dist/blockchain/tyronzil'
import { toast } from 'react-toastify'
import toastTheme from '../../../src/hooks/toastTheme'
import {
    $originatorAddress,
    updateOriginatorAddress,
} from '../../../src/store/originatorAddress'

function Component() {
    const zcrypto = tyron.Util.default.Zcrypto()
    const { t } = useTranslation()
    const { getSmartContract } = smartContract()
    const { navigate } = routerHook()
    const dispatch = useDispatch()
    const net = useSelector((state: RootState) => state.modal.net)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const modalTransfer = useStore($modalTransfer)
    const resolvedInfo = useStore($resolvedInfo)
    const donation = useStore($donation)
    const typeBatchTransfer = useStore($typeBatchTransfer)
    const originator_address = useStore($originatorAddress)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const Close = isLight ? CloseBlack : CloseReg
    const CloseIco = isLight ? CloseIcoBlack : CloseIcoReg

    const [selectedCoin, setSelectedCoin] = useState<any>([])
    const [inputCoin, setInputCoin] = useState<any>([])
    const [savedCurrency, setSavedCurrency] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingCheckBalance, setIsLoadingCheckBalance] = useState(false)

    let contract = originator_address?.value
    if (typeBatchTransfer === 'transfer') {
        contract = loginInfo?.address
    }

    const outerClose = () => {
        if (window.confirm('Are you sure about closing this window?')) {
            updateOriginatorAddress(null)
            updateTransferModal(false)
            resetState()
        }
    }

    const listCoin = tyron.Options.default.listCoin()
    const option = [...listCoin]

    const handleOnChange = (e) => {
        setSavedCurrency(false)
        updateDonation(null)
        // check deleted coin
        let deletedCoin
        for (let i = 0; i < selectedCoin.length; i += 1) {
            let isExist = e.some((val) => val.value === selectedCoin[i].value)
            if (!isExist) {
                deletedCoin = selectedCoin[i].value
            }
        }
        // remove deleted coin value
        if (deletedCoin) {
            console.log('ok', inputCoin)
            let res = inputCoin.filter(
                (val) => val.split('@')[0] !== deletedCoin
            )
            setInputCoin(res)
        }
        setSelectedCoin(e)
    }

    const fetchBalance = async (id: string) => {
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

                let res
                try {
                    const balance_didxwallet = balances_.get(
                        contract!.toLowerCase()!
                    )
                    if (balance_didxwallet !== undefined) {
                        const _currency = tyron.Currency.default.tyron(id)
                        const finalBalance =
                            balance_didxwallet / _currency.decimals
                        res = Number(finalBalance.toFixed(2))
                    }
                } catch (error) {
                    res = 0
                }
                return res
            } else {
                const balance = await getSmartContract(contract!, '_balance')

                const balance_ = balance.result._balance
                const zil_balance = Number(balance_) / 1e12
                let res = Number(zil_balance.toFixed(2))
                return res
            }
        } catch (error) {
            let res = 0
            return res
        }
    }

    const saveCurrency = async () => {
        setIsLoadingCheckBalance(true)
        if (selectedCoin.length > 5) {
            toast.error(
                'The maximum amount of different coins is 5 per transfer.',
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
                for (let i = 0; i < selectedCoin.length; i += 1) {
                    const currency = selectedCoin[i].value
                    let isExist = inputCoin.some(
                        (val) =>
                            val?.split('@')[0] === currency &&
                            val?.split('@')[1] !== ''
                    )
                    if (!isExist) {
                        toast.error('Please fill all value', {
                            position: 'top-center',
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: toastTheme(isLight),
                            toastId: 2,
                        })
                        throw Error
                    }
                }
                for (let i = 0; i < inputCoin.length; i += 1) {
                    const coin = inputCoin[i]?.split('@')[0]
                    const amount = inputCoin[i]?.split('@')[1]
                    const input_ = Number(amount)
                    if (isNaN(input_)) {
                        toast.error(t('The input is not a number.'), {
                            position: 'bottom-right',
                            autoClose: 2000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: toastTheme(isLight),
                            toastId: 3,
                        })
                        throw new Error()
                    }
                    const balance = await fetchBalance(coin.toLowerCase())
                    if (input_ > balance) {
                        toast.error(`Not enough balance for ${coin}`, {
                            position: 'bottom-right',
                            autoClose: 2000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: toastTheme(isLight),
                            toastId: 4,
                        })
                        throw new Error()
                    }
                }
                setSavedCurrency(true)
            } catch {
                setSavedCurrency(false)
            }
            console.log(inputCoin)
        }
        setIsLoadingCheckBalance(false)
    }

    const resetState = () => {
        setInputCoin([])
        setSelectedCoin([])
        setSavedCurrency(false)
    }

    const handleSubmit = async () => {
        setIsLoading(true)
        const zilpay = new ZilPayBase()
        let params: any = []
        const addr: TransitionParams = {
            vname: 'addr',
            type: 'ByStr20',
            value: resolvedInfo?.addr,
        }
        params.push(addr)
        let arrayToken: any = []
        for (let i = 0; i < inputCoin.length; i += 1) {
            const val = inputCoin[i].split('@')
            console.log(inputCoin[i])
            const _currency = tyron.Currency.default.tyron(
                val[0],
                Number(val[1])
            )
            arrayToken.push({
                argtypes: ['String', 'Uint128'],
                arguments: [`${val[0].toLowerCase()}`, `${_currency.amount}`],
                constructor: 'Pair',
            })
        }
        const tokens: TransitionParams = {
            vname: 'tokens',
            type: 'List( Pair String Uint128 )',
            value: arrayToken,
        }
        params.push(tokens)
        const tyron_ = await tyron.Donation.default.tyron(donation!)
        const tyron__: TransitionParams = {
            vname: 'tyron',
            type: 'Option Uint128',
            value: tyron_,
        }
        params.push(tyron__)

        dispatch(setTxStatusLoading('true'))
        updateModalTxMinimized(false)
        updateModalTx(true)
        let tx = await tyron.Init.default.transaction(net)
        await zilpay
            .call({
                contractAddress: contract!,
                transition: 'ZRC2_BatchTransfer',
                params: params as unknown as Record<string, unknown>[],
                amount: String(donation),
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
                    updateTransferModal(false)
                    resetState()
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

    if (!modalTransfer) {
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
                        <h5 className={styles.headerTxt}>BATCH TRANSFER</h5>
                    </div>
                    <div className={styles.contentWrapper}>
                        <div className={styles.txt}>
                            Recipient:{' '}
                            {zcrypto.toBech32Address(resolvedInfo?.addr!)}
                        </div>
                        <div className={styles.selector}>
                            <Selector
                                option={option}
                                onChange={handleOnChange}
                                placeholder={t('Select coin')}
                                isMulti={true}
                            />
                        </div>
                        {selectedCoin.map((val: any, i) => (
                            <div key={i} className={styles.wrapperInput}>
                                <code className={styles.code}>{val.value}</code>
                                <input
                                    className={styles.inputCurrency}
                                    type="text"
                                    placeholder={t('Type amount')}
                                    onChange={(event) => {
                                        setSavedCurrency(false)
                                        updateDonation(null)
                                        const value = event.target.value
                                        inputCoin[i] = val.value + '@' + value
                                        setInputCoin(inputCoin)
                                    }}
                                />
                            </div>
                        ))}
                        {selectedCoin.length > 0 && (
                            <div
                                onClick={saveCurrency}
                                className={
                                    isLoadingCheckBalance
                                        ? ''
                                        : !savedCurrency
                                        ? 'continueBtn'
                                        : ''
                                }
                                style={{ width: 'fit-content' }}
                            >
                                {isLoadingCheckBalance ? (
                                    <Spinner />
                                ) : !savedCurrency ? (
                                    <Image src={ContinueArrow} alt="arrow" />
                                ) : (
                                    <div
                                        style={{
                                            marginTop: '5px',
                                        }}
                                    >
                                        <Image
                                            width={40}
                                            src={TickIco}
                                            alt="tick"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                        {savedCurrency && (
                            <>
                                <Donate />
                                {donation !== null && (
                                    <div className={styles.wrapperBtn}>
                                        <div
                                            onClick={handleSubmit}
                                            className={
                                                isLight
                                                    ? 'actionBtnBlueLight'
                                                    : 'actionBtnBlue'
                                            }
                                        >
                                            {isLoading ? (
                                                <ThreeDots color="basic" />
                                            ) : (
                                                <>TRANSFER</>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Component
