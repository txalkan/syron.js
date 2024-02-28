import styles from './index.module.scss'
import Big from 'big.js'
import React, { useState, useEffect } from 'react'
import { useStore } from 'react-stores'
import { SwapSettings } from './settings'
import { VaultInput } from './input'
import { TokenInput } from './token'
import { VaultOutput } from './vault-output'
import { $tokens } from '../../src/store/tokens'
import { $liquidity } from '../../src/store/shares'
import { VaultPair } from '../../src/types/vault'
import { TokensModal } from '../Modals/tokens'
import { TokenBalance, TokenState } from '../../src/types/token'
import { SwapSettingsModal } from '../Modals/settings'
import icoReceive from '../../src/assets/icons/ssi_icon_receive.svg'
import icoSend from '../../src/assets/icons/ssi_icon_send.svg'
import Image from 'next/image'
import { TokensMixine } from '../../src/mixins/token'
import { Blockchain } from '../../src/mixins/custom-fetch'
import { SSIVault } from '../../src/mixins/vault'
import { $bitcoin_addresses } from '../../src/store/bitcoin-addresses'
import { ConfirmVaultModal } from '../Modals/confirm-vault'

type Prop = {
    startPair: VaultPair[]
}

Big.PE = 999

const vault = new SSIVault()

export const SyronForm: React.FC<Prop> = ({ startPair }) => {
    const tokensStore = useStore($tokens)
    const wallet = useStore($bitcoin_addresses)

    const liquidity = useStore($liquidity)
    // const network = useStore($net)

    const [modal0, setModal0] = React.useState(false)
    const [modal1, setModal1] = React.useState(false)
    const [modal3, setModal3] = React.useState(false)
    const [confirmModal, setConfirmModal] = React.useState(false)
    const [vault_pair, setPair] = React.useState<VaultPair[]>(startPair)

    const cero = Big(0)
    const [amount, setAmount] = React.useState(cero)

    const [balances, setGetBalances] = useState(['0', '0'])
    useEffect(() => {
        console.log('Vault_Pair', JSON.stringify(startPair, null, 2))

        setGetBalances(['0', '0'])
        async function readBalances() {
            try {
                let balance0 = '0'
                let balance1 = '0'
                if (!wallet) {
                    return [balance0, balance1]
                }
                const found0 = tokensStore.tokens.find(
                    (t) => t.meta.symbol === vault_pair[0].meta.symbol
                )
                const found1 = tokensStore.tokens.find(
                    (t) => t.meta.symbol === vault_pair[1].meta.symbol
                )

                if (found0 && found1) {
                }
                const bal = [balance0, balance1]
                console.log('BALANCES: ', JSON.stringify(bal, null, 2))

                setGetBalances(bal)
            } catch (error) {
                console.error('effect:', error)
            }
        }

        readBalances()
    }, [vault_pair, tokensStore, wallet])

    const direction = React.useMemo(() => {
        return vault.getVaultDirection(vault_pair)
    }, [vault_pair])

    const handleForm = React.useCallback(() => {
        setPair(JSON.parse(JSON.stringify(vault_pair.reverse())))

        //@ssibrowser
        const unLinkedPair = JSON.parse(JSON.stringify(vault_pair))

        unLinkedPair[0].value = String(0)
        unLinkedPair[1].value = String(0)
        setPair(unLinkedPair)
        setAmount(0)
    }, [vault_pair])

    const handleSubmit = React.useCallback(
        (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            setConfirmModal(true)
        },
        []
    )

    const handleOnInput = React.useCallback(
        (value: string | Big) => {
            try {
                setConfirmModal(false)
                const unLinkedPair = JSON.parse(JSON.stringify(vault_pair))
                unLinkedPair[0].value = String(value)
                // unLinkedPair[1].value = dex.getRealPrice(unLinkedPair)
                //setPair(unLinkedPair)
                //@ssibrowser
                const amount = vault.computeSU$D(unLinkedPair)
                unLinkedPair[1].value = '11'

                setPair(unLinkedPair)
                setAmount(Big(amount))
            } catch (error) {
                console.error(error)
            }
        },
        [vault_pair]
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

            setAmount(cero)
        },
        [vault_pair]
    )

    //@mainnet-dex
    const onDexSwap = () => {
        const update_pair = JSON.parse(JSON.stringify(vault_pair))

        update_pair[1].value = amount.amount

        setPair(update_pair)
        setConfirmModal(true)
    }

    React.useEffect(() => {
        if (Number(vault_pair[0].value) > 0) {
            handleOnInput(vault_pair[0].value)
        }
    }, [liquidity, tokensStore])

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
                                alt="swap-icon"
                                height="22"
                                width="22"
                            />
                            <div className={styles.titleForm2}>Deposit</div>
                        </div>
                        <VaultInput
                            value={Big(vault_pair[0].value)}
                            token={vault_pair[0].meta}
                            balance={balances[0]}
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
                                alt="swap-icon"
                                height="22"
                                width="22"
                            />
                            <div className={styles.titleForm2}>To get</div>
                        </div>
                        <TokenInput
                            token={vault_pair[1].meta}
                            onSelect={() => setModal1(true)}
                        />
                    </div>
                    <div style={{ width: '100%' }}>
                        {
                            // showDex}
                            vault_pair[1].value !== '0' && (
                                <VaultOutput
                                    amount={amount}
                                    token={vault_pair[1].meta}
                                />
                            )
                        }
                        {confirmModal ? (
                            <>
                                <ConfirmVaultModal
                                    show={confirmModal}
                                    pair={vault_pair}
                                    direction={direction}
                                    onClose={() => {
                                        setConfirmModal(false)
                                    }}
                                />
                                <div className={styles.wrapperSettings}>
                                    <span className={styles.settings}>
                                        settings
                                    </span>
                                    <SwapSettings
                                        onClick={() => setModal3(true)}
                                    />
                                </div>
                            </>
                        ) : null}
                    </div>
                </form>
            ) : null}
        </>
    )
}
