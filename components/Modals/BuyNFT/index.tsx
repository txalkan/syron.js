import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import * as tyron from 'tyron'
import {
    setTxId,
    setTxStatusLoading,
    updateLoginInfoUsername,
    updateLoginInfoZilpay,
} from '../../../src/app/actions'
import { RootState } from '../../../src/app/reducers'
import CloseIcon from '../../../src/assets/icons/ic_cross.svg'
import InfoIcon from '../../../src/assets/icons/info_yellow.svg'
import styles from './styles.module.scss'
import Image from 'next/image'
import { $user, updateUser } from '../../../src/store/user'
import { $net, updateNet } from '../../../src/store/wallet-network'
import {
    updateModalTx,
    updateModalDashboard,
    updateShowZilpay,
    updateModalTxMinimized,
} from '../../../src/store/modal'
import { useStore } from 'effector-react'
import * as zcrypto from '@zilliqa-js/crypto'
import { toast } from 'react-toastify'
import { ZilPayBase } from '../../ZilPay/zilpay-base'
import { updateTxList } from '../../../src/store/transactions'
import { $donation, updateDonation } from '../../../src/store/donation'
import { $buyInfo, updateBuyInfo } from '../../../src/store/buyInfo'
import {
    $modalBuyNft,
    updateModalBuyNft,
    $txType,
} from '../../../src/store/modal'
import { AddFunds, Donate, Selector } from '../../'
import { useTranslation } from 'next-i18next'

function Component() {
    const dispatch = useDispatch()
    const { t } = useTranslation()
    const Router = useRouter()
    const user = useStore($user)
    const net = useStore($net)
    const donation = useStore($donation)
    const buyInfo = useStore($buyInfo)
    const modalBuyNft = useStore($modalBuyNft)
    const txType = useStore($txType)
    const username = $user.getState()?.name
    const loginInfo = useSelector((state: RootState) => state.modal)
    const [loadingBalance, setLoadingBalance] = useState(false)
    const [inputAddr, setInputAddr] = useState('')
    const [legend, setLegend] = useState('save')
    const [loading, setLoading] = useState(false)
    const [info, setInfo] = useState(false)

    const handleOnChangeRecipient = (value) => {
        setInputAddr('')
        updateDonation(null)
        updateBuyInfo({
            recipientOpt: value,
            anotherAddr: undefined,
            currency: undefined,
            currentBalance: 0,
            isEnough: false,
        })
    }

    const handleConnect = React.useCallback(async () => {
        try {
            const wallet = new ZilPayBase()
            const zp = await wallet.zilpay()
            const connected = await zp.wallet.connect()

            const network = zp.wallet.net
            updateNet(network)

            const address = zp.wallet.defaultAccount

            if (connected && address) {
                dispatch(updateLoginInfoZilpay(address))
                updateShowZilpay(true)
                updateModalDashboard(true)
            }

            const cache = window.localStorage.getItem(
                String(zp.wallet.defaultAccount?.base16)
            )
            if (cache) {
                updateTxList(JSON.parse(cache))
            }
        } catch (err) {
            toast.error(String(err), {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
            })
        }
    }, [dispatch])

    const handleInputAddr = (event: { target: { value: any } }) => {
        setLegend('save')
        setInputAddr(event.target.value)
    }

    const handleOnKeyPress = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            validateInputAddr()
        }
    }

    const validateInputAddr = () => {
        const addr = tyron.Address.default.verification(inputAddr)
        if (addr !== '') {
            updateBuyInfo({
                recipientOpt: buyInfo?.recipientOpt,
                anotherAddr: addr,
            })
            setLegend('saved')
        } else {
            toast.error(t('Wrong address.'), {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
                toastId: 5,
            })
        }
    }

    const handleOnChangePayment = async (value) => {
        updateDonation(null)

        const payment = value
        updateBuyInfo({
            recipientOpt: buyInfo?.recipientOpt,
            anotherAddr: buyInfo?.anotherAddr,
            currency: payment,
            currentBalance: 0,
            isEnough: false,
        })

        const paymentOptions = async (id: string) => {
            setLoadingBalance(true)
            let token_addr: string
            let network = tyron.DidScheme.NetworkNamespace.Mainnet
            if (net === 'testnet') {
                network = tyron.DidScheme.NetworkNamespace.Testnet
            }
            const init = new tyron.ZilliqaInit.default(network)
            const init_addr = await tyron.SearchBarUtil.default.fetchAddr(
                net,
                'init',
                'did'
            )
            const get_services =
                await init.API.blockchain.getSmartContractSubState(
                    init_addr!,
                    'services'
                )
            const services = await tyron.SmartUtil.default.intoMap(
                get_services.result.services
            )
            try {
                token_addr = services.get(id)
                const balances =
                    await init.API.blockchain.getSmartContractSubState(
                        token_addr,
                        'balances'
                    )
                const balances_ = await tyron.SmartUtil.default.intoMap(
                    balances.result.balances
                )

                try {
                    const balance = balances_.get(
                        loginInfo.address.toLowerCase()
                    )
                    if (balance !== undefined) {
                        const _currency = tyron.Currency.default.tyron(
                            id.toLowerCase()
                        )
                        updateBuyInfo({
                            recipientOpt: buyInfo?.recipientOpt,
                            anotherAddr: buyInfo?.anotherAddr,
                            currency: payment,
                            currentBalance: balance / _currency.decimals,
                        })
                        let price: number
                        switch (id.toLowerCase()) {
                            case 'xsgd':
                                price = 15
                                break
                            default:
                                price = 10
                                break
                        }
                        if (balance >= price * _currency.decimals) {
                            updateBuyInfo({
                                recipientOpt: buyInfo?.recipientOpt,
                                anotherAddr: buyInfo?.anotherAddr,
                                currency: payment,
                                currentBalance: balance / _currency.decimals,
                                isEnough: true,
                            })
                        }
                    }
                } catch (error) {
                    toast.error('Your logged-in address has no balance.', {
                        position: 'top-right',
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: 'dark',
                    })
                }
            } catch (error) {
                toast.warning(t('Buy NFT: Not able to fetch balance.'), {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: 'dark',
                    toastId: 5,
                })
            }
            setLoadingBalance(false)
        }
        const id = payment.toLowerCase()
        if (id !== 'free') {
            paymentOptions(id)
        } else {
            updateBuyInfo({
                recipientOpt: buyInfo?.recipientOpt,
                anotherAddr: buyInfo?.anotherAddr,
                currency: payment,
                currentBalance: 0,
                isEnough: true,
            })
        }
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const zilpay = new ZilPayBase()

            let addr: tyron.TyronZil.TransitionValue
            if (buyInfo?.recipientOpt === 'ADDR') {
                addr = await tyron.TyronZil.default.OptionParam(
                    tyron.TyronZil.Option.some,
                    'ByStr20',
                    buyInfo?.anotherAddr
                )
            } else {
                addr = await tyron.TyronZil.default.OptionParam(
                    tyron.TyronZil.Option.none,
                    'ByStr20'
                )
            }

            const tyron_: tyron.TyronZil.TransitionValue =
                await tyron.Donation.default.tyron(donation!)
            const _amount = String(donation)

            const tx_params = await tyron.TyronZil.default.BuyNftUsername(
                username!,
                addr,
                buyInfo?.currency?.toLowerCase()!,
                tyron_
            )

            let tx = await tyron.Init.default.transaction(net)

            toast.info(
                t('You’re about to buy the NFT Username X!', {
                    name: username,
                }),
                {
                    position: 'top-center',
                    autoClose: 6000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: 'dark',
                }
            )
            updateModalBuyNft(false)
            dispatch(setTxStatusLoading('true'))
            updateModalTxMinimized(false)
            updateModalTx(true)
            await zilpay
                .call({
                    contractAddress: loginInfo.address,
                    transition: 'BuyNftUsername',
                    params: tx_params as unknown as Record<string, unknown>[],
                    amount: _amount,
                })
                .then(async (res) => {
                    dispatch(setTxId(res.ID))
                    dispatch(setTxStatusLoading('submitted'))

                    tx = await tx.confirm(res.ID)
                    if (tx.isConfirmed()) {
                        dispatch(setTxStatusLoading('confirmed'))
                        setTimeout(() => {
                            window.open(
                                `https://devex.zilliqa.com/tx/${
                                    res.ID
                                }?network=https%3A%2F%2F${
                                    net === 'mainnet' ? '' : 'dev-'
                                }api.zilliqa.com`
                            )
                        }, 1000)
                        dispatch(updateLoginInfoUsername(username!))
                        updateBuyInfo(null)
                        Router.push(`/${username}/did`)
                        updateUser({
                            name: username!,
                            domain: 'did',
                        })
                    } else if (tx.isRejected()) {
                        dispatch(setTxStatusLoading('failed'))
                    }
                })
                .catch((err) => {
                    throw err
                })
        } catch (error) {
            dispatch(setTxStatusLoading('rejected'))
            toast.error(String(error), {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
                toastId: 12,
            })
        }
        updateDonation(null)
    }

    const closeModal = () => {
        setInputAddr('')
        updateDonation(null)
        updateBuyInfo({
            recipientOpt: '',
            anotherAddr: undefined,
            currency: undefined,
            currentBalance: 0,
            isEnough: false,
        })
        Router.push('/')
        updateModalBuyNft(false)
    }

    const spinner = (
        <i
            style={{ color: '#ffff32' }}
            className="fa fa-lg fa-spin fa-circle-notch"
            aria-hidden="true"
        ></i>
    )

    if (!modalBuyNft) {
        return null
    }

    const option = [
        {
            key: '',
            name: '',
        },
        {
            key: 'SSI',
            name: t('THIS_SSI'),
        },
        {
            key: 'ADDR',
            name: t('ANOTHER_ADDRESS'),
        },
    ]

    const optionPayment = [
        {
            key: '',
            name: '',
        },
        {
            key: 'TYRON',
            name: '10 TYRON',
        },
        {
            key: 'XSGD',
            name: '15 XSGD',
        },
        {
            key: 'zUSDT',
            name: '10 zUSDT',
        },
        {
            key: 'FREE',
            name: t('FREE'),
        },
    ]

    return (
        <>
            <div className={styles.outerWrapper}>
                <div className={styles.containerClose} onClick={closeModal} />
                <div className={styles.container}>
                    <div className={styles.innerContainer}>
                        <div className="closeIcon">
                            <Image
                                alt="close-ico"
                                src={CloseIcon}
                                onClick={closeModal}
                            />
                        </div>
                        {txType === 'AddFunds' &&
                        (loginInfo.txStatusLoading === 'true' ||
                            loginInfo.txStatusLoading === 'submitted') ? (
                            <div className={styles.wrapperLoading}>
                                <div className={styles.loadingIco}>
                                    {spinner}
                                </div>
                                <h4 style={{ marginTop: '4%' }}>
                                    To continue, please wait until the Add Funds
                                    transaction gets finalised on the Zilliqa
                                    blockchain
                                </h4>
                            </div>
                        ) : (
                            <div className={styles.contentWrapper}>
                                <h3 className={styles.headerInfo}>
                                    {t('BUY_THIS_NFT_USERNAME')}
                                </h3>
                                <div className={styles.usernameInfoWrapper}>
                                    <h2 className={styles.usernameInfoYellow}>
                                        {user?.name.length! > 20
                                            ? `${user?.name.slice(
                                                  0,
                                                  8
                                              )}...${user?.name.slice(-8)}`
                                            : user?.name}
                                    </h2>
                                    <h2 className={styles.usernameInfo}>
                                        {t('IS_AVAILABLE')}
                                    </h2>
                                </div>
                                {loginInfo.address === null ? (
                                    <div
                                        style={{
                                            display: 'flex',
                                            width: '100%',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <button
                                            className="button secondary"
                                            onClick={handleConnect}
                                        >
                                            <p>{t('LOG_IN')}</p>
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <p style={{ fontSize: '14px' }}>
                                                {t('YOU_HAVE_LOGGED_IN_SSI')}
                                            </p>
                                            <p className={styles.loginAddress}>
                                                {loginInfo.address !== null ? (
                                                    <>
                                                        {loginInfo.username ? (
                                                            `${loginInfo.username}.did`
                                                        ) : (
                                                            <a
                                                                href={`https://devex.zilliqa.com/address/${
                                                                    loginInfo.address
                                                                }?network=https%3A%2F%2F${
                                                                    net ===
                                                                    'mainnet'
                                                                        ? ''
                                                                        : 'dev-'
                                                                }api.zilliqa.com`}
                                                                rel="noreferrer"
                                                                target="_blank"
                                                            >
                                                                <span>
                                                                    did:tyron:zil...
                                                                    {loginInfo.address.slice(
                                                                        -10
                                                                    )}
                                                                </span>
                                                            </a>
                                                        )}
                                                    </>
                                                ) : (
                                                    <></>
                                                )}
                                            </p>
                                        </div>
                                        <div className={styles.selectWrapper}>
                                            <div style={{ width: '100%' }}>
                                                <div
                                                    style={{ display: 'flex' }}
                                                >
                                                    <p
                                                        style={{
                                                            fontSize: '20px',
                                                        }}
                                                    >
                                                        {t('SELECT_RECIPIENT')}
                                                    </p>
                                                    <div
                                                        className={
                                                            styles.icoInfo
                                                        }
                                                        onClick={() =>
                                                            setInfo(!info)
                                                        }
                                                    >
                                                        <span
                                                            className={
                                                                styles.tooltip
                                                            }
                                                        >
                                                            <Image
                                                                alt="warning-ico"
                                                                src={InfoIcon}
                                                            />
                                                            <span
                                                                className={
                                                                    styles.tooltiptext
                                                                }
                                                            >
                                                                <h5
                                                                    className={
                                                                        styles.modalInfoTitle
                                                                    }
                                                                >
                                                                    {t('INFO')}
                                                                </h5>
                                                                <div
                                                                    style={{
                                                                        fontSize:
                                                                            '11px',
                                                                    }}
                                                                >
                                                                    {t(
                                                                        'INFO_MSG_RECIPIENT'
                                                                    )}
                                                                </div>
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className={styles.select}>
                                                    <Selector
                                                        option={option}
                                                        onChange={
                                                            handleOnChangeRecipient
                                                        }
                                                        value={
                                                            buyInfo?.recipientOpt
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            <div
                                                className={
                                                    styles.paymentWrapper
                                                }
                                            >
                                                {buyInfo?.recipientOpt ===
                                                    'SSI' ||
                                                (buyInfo?.recipientOpt ===
                                                    'ADDR' &&
                                                    buyInfo?.anotherAddr !==
                                                        undefined) ? (
                                                    <>
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                            }}
                                                        >
                                                            <p
                                                                style={{
                                                                    fontSize:
                                                                        '20px',
                                                                }}
                                                            >
                                                                {t(
                                                                    'SELECT_PAYMENT'
                                                                )}
                                                            </p>
                                                        </div>
                                                        <div
                                                            className={
                                                                styles.select
                                                            }
                                                        >
                                                            <Selector
                                                                option={
                                                                    optionPayment
                                                                }
                                                                onChange={
                                                                    handleOnChangePayment
                                                                }
                                                                value={
                                                                    buyInfo?.currency
                                                                }
                                                            />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <></>
                                                )}
                                            </div>
                                        </div>
                                        {buyInfo?.recipientOpt == 'ADDR' ? (
                                            buyInfo?.anotherAddr !==
                                            undefined ? (
                                                <p style={{ marginTop: '3%' }}>
                                                    {t('Recipient (address):')}{' '}
                                                    {zcrypto.toBech32Address(
                                                        buyInfo?.anotherAddr!
                                                    )}
                                                </p>
                                            ) : (
                                                <div
                                                    className={
                                                        styles.inputAddrWrapper
                                                    }
                                                >
                                                    <input
                                                        type="text"
                                                        style={{
                                                            marginRight: '3%',
                                                        }}
                                                        onChange={
                                                            handleInputAddr
                                                        }
                                                        onKeyPress={
                                                            handleOnKeyPress
                                                        }
                                                        placeholder="Type address"
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={
                                                            validateInputAddr
                                                        }
                                                        className={
                                                            legend === 'save'
                                                                ? 'button primary'
                                                                : 'button secondary'
                                                        }
                                                    >
                                                        <p>{legend}</p>
                                                    </button>
                                                </div>
                                            )
                                        ) : (
                                            <></>
                                        )}
                                        {buyInfo?.currency !== undefined && (
                                            <>
                                                {buyInfo?.currency !==
                                                    'FREE' && (
                                                    <div
                                                        className={
                                                            styles.balanceInfoWrapepr
                                                        }
                                                    >
                                                        <p
                                                            className={
                                                                styles.balanceInfo
                                                            }
                                                        >
                                                            {t(
                                                                'CURRENT_BALANCE'
                                                            )}
                                                        </p>
                                                        {loadingBalance ? (
                                                            <div
                                                                style={{
                                                                    marginLeft:
                                                                        '2%',
                                                                }}
                                                            >
                                                                {spinner}
                                                            </div>
                                                        ) : (
                                                            <p
                                                                className={
                                                                    styles.balanceInfoYellow
                                                                }
                                                            >
                                                                &nbsp;
                                                                {
                                                                    buyInfo?.currentBalance
                                                                }{' '}
                                                                {
                                                                    buyInfo?.currency
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                                {buyInfo?.currency !==
                                                    undefined &&
                                                    !loadingBalance && (
                                                        <>
                                                            {buyInfo?.isEnough ? (
                                                                <>
                                                                    {donation ===
                                                                    null ? (
                                                                        <Donate />
                                                                    ) : (
                                                                        <>
                                                                            <div
                                                                                style={{
                                                                                    width: 'fit-content',
                                                                                    marginTop:
                                                                                        '10%',
                                                                                    textAlign:
                                                                                        'center',
                                                                                }}
                                                                            >
                                                                                <button
                                                                                    className="button secondary"
                                                                                    onClick={
                                                                                        handleSubmit
                                                                                    }
                                                                                >
                                                                                    <strong
                                                                                        style={{
                                                                                            color: '#ffff32',
                                                                                        }}
                                                                                    >
                                                                                        {loading
                                                                                            ? spinner
                                                                                            : t(
                                                                                                  'BUY NFT USERNAME'
                                                                                              )}
                                                                                    </strong>
                                                                                </button>
                                                                            </div>
                                                                            <h5
                                                                                style={{
                                                                                    marginTop:
                                                                                        '3%',
                                                                                    color: 'lightgrey',
                                                                                }}
                                                                            >
                                                                                {t(
                                                                                    'GAS_AROUND'
                                                                                )}
                                                                                &nbsp;
                                                                                14
                                                                                ZIL
                                                                            </h5>
                                                                        </>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <p
                                                                        style={{
                                                                            color: 'red',
                                                                        }}
                                                                    >
                                                                        {t(
                                                                            'NOT_ENOUGH_BALANCE'
                                                                        )}
                                                                    </p>
                                                                    <AddFunds
                                                                        type="buy"
                                                                        coin={
                                                                            buyInfo?.currency
                                                                        }
                                                                    />
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Component
