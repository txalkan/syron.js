import React, { useEffect, useState } from 'react'
import styles from './index.module.scss'
import Big from 'big.js'
import { useStore } from 'react-stores'
import { SwapSettings } from './settings'
import { BoxInput } from './input'
import { TokenInput } from './token'
import { TransactionOutput } from './txn-output'
import { $tokens } from '../../src/store/tokens'
import { VaultPair } from '../../src/types/vault'
import { TokensModal } from '../Modals/tokens'
import { TokenBalance, TokenState } from '../../src/types/token'
import { SwapSettingsModal } from '../Modals/settings'
import icoReceive from '../../src/assets/icons/ssi_icon_receive.svg'
import icoSend from '../../src/assets/icons/ssi_icon_3arrowsDown.svg'
import Image from 'next/image'
import { SSIVault } from '../../src/mixins/vault'
import { ConfirmBox } from '../Modals/confirm-box'
import { $xr } from '../../src/store/xr'
import { BoxLiquidInput } from './input/liquid'
import { SyronTokenModal } from '../Modals/tokens/syron'
import { $syron } from '../../src/store/syron'
import { toast } from 'react-toastify'
import {
    FileStatus,
    InscribeOrderData,
    InscribeOrderStatus,
} from '../../src/utils/unisat/api-types'
import { unisatApi } from '../../src/utils/unisat/api'
import { mempoolFeeRate } from '../../src/utils/unisat/httpUtils'

type Prop = {
    startPair: VaultPair[]
    type: string
}

Big.PE = 999

const vault = new SSIVault()

export const SyronForm: React.FC<Prop> = ({ startPair, type }) => {
    const syron = useStore($syron)
    const [sdb, setSDB] = useState('')

    useEffect(() => {
        if (syron !== null) {
            console.log('Syron', JSON.stringify(syron, null, 2))

            setSDB(syron.ssi_box)
        }
    }, [syron?.ssi_box])

    const tokensStore = useStore($tokens)

    const [loading, setLoading] = React.useState(false)
    const [modal0, setModal0] = React.useState(false)
    const [modal1, setModal1] = React.useState(false)
    const [modal3, setModal3] = React.useState(false)
    const [modal4, setModal4] = React.useState(false)
    const [verified, setVerified] = React.useState(false)
    const [known, setKnown] = React.useState(false)
    const [sufficient, setSufficient] = React.useState(false)
    const [confirmModal, setConfirmModal] = React.useState(false)
    const [vault_pair, setPair] = React.useState<VaultPair[]>(startPair)
    const [selectedIndex, setSelectedIndex] = React.useState(0)
    const [selectedData, setSelectedData] = React.useState<any>(null)

    const _0 = Big(0)
    const [amount, setAmount] = React.useState(_0)

    const direction = React.useMemo(() => {
        return vault.getVaultDirection(vault_pair)
    }, [vault_pair])

    const handleForm = React.useCallback(() => {
        setPair(JSON.parse(JSON.stringify(vault_pair.reverse())))

        //@ssibrowser
        const unLinkedPair = JSON.parse(JSON.stringify(vault_pair))

        unLinkedPair[0].value = _0
        unLinkedPair[1].value = _0
        setPair(unLinkedPair)
        setAmount(_0)
    }, [vault_pair])

    const handleSubmit = React.useCallback(
        (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            setConfirmModal(true)
        },
        []
    )

    const xr = useStore($xr)
    const handleOnInput = React.useCallback(
        (value: Big) => {
            try {
                if (xr != null) {
                    setConfirmModal(false)
                    const unLinkedPair = JSON.parse(JSON.stringify(vault_pair))
                    unLinkedPair[0].value = value
                    // unLinkedPair[1].value = dex.getRealPrice(unLinkedPair)
                    //setPair(unLinkedPair)
                    //@ssibrowsers

                    const amount = vault.computeSU$D(unLinkedPair, xr.rate)
                    unLinkedPair[1].value = amount

                    setPair(unLinkedPair)
                    setAmount(Big(amount))
                }
            } catch (error) {
                console.error(error)
            }
        },
        [vault_pair, xr]
    )

    const handleOnSelectToken = React.useCallback(
        (token: TokenState, index: number) => {
            const unLinkedPair = JSON.parse(JSON.stringify(vault_pair))

            unLinkedPair[1].value = String(0)
            unLinkedPair[0].value = String(0)
            unLinkedPair[index].meta = token
            setPair(unLinkedPair)
            setModal0(false)
            setModal1(false)

            setAmount(_0)
        },
        [vault_pair]
    )

    //@mainnet-dex
    const onDexSwap = () => {
        const update_pair = JSON.parse(JSON.stringify(vault_pair))

        update_pair[1].value = amount

        setPair(update_pair)
        setConfirmModal(true)
    }

    useEffect(() => {
        if (Number(vault_pair[0].value) > 0) {
            handleOnInput(vault_pair[0].value)
        }
    }, [tokensStore])

    const [disabled, setDisabled] = React.useState(true)
    useEffect(() => {
        if (xr != null) setDisabled(false)
    }, [xr])

    if (type === 'get') {
        return (
            <>
                <SwapSettingsModal
                    show={modal3}
                    onClose={() => setModal3(false)}
                />
                <TokensModal
                    show={modal0}
                    // warn
                    // include
                    exceptions={vault_pair.map((t) => t.meta.symbol)}
                    onClose={() => setModal0(false)}
                    onSelect={(token) => handleOnSelectToken(token, 0)}
                />
                <TokensModal
                    show={modal1}
                    include
                    // warn
                    exceptions={vault_pair.map((t) => t.meta.symbol)}
                    onClose={() => setModal1(false)}
                    onSelect={(token) => handleOnSelectToken(token, 1)}
                />
                {vault_pair.length === 2 ? (
                    <form className={styles.container} onSubmit={handleSubmit}>
                        <div className={styles.contentWrapper}>
                            <div className={styles.icoWrapper}>
                                <Image
                                    src={icoSend}
                                    alt="deposit-icon"
                                    className={styles.img}
                                />
                                <div className={styles.titleForm2}>
                                    Deposit Bitcoin
                                </div>
                            </div>

                            <BoxInput
                                value={vault_pair[0].value}
                                token={vault_pair[0].meta}
                                disabled={disabled}
                                onSelect={() => setModal0(true)}
                                onInput={handleOnInput}
                                onMax={handleOnInput}
                                onSwap={handleForm}
                            />
                        </div>
                        {/* <div className={styles.contentWrapper2}>
                            <div className={styles.icoWrapper}>
                                <Image
                                    src={icoReceive}
                                    alt="get-icon"
                                    height="22"
                                    width="22"
                                />
                                <div className={styles.titleForm2}>Get Syron</div>
                            </div>
                            <TokenInput
                                token={vault_pair[1].meta}
                                onSelect={() => setModal1(true)}
                            />
                        </div> */}
                        <div style={{ width: '100%' }}>
                            <TransactionOutput
                                amount={amount}
                                token={vault_pair[1].meta}
                            />
                            <ConfirmBox
                                show={confirmModal}
                                pair={vault_pair}
                                direction={direction}
                                // onClose={() => {
                                //     setConfirmModal(false)
                                // }}
                            />
                        </div>
                    </form>
                ) : null}
            </>
        )
    }

    const handleVerify = async () => {
        setLoading(true)
        try {
            throw new Error('Coming soon!')

            let order: InscribeOrderData

            let amt

            // @dev The transaction fee rate in sat/vB @review (mainnet)
            let feeRate = await mempoolFeeRate()
            console.log('Fee Rate', feeRate)

            if (!feeRate) {
                feeRate = 20
            }

            if (sdb === '') {
                throw new Error('SDB Loading error')
            } else {
                // @dev Transfer Inscription
                order = await unisatApi.createTransfer({
                    receiveAddress: sdb,
                    feeRate: feeRate || 1,
                    outputValue: 546,
                    devAddress: '', // @review (mainnet) fee
                    devFee: 0,
                    brc20Ticker: 'SYRO',
                    brc20Amount: String(amt),
                })
            }
        } catch (err) {
            console.error('handleConfirm', err)
            // dispatch(setTxStatusLoading('rejected'))

            if (err == 'Error: Coming soon!') {
                toast.info('Coming soon!', {
                    position: 'bottom-center',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    toastId: 3,
                })
            } else if (
                typeof err === 'object' &&
                Object.keys(err!).length !== 0
            ) {
                toast.error('Request Rejected', {
                    position: 'bottom-center',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    toastId: 4,
                })
            } else {
                toast.error(String(err), {
                    position: 'bottom-center',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    toastId: 5,
                })
            }
            setLoading(false)
        }
    }

    return (
        <>
            {/* <SwapSettingsModal show={modal3} onClose={() => setModal3(false)} /> */}
            <TokensModal
                show={false}
                // warn
                // include
                exceptions={vault_pair.map((t) => t.meta.symbol)}
                onClose={() => setModal0(false)}
                onSelect={(token) => handleOnSelectToken(token, 0)}
            />
            <SyronTokenModal
                show={modal4}
                onClose={() => setModal4(false)}
                selectedIndex={selectedIndex}
                setSelectedIndex={setSelectedIndex}
                setSelectedData={setSelectedData}
            />
            {vault_pair.length === 2 ? (
                <form className={styles.container} onSubmit={handleSubmit}>
                    <div className={styles.contentWrapper}>
                        <div className={styles.icoWrapper}>
                            <Image
                                src={icoSend}
                                alt="deposit-icon"
                                className={styles.img}
                            />
                            <div className={styles.titleForm2}>
                                Liquidate Safety Deposit ₿ox
                            </div>
                            <div
                                onClick={() => setModal4(true)}
                                className={styles.btnTitle}
                            >
                                Select SDB
                            </div>
                        </div>

                        <div className={styles.selectInfoWrapper}>
                            <div className={styles.selectedInfo}>
                                <span
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {selectedData ? (
                                        <>
                                            <span
                                                style={{
                                                    fontWeight: 'bold',
                                                    color: 'white',
                                                    marginRight: '1rem',
                                                }}
                                            >
                                                Debtor&apos;s SDB:{' '}
                                            </span>
                                            {selectedData.address}
                                        </>
                                    ) : (
                                        <span
                                            style={{
                                                color: 'white',
                                                whiteSpace: 'normal',
                                            }}
                                        >
                                            Choose SDB with the button above ↑
                                        </span>
                                    )}
                                </span>
                            </div>
                        </div>

                        <BoxLiquidInput
                            value={vault_pair[0].value}
                            token={vault_pair[0].meta}
                            disabled={disabled}
                            onSelect={() => setModal0(true)}
                            onInput={handleOnInput}
                            onMax={handleOnInput}
                            onSwap={handleForm}
                            selectedData={selectedData}
                        />
                    </div>

                    {/* <div className={styles.contentWrapper2}>
                        <div className={styles.icoWrapper}>
                            <Image
                                src={icoReceive}
                                alt="get-icon"
                                height="22"
                                width="22"
                            />
                            <div className={styles.titleForm2}>Get Syron</div>
                        </div>
                        <TokenInput
                            token={vault_pair[1].meta}
                            onSelect={() => setModal1(true)}
                        />
                    </div> */}

                    <div style={{ width: '100%', marginTop: '3rem' }}>
                        <div className={styles.icoWrapper}>
                            <Image
                                src={icoSend}
                                alt="deposit-icon"
                                className={styles.img2}
                            />
                            <div className={styles.titleForm2}>
                                Pay with
                                <span className={styles.txtTitle}>
                                    &nbsp;Syron
                                </span>
                            </div>
                        </div>

                        <div className={styles.selectInfoWrapper}>
                            <div className={styles.selectedInfo}>
                                <span
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {sdb ? (
                                        <>
                                            <span
                                                style={{
                                                    fontWeight: 'bold',
                                                    color: 'white',
                                                    marginRight: '1rem',
                                                }}
                                            >
                                                Liquidator&apos;s SDB:
                                            </span>
                                            {sdb}
                                        </>
                                    ) : (
                                        <>Connect SDB</>
                                    )}
                                </span>
                            </div>
                        </div>

                        <div className={styles.selectInfoStatusWrapper}>
                            <div
                                className={
                                    verified
                                        ? styles.selectInfoStatusVerified
                                        : styles.selectInfoStatusPending
                                }
                                onClick={() => {
                                    if (!verified) {
                                        handleVerify()
                                    }
                                }}
                            >
                                Verify SUSD Balance
                            </div>
                            {verified ? (
                                <div
                                    className={
                                        styles.selectInfoStatusVerifiedText
                                    }
                                >
                                    Liquidator&apos;s SUSD balance has been
                                    verified.
                                </div>
                            ) : (
                                <div
                                    className={
                                        styles.selectInfoStatusPendingText
                                    }
                                >
                                    {!known ? (
                                        <>
                                            ↑ Send BRC-20 inscription with the
                                            button above
                                        </>
                                    ) : sufficient ? (
                                        <> </>
                                    ) : (
                                        <>
                                            Insufficient SUSD balance in the
                                            liquidator&apos;s SDB.
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className={styles.btnConfirmWrapper}>
                            <div
                                className={
                                    verified
                                        ? styles.btnConfirm
                                        : styles.btnConfirmDisabled
                                }
                                // onClick={
                                //     handleButtonClick
                                // }
                                // disabled={disabled}
                            >
                                <div className={styles.txt}>CONFIRM</div>
                            </div>
                        </div>
                    </div>
                </form>
            ) : null}
        </>
    )
}
