import React, { useEffect } from 'react'
import styles from './index.module.scss'
import Big from 'big.js'
import { useStore } from 'react-stores'
import { SwapSettings } from './settings'
import { VaultInput } from './input'
import { TokenInput } from './token'
import { TransactionOutput } from './txn-output'
import { $tokens } from '../../src/store/tokens'
import { VaultPair } from '../../src/types/vault'
import { TokensModal } from '../Modals/tokens'
import { TokenBalance, TokenState } from '../../src/types/token'
import { SwapSettingsModal } from '../Modals/settings'
import icoReceive from '../../src/assets/icons/ssi_icon_receive.svg'
import icoSend from '../../src/assets/icons/ssi_icon_send.svg'
import Image from 'next/image'
import { SSIVault } from '../../src/mixins/vault'
import { ConfirmBox } from '../Modals/confirm-box'
import { $xr } from '../../src/store/xr'

type Prop = {
    startPair: VaultPair[]
}

Big.PE = 999

const vault = new SSIVault()

export const SyronForm: React.FC<Prop> = ({ startPair }) => {
    const tokensStore = useStore($tokens)

    const [modal0, setModal0] = React.useState(false)
    const [modal1, setModal1] = React.useState(false)
    const [modal3, setModal3] = React.useState(false)
    const [confirmModal, setConfirmModal] = React.useState(false)
    const [vault_pair, setPair] = React.useState<VaultPair[]>(startPair)

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

    return (
        <>
            <SwapSettingsModal show={modal3} onClose={() => setModal3(false)} />
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
                                height="22"
                                width="22"
                            />
                            <div className={styles.titleForm2}>
                                Deposit Bitcoin
                            </div>
                        </div>

                        <VaultInput
                            value={vault_pair[0].value}
                            token={vault_pair[0].meta}
                            disabled={disabled}
                            onSelect={() => setModal0(true)}
                            onInput={handleOnInput}
                            onMax={handleOnInput}
                            onSwap={handleForm}
                        />
                    </div>
                    <div className={styles.contentWrapper2}>
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
                    </div>
                    <div style={{ width: '100%' }}>
                        {Number(amount) !== 0 && (
                            <>
                                <TransactionOutput
                                    amount={amount}
                                    token={vault_pair[1].meta}
                                />

                                {/* {confirmModal ? ( */}

                                <ConfirmBox
                                    show={confirmModal}
                                    pair={vault_pair}
                                    direction={direction}
                                    // onClose={() => {
                                    //     setConfirmModal(false)
                                    // }}
                                />
                                {/* <div className={styles.wrapperSettings}>
                                    <span className={styles.settings}>
                                        settings
                                    </span>
                                    <SwapSettings
                                        onClick={() => setModal3(true)}
                                    />
                                </div> */}
                            </>
                            // ) : null}
                        )}
                    </div>
                </form>
            ) : null}
        </>
    )
}
