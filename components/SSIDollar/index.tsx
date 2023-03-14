import { useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import * as tyron from 'tyron'
import Image from 'next/image'
import { RootState } from '../../src/app/reducers'
import { ZilPayBase } from '../../components/ZilPay/zilpay-base'
import styles from './styles.module.scss'
import GetSSIDollar from './Get'
import TransferSSIDollar from './Transfer'
import UnlockSSIDollar from './Unlock'
import SSIDollarLogo from '../../src/assets/logos/ssidollar.png'

function SSIDollar() {
    const loginInfo = useSelector((state: RootState) => state.modal)
    const net = useSelector((state: RootState) => state.modal.net)
    const [balance, setBalance] = useState(0)
    const [balance$SI, setBalance$SI] = useState(0)
    const [loan, setLoan] = useState({ zil: 0, $si: 0 })
    const [loading, setLoading] = useState(false)
    const [section, setSection] = useState('')
    const $SIproxy = '0xc23cA8BE034b27B0d5d80CB08CE0EF10e336865d' // @todo
    const $SIimpl = '0xf930df14b7ce8c133c40f53f5db39cae4a27fac7' // @todo

    const fetchBalance = async (id: string) => {
        setBalance(0)
        setBalance$SI(0)
        setLoading(true)
        let token_addr: string
        let network = tyron.DidScheme.NetworkNamespace.Mainnet
        if (net === 'testnet') {
            network = tyron.DidScheme.NetworkNamespace.Testnet
        }
        const init = new tyron.ZilliqaInit.default(network)
        try {
            if (id === '$si') {
                const balances =
                    await init.API.blockchain.getSmartContractSubState(
                        $SIproxy,
                        'balances'
                    )
                const balances_ = await tyron.SmartUtil.default.intoMap(
                    balances.result.balances
                )
                try {
                    const balance_zilpay = balances_.get(
                        loginInfo.zilAddr.base16.toLowerCase()
                    )
                    if (balance_zilpay !== undefined) {
                        const _currency = tyron.Currency.default.tyron(id)
                        const finalBalance = balance_zilpay / _currency.decimals
                        setBalance$SI(Number(finalBalance.toFixed(2)))
                    }
                } catch (error) {
                    setBalance$SI(0)
                }
            } else if (id !== 'zil') {
                const init_addr = await tyron.SearchBarUtil.default.fetchAddr(
                    net,
                    'init',
                    'did'
                )
                const get_services =
                    await init.API.blockchain.getSmartContractSubState(
                        init_addr,
                        'services'
                    )
                const services = await tyron.SmartUtil.default.intoMap(
                    get_services.result.services
                )
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
                    const balance_zilpay = balances_.get(
                        loginInfo.zilAddr.base16.toLowerCase()
                    )
                    if (balance_zilpay !== undefined) {
                        const _currency = tyron.Currency.default.tyron(id)
                        const finalBalance = balance_zilpay / 1e12 //_currency.decimals @todo only for testnet
                        setBalance(Number(finalBalance.toFixed(2)))
                    }
                } catch (error) {
                    setBalance(0)
                }
            } else {
                const zilpay = new ZilPayBase().zilpay
                const zilPay = await zilpay()
                const blockchain = zilPay.blockchain
                const zilpay_balance = await blockchain.getBalance(
                    loginInfo.zilAddr.base16.toLowerCase()
                )
                const zilpay_balance_ =
                    Number(zilpay_balance.result!.balance) / 1e12

                setBalance(Number(zilpay_balance_.toFixed(2)))
            }
        } catch (error) {
            setBalance(0)
        }
        setLoading(false)
    }

    const fetchLoan = async () => {
        setLoan({
            zil: 0,
            $si: 0,
        })
        setLoading(true)
        let network = tyron.DidScheme.NetworkNamespace.Mainnet
        if (net === 'testnet') {
            network = tyron.DidScheme.NetworkNamespace.Testnet
        }
        const init = new tyron.ZilliqaInit.default(network)
        try {
            const get_accounts =
                await init.API.blockchain.getSmartContractSubState(
                    $SIimpl,
                    'accounts'
                )
            const accounts = await tyron.SmartUtil.default.intoMap(
                get_accounts.result.accounts
            )
            const account_zilpay = accounts.get(
                loginInfo.zilAddr.base16.toLowerCase()
            )
            console.log(account_zilpay)
            if (account_zilpay !== undefined) {
                let account_zil = account_zilpay.arguments[0]
                let account_$si = account_zilpay.arguments[1]
                console.log(account_$si)

                account_zil = account_zil / 1e12

                const _currency = tyron.Currency.default.tyron('$si')
                account_$si = account_$si / _currency.decimals

                console.log(account_$si)

                setLoan({
                    zil: Number(account_zil.toFixed(2)),
                    $si: Number(account_$si.toFixed(2)),
                })
            }
        } catch (error) {
            setLoan({
                zil: 0,
                $si: 0,
            })
        }
        setLoading(false)
    }

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <div className={styles.logo}>
                    <Image src={SSIDollarLogo} alt="ssidollar-logo" />
                </div>
                <h1 style={{ color: '#0000ff' }}>
                    Self Sovereign Identity Dollar
                </h1>
            </div>
            {section === '' && (
                <div className={styles.wrapper}>
                    <div
                        style={{
                            marginTop: '3%',
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
                                        if (loginInfo.zilAddr) {
                                            fetchBalance('$si')
                                            setSection('currency')
                                        } else {
                                            toast.error('Connect ZilPay', {
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
                                    }}
                                    className={styles.flipCard}
                                >
                                    <div className={styles.flipCardInner}>
                                        <div className={styles.flipCardFront}>
                                            <div className={styles.cardTitle3}>
                                                GET $SI
                                            </div>
                                        </div>
                                        <div className={styles.flipCardBack}>
                                            <div className={styles.cardTitle2}>
                                                $SI Vault
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </h2>
                            <h2 style={{ marginLeft: '20px' }}>
                                <div
                                    onClick={() => {
                                        if (loginInfo.zilAddr) {
                                            fetchBalance('$si')
                                            setSection('transfer')
                                        } else {
                                            toast.error('Connect ZilPay', {
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
                                    }}
                                    className={styles.flipCard}
                                >
                                    <div className={styles.flipCardInner}>
                                        <div className={styles.flipCardFront}>
                                            <div className={styles.cardTitle3}>
                                                TRANSFER $SI
                                            </div>
                                        </div>
                                        <div className={styles.flipCardBack}>
                                            <div className={styles.cardTitle2}>
                                                TRANSFER FUNDS
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </h2>
                        </div>
                    </div>
                    <div
                        style={{
                            marginTop: '3%',
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
                            <h2 style={{ marginLeft: '20px' }}>
                                <div
                                    onClick={() => {
                                        if (loginInfo.zilAddr) {
                                            fetchBalance('$si')
                                            fetchBalance('zil')
                                            fetchLoan()
                                            setSection('unlock')
                                        } else {
                                            toast.error('Connect ZilPay', {
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
                                    }}
                                    className={styles.flipCard}
                                >
                                    <div className={styles.flipCardInner}>
                                        <div className={styles.flipCardFront}>
                                            <div className={styles.cardTitle3}>
                                                UNLOCK ZIL
                                            </div>
                                        </div>
                                        <div className={styles.flipCardBack}>
                                            <div className={styles.cardTitle2}>
                                                return $SI loan
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </h2>
                        </div>
                    </div>
                </div>
            )}
            {section !== '' && (
                <button
                    className="button"
                    onClick={() => {
                        setSection('')
                    }}
                >
                    <span>BACK</span>
                </button>
            )}
            {section === 'currency' && (
                <GetSSIDollar
                    fetchBalance={fetchBalance}
                    balance={balance}
                    setBalance={setBalance}
                    balance$SI={balance$SI}
                    loading={loading}
                    setLoading={setLoading}
                />
            )}
            {section === 'transfer' && (
                <TransferSSIDollar
                    setBalance={setBalance}
                    balance$SI={balance$SI}
                    loading={loading}
                    setLoading={setLoading}
                />
            )}
            {section === 'unlock' && (
                <UnlockSSIDollar
                    loan={loan}
                    balance={balance}
                    balance$SI={balance$SI}
                    loading={loading}
                    setLoading={setLoading}
                />
            )}
        </div>
    )
}

export default SSIDollar
