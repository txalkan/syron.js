import React, { useState, useCallback } from 'react'
import * as tyron from 'tyron'
import { toast } from 'react-toastify'
import { $donation, updateDonation } from '../../src/store/donation'
import { useStore } from 'effector-react'
import { $net } from '../../src/store/wallet-network'
import { useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'

function Component() {
    const callbackRef = useCallback((inputElement) => {
        if (inputElement) {
            inputElement.focus()
        }
    }, [])

    const donation = $donation.getState()
    let donation_: string | undefined

    let legend_ = 'continue'
    let button_ = 'button primary'

    if (donation === null) {
        donation_ = 'ZIL amount'
    } else {
        donation_ = String(donation) + ' ZIL'
        legend_ = 'saved'
        button_ = 'button'
    }

    const [legend, setLegend] = useState(`${legend_}`)
    const [button, setButton] = useState(`${button_}`)
    const net = useStore($net)
    const loginInfo = useSelector((state: RootState) => state.modal)

    const handleSave = async () => {
        setLegend('saved')
        setButton('button')
    }

    const [input, setInput] = useState(0) // donation amount
    const handleInput = (event: { target: { value: any } }) => {
        updateDonation(null)
        setLegend('continue')
        setButton('button primary')
        let input = event.target.value
        const re = /,/gi
        input = input.replace(re, '.')
        input = Number(input)
        setInput(input)
        if (isNaN(input)) {
            input = 0
        }
        setInput(input)
    }
    const handleOnKeyPress = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            handleSubmit()
        }
    }

    const handleSubmit = async () => {
        handleSave()
        updateDonation(input)
        const donation = $donation.getState()
        if (input !== 0) {
            try {
                let network = tyron.DidScheme.NetworkNamespace.Mainnet
                if (net === 'testnet') {
                    network = tyron.DidScheme.NetworkNamespace.Testnet
                }
                const init = new tyron.ZilliqaInit.default(network)
                await tyron.SearchBarUtil.default
                    .fetchAddr(net, 'donate', '')
                    .then(async (donate_addr) => {
                        return await init.API.blockchain.getSmartContractSubState(
                            donate_addr,
                            'xpoints'
                        )
                    })
                    .then(async (balances) => {
                        return await tyron.SmartUtil.default.intoMap(
                            balances.result.xpoints
                        )
                    })
                    .then((balances_) => {
                        // Get balance of the logged in address
                        const balance = balances_.get(
                            loginInfo.zilAddr?.base16.toLowerCase()
                        )
                        if (balance !== undefined) {
                            toast.info(
                                `Thank you! You are getting ${donation} xPoints. Current balance: ${balance / 1e12
                                } xPoints`,
                                {
                                    position: 'bottom-center',
                                    autoClose: 4000,
                                    hideProgressBar: false,
                                    closeOnClick: true,
                                    pauseOnHover: true,
                                    draggable: true,
                                    progress: undefined,
                                    theme: 'dark',
                                }
                            )
                        }
                    })
                    .catch(() => {
                        throw new Error(
                            'Donate DApp: Not able to fetch balance.'
                        )
                    })
            } catch (error) {
                toast.warning(String(error), {
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
        } else {
            toast.info('Donating 0 ZIL => 0 xPoints', {
                position: 'bottom-center',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
            })
        }
    }

    return (
        <div style={{ marginTop: '12%', marginBottom: '12%', width: '100%' }}>
            <p>
                How much would you like to send to the{' '}
                <a
                    href="https://www.notion.so/ssiprotocol/TYRON-a-Network-for-Self-Sovereign-Identities-7bddd99a648c4849bbf270ce86c48dac#29c0e576a78b455fb23e4dcdb4107032"
                    rel="noreferrer"
                    target="_blank"
                >
                    Donate DApp
                </a>
                ?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                        ref={callbackRef}
                        style={{ width: '50%' }}
                        type="text"
                        placeholder={donation_}
                        onChange={handleInput}
                        onKeyPress={handleOnKeyPress}
                        autoFocus
                    />
                    <code style={{ marginLeft: '5%' }}>= {input} xP</code>
                </div>
                <div>
                    <input
                        type="button"
                        className={button}
                        value={legend}
                        onClick={() => {
                            handleSubmit()
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

export default Component
