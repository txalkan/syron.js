import styles from './index.module.scss'
import _Big from 'big.js'
import { useStore } from 'react-stores'
import toformat from 'toformat'
import React, { useEffect, useRef, useState } from 'react'
import ThreeDots from '../Spinner/ThreeDots'
import { toast } from 'react-toastify'
import {
    $btc_wallet,
    $icpTx,
    $inscriptionTx,
    $syron,
    $walletConnected,
    updateIcpTx,
    updateInscriptionTx,
    updateWalletConnected,
} from '../../src/store/syron'
import { extractRejectText } from '../../src/utils/unisat/utils'
import useICPHook from '../../src/hooks/useICP'
import { useBTCWalletHook } from '../../src/hooks/useBTCWallet'
import { useTranslation } from 'next-i18next'
import { useDispatch } from 'react-redux'
import { setTxId, setTxStatusLoading } from '../../src/app/actions'
import useSyronWithdrawal from '../../src/utils/icp/syron_withdrawal'
import Spinner from '../Spinner'
import { VaultPair } from '../../src/types/vault'
import { UnisatNetworkType } from '../../src/utils/unisat/httpUtils'

const Big = toformat(_Big)
Big.PE = 999
const _0 = Big(0)

type Prop = {
    pair: VaultPair[]
}

export var BtcToSyron: React.FC<Prop> = function ({ pair }) {
    const { t } = useTranslation()
    const dispatch = useDispatch()

    const btcWallet = useStore($btc_wallet)
    const btcAddr = btcWallet?.btc_addr

    const [userSSI, setSSI] = useState('')
    useEffect(() => {
        if (btcAddr) {
            setSSI(btcAddr)
        }
    }, [btcAddr])

    const syron = useStore($syron)
    const [sdb, setSDB] = useState('')
    useEffect(() => {
        if (syron !== null) {
            console.log('Syron', JSON.stringify(syron, null, 2))

            setSDB(syron.sdb)
        }
    }, [syron?.sdb])

    const unisat = (window as any).unisat
    const [unisatInstalled, setUnisatInstalled] = useState(false)
    useEffect(() => {
        const checkUnisatInstallation = () => {
            if ((window as any).unisat) {
                setUnisatInstalled(true)
                clearInterval(intervalId) // Clear the interval once unisat is found
            }
        }

        // Check for unisat every 100ms, up to 10 times
        const intervalId = setInterval(checkUnisatInstallation, 100)
        setTimeout(() => clearInterval(intervalId), 1000) // Stop checking after 1 second

        return () => clearInterval(intervalId) // Cleanup interval on component unmount
    }, [])

    const walletConnected = useStore($walletConnected).isConnected

    const { updateWallet } = useBTCWalletHook()
    const { getBox } = useICPHook()

    const [exactToken, limitToken] = pair
    const exactInput = exactToken.value
    const collateral = Math.floor(Number(exactInput))
    const limitInput = limitToken.value
    const amt = Number(limitInput.round(2))

    useEffect(() => {
        if (collateral !== 0) {
            updateInscriptionTx(null)
            updateIcpTx(null)
        }
    }, [collateral])

    const [isLoading, setIsLoading] = React.useState(false)

    let inscriptionTx = useStore($inscriptionTx)
    const icpTx = useStore($icpTx) //{ value: true } //

    const disabled = React.useMemo(() => {
        return (
            isLoading ||
            (syron == null && walletConnected) ||
            icpTx.value === false
        )
    }, [isLoading, syron, icpTx])

    const updateWalletBalance = async () => {
        if (!unisat) return

        const [address] = await unisat.getAccounts()

        const balance = await unisat.getBalance()

        const network = await unisat.getNetwork()

        if (balance)
            await updateWallet(address, Number(balance.confirmed), network)

        return address
    }
    const updateUserBalance = async () => {
        const ssi = await updateWalletBalance()
        await getBox(ssi, false)
        console.log('User balance updated')
    }

    const { btc_to_syron } = useSyronWithdrawal()

    const handleConfirm = React.useCallback(async () => {
        // @review (asap) transaction status modal not working - see dispatch(setTx
        // dispatch(setTxStatusLoading('true'))
        try {
            // @pause
            // use environment variable to pause the minting process
            if (process.env.NEXT_PUBLIC_MINTING_PAUSE === 'true') {
                throw new Error('Withdrawing SYRON is currently paused.')
            }

            setIsLoading(true)
            toast.dismiss(400)

            if (userSSI === '') {
                throw new Error('Please wait for your wallet to connect.')
            }

            if (btcWallet?.network != 'livenet') {
                // @mainnet
                console.log('Network:', btcWallet?.network)
                throw new Error('Use Bitcoin Mainnet')
            }

            console.log('BTC Collateral', collateral)
            console.log('Stablecoin Amount', amt)

            if (collateral < 1000)
                throw new Error(
                    'Your BTC deposit is below the minimum required amount of 0.00001 BTC. Please increase your deposit.'
                )

            // @mainnet collateral cannot be more than 5000 sats
            if (collateral > 5000)
                throw new Error(
                    'Your BTC deposit exceeds the maximum allowed amount of 0.00005 BTC. Please reduce your deposit.'
                )

            toast.info('Submitting your BTC deposit...', {
                autoClose: 4000,
                toastId: 1,
            })

            // @test
            // const inscriptionTx = {
            //     value: 'e93bef47349172691cf810af296776c8467a966979d0ed7e2c3dc4c1dc051281',
            // }

            await btc_to_syron(
                userSSI,
                sdb,
                Big(amt),
                collateral,
                typeof inscriptionTx.value === 'string'
                    ? inscriptionTx.value
                    : undefined
            )

            toast.dismiss(1)
            toast.info(`You have received ${amt} SYRON in your wallet!`, {
                autoClose: false,
            })

            await updateUserBalance()

            // window.open(`https://unisat.io/brc20?q=${ssi}&tick=SYRON`)
        } catch (error) {
            console.error('BTC to SYRON', error)

            toast.dismiss(1)
            // dispatch(setTxStatusLoading('rejected'))

            if (error == 'Error: Withdrawing SYRON is currently paused.') {
                toast.info('Withdrawing SYRON is currently paused.')
            } else if ((error as Error).message.includes('Your BTC deposit')) {
                toast.error((error as Error).message, { autoClose: 4000 })
            } else if (
                (error as Error).message.includes('SDB Loading Error') //"Cannot read properties of null (reading 'sdb')"
            ) {
                toast.info(
                    'Loading your Safety Deposit ₿ox… Please wait a moment and try again shortly.',
                    { autoClose: 2000, toastId: 400 }
                )
            } else if (
                typeof error === 'object' &&
                Object.keys(error!).length !== 0
            ) {
                toast.error(
                    <div className={styles.error}>
                        <div>
                            Your request was rejected. For assistance, please
                            let us know on Telegram{' '}
                            <a
                                href="https://t.me/tyrondao"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    color: 'blue',
                                    textDecoration: 'underline',
                                }}
                            >
                                @TyronDAO
                            </a>
                        </div>
                        <br />
                        <div style={{ color: 'red', paddingTop: '1rem' }}>
                            {error && (error as Error).message
                                ? (error as Error).message
                                : JSON.stringify(error, null, 2)}
                        </div>
                    </div>,
                    { autoClose: false, toastId: 400 }
                )
            } else {
                toast.error(
                    <div className={styles.error}>
                        <div>
                            Please let us know about this error on Telegram{' '}
                            <a
                                href="https://t.me/tyrondao"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    color: 'blue',
                                    textDecoration: 'underline',
                                }}
                            >
                                @TyronDAO
                            </a>
                        </div>
                        <div style={{ color: 'red', paddingTop: '1rem' }}>
                            {extractRejectText(String(error))}
                        </div>
                    </div>,
                    { autoClose: false, toastId: 400 }
                )
            }
        }
        setIsLoading(false)
    }, [userSSI, sdb, collateral, amt])

    const selfRef = useRef<{ accounts: string[] }>({
        accounts: [],
    })
    const self = selfRef.current
    const handleAccountsChanged = (_accounts: string[]) => {
        if (self.accounts[0] === _accounts[0]) {
            // prevent from triggering twice
            return
        }
        self.accounts = _accounts
        if (_accounts.length > 0) {
            updateWalletConnected(true)
        } else {
            updateWalletConnected(false)
        }
    }

    const [shouldCheckUnisat, setShouldCheckUnisat] = useState(false)
    useEffect(() => {
        //@review (wallet) functionality of this useEffect

        async function checkUnisat() {
            let unisat = (window as any).unisat

            for (let i = 1; i < 10 && !unisat; i += 1) {
                await new Promise((resolve) => setTimeout(resolve, 100 * i))
                unisat = (window as any).unisat
            }

            unisat.getAccounts().then((accounts: string[]) => {
                handleAccountsChanged(accounts)
            })

            unisat.on('accountsChanged', handleAccountsChanged)

            return () => {
                unisat.removeListener('accountsChanged', handleAccountsChanged)
            }
        }

        if (shouldCheckUnisat) checkUnisat().then()
    }, [shouldCheckUnisat])

    // @dev Once the inscribe-transfer transaction is confirmed, update the display of wallet balance
    useEffect(() => {
        async function updateWalletBal() {
            await updateWalletBalance()
        }

        if (inscriptionTx.value) updateWalletBal()
    }, [inscriptionTx.value])

    const handleButtonClick = async () => {
        try {
            if (!unisatInstalled) {
                window.open('https://unisat.io', '_blank')
            } else if (!walletConnected) {
                setShouldCheckUnisat(true)

                const network = await unisat.getNetwork()
                if (network != UnisatNetworkType.mainnet) {
                    await unisat.switchNetwork(UnisatNetworkType.mainnet)
                }

                const result = await unisat.requestAccounts()
                handleAccountsChanged(result)

                toast.info('Your wallet is now connected! 🎉')

                // @reload page
                // setTimeout(() => window.location.reload(), 2 * 1000)

                await updateUserBalance()
            } else {
                handleConfirm()
            }
        } catch (error) {
            console.error('Error connecting wallet:', error)
            toast.error('Failed to connect wallet')
        }
    }

    const retryWithdrawal = React.useCallback(async () => {
        toast.dismiss(400)

        if (isLoading) return

        setIsLoading(true)

        //inscriptionTx = 'b1fcf5ac8a5c8013a52e24458c8298b7e97a7431f9f1db1cc90fb8c98f90fcfc'

        try {
            if (!inscriptionTx.value) {
                throw new Error('The inscribe-transfer transaction is missing.')
            }
            await btc_to_syron(
                userSSI,
                sdb,
                typeof inscriptionTx === 'string' ? inscriptionTx : undefined
            )
            await updateUserBalance()
        } catch (error) {
            console.error('BTC to SYRON Retry', error)

            if (typeof error === 'object' && Object.keys(error!).length !== 0) {
                toast.error(
                    <div className={styles.error}>
                        <div>
                            Your request was rejected. For assistance, please
                            let us know on Telegram{' '}
                            <a
                                href="https://t.me/tyrondao"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    color: 'blue',
                                    textDecoration: 'underline',
                                }}
                            >
                                @TyronDAO
                            </a>
                        </div>
                        <br />
                        <div style={{ color: 'red', paddingTop: '1rem' }}>
                            {error && (error as Error).message
                                ? (error as Error).message
                                : JSON.stringify(error, null, 2)}
                        </div>
                    </div>,
                    { autoClose: false, toastId: 400 }
                )
            } else {
                toast.error(
                    <div className={styles.error}>
                        <div>
                            Please let us know about this error on Telegram{' '}
                            <a
                                href="https://t.me/tyrondao"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    color: 'blue',
                                    textDecoration: 'underline',
                                }}
                            >
                                @TyronDAO
                            </a>
                        </div>
                        <div style={{ color: 'red', paddingTop: '1rem' }}>
                            {extractRejectText(String(error))}
                        </div>
                    </div>,
                    { autoClose: false, toastId: 400 }
                )
            }
        }

        setIsLoading(false)
    }, [userSSI, sdb, isLoading, inscriptionTx])

    return (
        <div className={styles.container}>
            <div className={styles.info}>
                <div className={styles.column}>
                    <div className={styles.txtRow}>
                        | Collateral Ratio = 1.5:1
                    </div>
                    <br />
                </div>
            </div>
            <div
                style={{
                    width: '100%',
                    height: '40px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: '1rem',
                    marginBottom: '3rem',
                    cursor: 'pointer',
                    borderRadius: '22px',
                    backgroundColor: 'rgb(75,0,130)',
                    // @design-shadow-3d
                    backgroundImage:
                        'linear-gradient(to right, rgb(75,0,130), #7a28ff)', // Added gradient background
                    boxShadow:
                        '2px 1px 9px rgba(255, 243, 50, 0.5), inset 0 -2px 5px rgba(248, 248, 248, 0.5)', // Added 3D effect
                }}
                className={`button ${disabled ? 'disabled' : 'primary'}`}
                onClick={handleButtonClick}
            >
                {!unisatInstalled ? (
                    <div className={styles.txt}>{t('Install UniSat')}</div>
                ) : !walletConnected ? (
                    <div className={styles.txt}>{t('CONNECT')}</div>
                ) : disabled ? (
                    <ThreeDots color="yellow" />
                ) : (
                    <div className={styles.txt}>confirm</div>
                )}
            </div>
            {icpTx.value === false ? (
                <div className={styles.failedWithdrawal}>
                    {/* <div className={styles.icoColor}>
                                <Image
                                    alt="warning-ico"
                                    src={Warning}
                                    width={20}
                                    height={20}
                                />
                            </div> */}
                    <div className={styles.withdrawalTxt}>
                        We are very sorry, but your withdrawal request has
                        failed, possibly due to technical issues with the
                        Internet Computer.
                    </div>
                    <div className={styles.withdrawalTxt}>
                        Please try again after a moment. If the problem
                        persists, do not hesitate to contact us for support on
                        Telegram{' '}
                        <a
                            href="https://t.me/tyrondao"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: 'blue',
                                textDecoration: 'underline',
                            }}
                        >
                            @TyronDAO
                        </a>
                        .
                    </div>
                    <div className={styles.withdrawalTxt}>
                        We appreciate your patience and understanding!
                    </div>
                    <button
                        style={{
                            fontFamily: 'GeistMono, monospace',
                            fontSize: 'small',
                            backgroundColor: 'rgb(75, 0, 130)',
                        }}
                        onClick={retryWithdrawal}
                        className={'button secondary'}
                    >
                        {isLoading ? (
                            <ThreeDots color="yellow" />
                        ) : (
                            <div className={styles.txt}>retry</div>
                        )}
                    </button>
                </div>
            ) : (
                <>
                    {isLoading ? (
                        <div>
                            <div className={styles.withdrawalTxt}>
                                Your request is currently being processed...
                            </div>
                            {!inscriptionTx.value ? (
                                <div className={styles.withdrawalTxt}>
                                    Please do not close this window. This
                                    process will finish in about two Bitcoin
                                    blocks. Thank you for your patience!
                                </div>
                            ) : (
                                <div className={styles.withdrawalTxt}>
                                    Your BTC deposit has been confirmed! Tyron
                                    is now processing your SYRON withdrawal to
                                    your wallet. Thank you for your patience!
                                </div>
                            )}
                            <Spinner />
                        </div>
                    ) : (
                        <>
                            {icpTx.value === true ? (
                                <div className={styles.succeededWithdrawal}>
                                    <div className={styles.withdrawalTxt}>
                                        Congratulations! Your withdrawal was
                                        successful, and {amt} SYRON has been
                                        sent to your wallet.
                                    </div>
                                    <div className={styles.withdrawalTxt}>
                                        You can check your wallet to verify the
                                        transaction.
                                    </div>
                                    <div className={styles.withdrawalTxt}>
                                        Thank you for using Tyron!
                                    </div>
                                </div>
                            ) : null}
                        </>
                    )}
                </>
            )}
        </div>
    )
}
