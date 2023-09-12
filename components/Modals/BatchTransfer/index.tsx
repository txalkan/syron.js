import { useStore as effectorStore } from 'effector-react'
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
import { useState } from 'react'
import * as tyron from 'tyron'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../src/app/reducers'
import Spinner from '../../Spinner'
import {
    Arrow,
    Donate,
    InputPercentage,
    RecipientInfo,
    SearchBarWallet,
    Selector,
} from '../..'
import { useTranslation } from 'next-i18next'
import smartContract from '../../../src/utils/smartContract'
import { $resolvedInfo } from '../../../src/store/resolvedInfo'
import { ZilPayBase } from '../../ZilPay/zilpay-base'
import { setTxId, setTxStatusLoading } from '../../../src/app/actions'
import ThreeDots from '../../Spinner/ThreeDots'
import TickIcoReg from '../../../src/assets/icons/tick.svg'
import TickIcoPurple from '../../../src/assets/icons/tick_purple.svg'
import { $donation, updateDonation } from '../../../src/store/donation'
import { TransitionParams } from 'tyron/dist/blockchain/tyronzil'
import { toast } from 'react-toastify'
import toastTheme from '../../../src/hooks/toastTheme'
import {
    $originatorAddress,
    updateOriginatorAddress,
} from '../../../src/store/originatorAddress'
import fetch from '../../../src/hooks/fetch'
import { $net } from '../../../src/store/network'
import { useStore } from 'react-stores'
import Big from 'big.js'
Big.PE = 999

function Component() {
    const zcrypto = tyron.Util.default.Zcrypto()
    const { t } = useTranslation()
    const net = $net.state.net as 'mainnet' | 'testnet'
    const { getSmartContract } = smartContract()
    //const { navigate } = routerHook() @review: navigate
    const { fetchWalletBalance } = fetch()
    const dispatch = useDispatch()

    const loginInfo = useSelector((state: RootState) => state.modal)
    const modalTransfer = effectorStore($modalTransfer)
    const resolvedInfo = useStore($resolvedInfo)
    const donation = effectorStore($donation)
    const typeBatchTransfer = effectorStore($typeBatchTransfer)
    const originator_address = effectorStore($originatorAddress)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const Close = isLight ? CloseBlack : CloseReg
    const TickIco = isLight ? TickIcoPurple : TickIcoReg

    const [selectedCoin, setSelectedCoin] = useState<any>([])
    const [inputCoin, setInputCoin] = useState<any>([])
    const [savedCurrency, setSavedCurrency] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingCheckBalance, setIsLoadingCheckBalance] = useState(false)
    const [isLoadingRecipient, setIsLoadingRecipient] = useState(false)
    const [recipientType, setRecipientType] = useState('')
    const [recipient, setRecipient] = useState('')
    const [savedRecipient, setSavedRecipient] = useState(false)
    const [input_, setInput] = useState('')
    const [tld_, setTLD] = useState('')
    const [domain_, setDomain] = useState('')
    const [subdomain_, setSubdomain] = useState('')

    const [reRender, setReRender] = useState(true)
    const [loadingPercentage, setLoadingPercentage] = useState('')

    let contract = originator_address?.value
    if (typeBatchTransfer === 'transfer') {
        contract = resolvedInfo?.addr
    }

    let recipient_ = resolvedInfo?.addr
    if (typeBatchTransfer === 'transfer') {
        recipient_ = recipient
    }

    const outerClose = () => {
        // if (window.confirm('Are you sure about closing this window?')) {
        updateOriginatorAddress(null)
        updateTransferModal(false)
        resetState()
        // }
    }

    const listCoin = tyron.Options.default.listCoin()
    const option = [...listCoin]

    const handleOnChange = (e) => {
        setSavedCurrency(false)
        updateDonation(null)
        if (e.length > 5) {
            toast.warn(
                'The maximum number of different tokens allowed per transfer at the moment is 5.',
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
        }
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
                    'did',
                    'init'
                )
                const get_services = await getSmartContract(
                    init_addr,
                    'services'
                )
                const services = await tyron.SmartUtil.default.intoMap(
                    get_services!.result.services
                )
                token_addr = services.get(id)
                const balances = await getSmartContract(token_addr, 'balances')
                const balances_ = await tyron.SmartUtil.default.intoMap(
                    balances!.result.balances
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
                        res = Number(finalBalance) //.toFixed(2))
                    }
                } catch (error) {
                    res = 0
                }
                return res
            } else {
                const balance = await getSmartContract(contract!, '_balance')

                const balance_ = balance!.result._balance
                const zil_balance = Number(balance_) / 1e12
                let res = Number(zil_balance) //.toFixed(2))
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
            toast.warn(
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
                        toast.warn('Info is missing', {
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
                        throw Error()
                    }
                }
                for (let i = 0; i < inputCoin.length; i += 1) {
                    const coin = inputCoin[i]?.split('@')[0]
                    const amount = inputCoin[i]?.split('@')[1]
                    const input_ = Number(amount)
                    if (isNaN(input_)) {
                        toast.warn(t('The input is not a number.'), {
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
                    console.log('@input:', input_)
                    console.log('@balance:', balance)
                    if (!balance || input_ > balance) {
                        toast.warn(`Not enough balance for ${coin}`, {
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
            } catch (error) {
                console.error(error)
                setSavedCurrency(false)
            }
        }
        setIsLoadingCheckBalance(false)
    }

    const handleOnChangeRecipientType = (value) => {
        resetState()
        setSavedRecipient(false)
        setRecipientType(value)
        if (value === 'zilpay') {
            const addrZilPay = loginInfo?.zilAddr?.base16
            setRecipient(addrZilPay)
            setSavedRecipient(true)
        }
    }

    const handleInputSearch = ({
        currentTarget: { value },
    }: React.ChangeEvent<HTMLInputElement>) => {
        updateDonation(null)
        setSavedRecipient(false)
        setInput(value)
    }

    const handleInput2 = (event: { target: { value: any } }) => {
        setRecipient('')
        setSavedRecipient(false)
        setRecipient(event.target.value)
    }

    const handleOnKeyPress2 = async ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            handleSave()
        }
    }

    const handleSave = async () => {
        let addr_input = recipient
        try {
            addr_input = zcrypto.fromBech32Address(addr_input)
            setRecipient(addr_input)
            setSavedRecipient(true)
        } catch (error) {
            try {
                addr_input = zcrypto.toChecksumAddress(addr_input)
                setRecipient(addr_input)
                setSavedRecipient(true)
            } catch {
                toast.warn('Wrong address format.', {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 3,
                })
            }
        }
    }

    const resolveUser = async () => {
        setIsLoadingRecipient(true)
        try {
            const input = input_.replace(/ /g, '')
            let domain = input.toLowerCase()
            let tld = ''
            let subdomain = ''

            //@review: domains
            if (input.includes('.zlp')) {
                tld = 'zlp'
            }
            if (input.includes('@')) {
                domain = input
                    .split('@')[1]
                    .replace('.did', '')
                    .replace('.ssi', '')
                    .replace('.zlp', '')
                    .toLowerCase()
                subdomain = input.split('@')[0]
            } else if (input.includes('.')) {
                if (
                    input.split('.')[1] === 'ssi' ||
                    input.split('.')[1] === 'did' ||
                    input.split('.')[1] === 'zlp'
                ) {
                    domain = input.split('.')[0].toLowerCase()
                    tld = input.split('.')[1]
                } else {
                    throw new Error('Resolver failed.')
                }
            }
            // @review: test if (input.includes('@') && input.includes('.did')) {
            //     setInput(input.replace('.did', '.ssi'))
            // }
            let _subdomain
            if (subdomain && subdomain !== '') {
                _subdomain = subdomain
            }
            await tyron.SearchBarUtil.default
                .fetchAddr(net, tld, domain, _subdomain)
                .then((addr) => {
                    setTLD(tld)
                    setDomain(domain)
                    setSubdomain(subdomain)
                    setRecipient(addr)
                    setSavedRecipient(true)
                })
                .catch((err) => {
                    throw err
                })
        } catch (error) {
            toast.warn('Verification unsuccessful.', {
                position: 'top-right',
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
        setIsLoadingRecipient(false)
    }

    const setPercentage = async (percentage, val, i) => {
        setLoadingPercentage(val.value)
        const bal = await fetchWalletBalance(val.value.toLowerCase(), contract)
        setSavedCurrency(false)
        updateDonation(null)
        inputCoin[i] = val.value + '@' + bal[0] * percentage
        setInputCoin(inputCoin)
        setReRender(false)
        setTimeout(() => {
            setReRender(true)
        }, 1)
        setLoadingPercentage('')
        // let input = 0
        // if (source === 'zilliqa') {
        //     input = currencyBal[1] * percentage
        // } else {
        //     input = currencyBal[0] * percentage
        // }
        // if (input !== 0) {
        //     setInput(input)
        //     setLegendCurrency('saved')
        // } else {
        //     toast.warn(t('The amount cannot be zero.'), {
        //         position: 'top-right',
        //         autoClose: 3000,
        //         hideProgressBar: false,
        //         closeOnClick: true,
        //         pauseOnHover: true,
        //         draggable: true,
        //         progress: undefined,
        //         theme: toastTheme(isLight),
        //         toastId: 4,
        //     })
        // }
    }

    const resetState = () => {
        setInputCoin([])
        setSelectedCoin([])
        setSavedCurrency(false)
        setRecipient('')
        setSavedRecipient(false)
        setRecipientType('')
    }

    const handleSubmit = async () => {
        setIsLoading(true)
        const zilpay = new ZilPayBase()
        let params: any = []
        const addr: TransitionParams = {
            vname: 'addr',
            type: 'ByStr20',
            value: recipient_,
        }
        params.push(addr)
        let arrayToken: any = []
        for (let i = 0; i < inputCoin.length; i += 1) {
            const val = inputCoin[i].split('@')
            console.log('@input coin - ', inputCoin[i])
            const _currency = tyron.Currency.default.tyron(
                val[0],
                Number(val[1])
            )
            arrayToken.push({
                argtypes: ['String', 'Uint128'],
                arguments: [
                    `${val[0].toLowerCase()}`,
                    `${Big(_currency.amount)}`,
                ],
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
                tx = await tx.confirm(res.ID, 33)
                if (tx.isConfirmed()) {
                    setIsLoading(false)
                    dispatch(setTxStatusLoading('confirmed'))
                    setTimeout(() => {
                        window.open(
                            `https://viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
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

    const optionRecipient = [
        {
            value: 'username',
            label: t('NFT Username'),
        },
        {
            value: 'addr',
            label: t('Address'),
        },
        {
            value: 'zilpay',
            label: 'ZilPay',
        },
    ]

    if (!modalTransfer) {
        return null
    }

    return (
        <>
            {reRender && <div />}
            {/* @outerclose */}
            {/* <div onClick={outerClose} className={styles.outerWrapper} /> */}
            <div className={styles.container}>
                <div className={styles.innerContainer}>
                    <div>
                        <div onClick={outerClose} className="closeIcon">
                            <Image
                                alt="ico-close"
                                src={Close}
                                width={14}
                                height={14}
                            />
                        </div>
                        <div className={styles.headerTxt}>
                            {t('BATCH TRANSFER')}
                        </div>
                    </div>
                    <div className={styles.contentWrapper}>
                        {/* @review: types of batch transfer */}
                        {typeBatchTransfer === 'transfer' && (
                            <>
                                <div className={styles.txt}>send to</div>
                                {/* @review: translate */}
                                <div className={styles.selector}>
                                    <Selector
                                        option={optionRecipient}
                                        onChange={handleOnChangeRecipientType}
                                        placeholder={t('RECIPIENT')}
                                    />
                                </div>
                                {recipientType === 'username' ? (
                                    <div className={styles.selector}>
                                        <SearchBarWallet
                                            resolveUsername={resolveUser}
                                            handleInput={handleInputSearch}
                                            input={input_}
                                            loading={isLoadingRecipient}
                                            saved={savedRecipient}
                                        />
                                    </div>
                                ) : recipientType === 'addr' ? (
                                    <div className={styles.containerInput}>
                                        <input
                                            type="text"
                                            // className={styles.input}
                                            placeholder={t('ADDRESS')}
                                            onChange={handleInput2}
                                            onKeyPress={handleOnKeyPress2}
                                        />
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                marginLeft: '2%',
                                            }}
                                            onClick={() => {
                                                handleSave()
                                            }}
                                        >
                                            <div>
                                                {!savedRecipient ? (
                                                    <Arrow />
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
                                        </div>
                                    </div>
                                ) : (
                                    <></>
                                )}
                            </>
                        )}
                        {typeBatchTransfer === 'withdraw' || savedRecipient ? (
                            <>
                                <div style={{ marginBottom: '1rem' }}>
                                    {recipientType === 'username' ? (
                                        <RecipientInfo
                                            address={zcrypto?.toBech32Address(
                                                recipient_!
                                            )}
                                            recipient_subdomain={subdomain_}
                                            recipient_domain={domain_}
                                            recipient_tld={tld_}
                                        />
                                    ) : typeBatchTransfer === 'withdraw' ? (
                                        <RecipientInfo
                                            address={zcrypto?.toBech32Address(
                                                recipient_!
                                            )}
                                            // @review: recipient_domain={resolvedInfo?.user_domain}
                                            // recipient_tld={resolvedInfo?.domain}
                                        />
                                    ) : (
                                        <RecipientInfo
                                            address={zcrypto?.toBech32Address(
                                                recipient_!
                                            )}
                                        />
                                    )}
                                </div>
                                <div className={styles.selector}>
                                    <Selector
                                        option={option}
                                        onChange={handleOnChange}
                                        placeholder={t('Select coins')}
                                        isMulti={true}
                                    />
                                </div>
                            </>
                        ) : (
                            <></>
                        )}
                        <div style={{ width: 'fit-content' }}>
                            {selectedCoin.map((val: any, i) => (
                                <div key={i} className={styles.input}>
                                    <div className={styles.wrapperInput}>
                                        <code className={styles.code}>
                                            {val.value}
                                        </code>
                                        <input
                                            value={
                                                inputCoin[i]?.split('@')[1]
                                                    ? inputCoin[i]?.split(
                                                          '@'
                                                      )[1]
                                                    : undefined
                                            }
                                            className={styles.inputCurrency}
                                            type="text"
                                            placeholder={t('Type amount')}
                                            onChange={(event) => {
                                                setSavedCurrency(false)
                                                updateDonation(null)
                                                const value = event.target.value
                                                inputCoin[i] =
                                                    val.value + '@' + value
                                                setInputCoin(inputCoin)
                                                setReRender(false)
                                                setTimeout(() => {
                                                    setReRender(true)
                                                }, 1)
                                            }}
                                        />
                                    </div>
                                    <InputPercentage
                                        setPercentage={setPercentage}
                                        isMap={true}
                                        val={val}
                                        i={i}
                                        isLoading={
                                            loadingPercentage === val.value
                                        }
                                    />
                                </div>
                            ))}
                            <div
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                }}
                            >
                                {selectedCoin.length > 0 && (
                                    <div
                                        onClick={saveCurrency}
                                        style={{ width: 'fit-content' }}
                                    >
                                        {isLoadingCheckBalance ? (
                                            <Spinner />
                                        ) : !savedCurrency ? (
                                            <Arrow />
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
                            </div>
                        </div>
                        {savedCurrency && (
                            <>
                                <Donate />
                                {donation !== null && (
                                    <div className={styles.wrapperBtn}>
                                        <div
                                            onClick={handleSubmit}
                                            className={
                                                isLight
                                                    ? 'actionBtnLight'
                                                    : 'actionBtn'
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
