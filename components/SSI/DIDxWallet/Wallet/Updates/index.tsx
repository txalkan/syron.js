import React, { useEffect, useRef, useState } from 'react'
import { useStore } from 'effector-react'
import { toast } from 'react-toastify'
import * as tyron from 'tyron'
import { useDispatch, useSelector } from 'react-redux'
import { $net } from '../../../../../src/store/wallet-network'
import {
    updateModalTx,
    updateModalTxMinimized,
} from '../../../../../src/store/modal'
import { ZilPayBase } from '../../../../ZilPay/zilpay-base'
import styles from './styles.module.scss'
import { setTxId, setTxStatusLoading } from '../../../../../src/app/actions'
import controller from '../../../../../src/hooks/isController'
import { Donate } from '../../../../index'
import { $donation, updateDonation } from '../../../../../src/store/donation'
import { RootState } from '../../../../../src/app/reducers'

function Component() {
    const dispatch = useDispatch()
    const refInput = useRef(null)
    const contract = useSelector((state: RootState) => state.modal.contract)
    const net = useStore($net)
    const { isController } = controller()
    const donation = useStore($donation)

    const [menu, setMenu] = useState('')
    const [input, setInput] = useState('')

    function handleFocus() {
        if (refInput !== null && refInput.current !== null) {
            const si = refInput.current as any
            si.focus()
        }
    }

    useEffect(() => {
        isController()
        handleFocus()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const submitUpdate = async () => {
        if (contract !== null && donation !== null) {
            try {
                const zilpay = new ZilPayBase()

                const tyron_ = await tyron.Donation.default.tyron(donation)

                let params = Array()
                let transition: string
                switch (menu) {
                    case 'username':
                        transition = 'UpdateUsername'
                        const username_ = {
                            vname: 'username',
                            type: 'String',
                            value: input,
                        }
                        params.push(username_)
                        break
                    case 'deadline':
                        transition = 'UpdateDeadline'
                        const val_ = {
                            vname: 'val',
                            type: 'Uint128',
                            value: input,
                        }
                        params.push(val_)
                        break
                    default:
                        transition = 'UpdateController'
                        const addr_ = {
                            vname: 'addr',
                            type: 'ByStr20',
                            value: input,
                        }
                        params.push(addr_)
                        break
                }

                const tyron__ = {
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
                        contractAddress: contract.addr,
                        transition: transition,
                        params: params as unknown as Record<string, unknown>[],
                        amount: String(donation),
                    })
                    .then(async (res) => {
                        dispatch(setTxId(res.ID))
                        dispatch(setTxStatusLoading('submitted'))
                        tx = await tx.confirm(res.ID)
                        if (tx.isConfirmed()) {
                            dispatch(setTxStatusLoading('confirmed'))
                            window.open(
                                `https://devex.zilliqa.com/tx/${
                                    res.ID
                                }?network=https%3A%2F%2F${
                                    net === 'mainnet' ? '' : 'dev-'
                                }api.zilliqa.com`
                            )
                        } else if (tx.isRejected()) {
                            dispatch(setTxStatusLoading('failed'))
                            setTimeout(() => {
                                toast.error('Transaction failed.', {
                                    position: 'top-right',
                                    autoClose: 3000,
                                    hideProgressBar: false,
                                    closeOnClick: true,
                                    pauseOnHover: true,
                                    draggable: true,
                                    progress: undefined,
                                    theme: 'dark',
                                })
                            }, 1000)
                        }
                    })
            } catch (error) {
                dispatch(setTxStatusLoading('rejected'))
                toast.error(String(error), {
                    position: 'top-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: 'dark',
                    toastId: 12,
                })
            }
        } else {
            toast.error('some data is missing.', {
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
        updateDonation(null)
    }

    const handleInput = (event: { target: { value: any; name: any } }) => {
        setInput('')
        updateDonation(null)

        let input = event.target.value

        if (menu === 'controller') {
            const addr = tyron.Address.default.verification(input)
            if (addr !== '') {
                setInput(addr)
            } else {
                toast.error('Wrong address.', {
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
        } else if (menu === 'username') {
            setInput(input)
        } else if (menu === 'deadline') {
            input = Number(input)
            if (isNaN(input)) {
                toast.error('The input is not a number.', {
                    position: 'top-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: 'dark',
                    toastId: 1,
                })
            } else {
                setInput(String(input))
            }
        }
    }

    return (
        <div
            style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'center',
                alignItems: 'center',
            }}
        >
            {menu === '' && (
                <>
                    <h2>
                        <div
                            onClick={() => setMenu('controller')}
                            className={styles.flipCard}
                        >
                            <div className={styles.flipCardInner}>
                                <div className={styles.flipCardFront}>
                                    <p className={styles.cardTitle3}>
                                        CONTROLLER
                                    </p>
                                </div>
                                <div className={styles.flipCardBack}>
                                    <p className={styles.cardTitle2}>
                                        change the address of the did controller
                                    </p>
                                </div>
                            </div>
                        </div>
                    </h2>
                    <h2>
                        <div
                            onClick={() => setMenu('username')}
                            className={styles.flipCard}
                        >
                            <div className={styles.flipCardInner}>
                                <div className={styles.flipCardFront}>
                                    <p className={styles.cardTitle3}>
                                        USERNAME
                                    </p>
                                </div>
                                <div className={styles.flipCardBack}>
                                    <p className={styles.cardTitle2}>
                                        update the public name of your SSI
                                    </p>
                                </div>
                            </div>
                        </div>
                    </h2>
                    <h2>
                        <div
                            onClick={() => setMenu('deadline')}
                            className={styles.flipCard}
                        >
                            <div className={styles.flipCardInner}>
                                <div className={styles.flipCardFront}>
                                    <p className={styles.cardTitle3}>
                                        DEADLINE
                                    </p>
                                </div>
                                <div className={styles.flipCardBack}>
                                    <p className={styles.cardTitle2}>
                                        Update the maximum amount of blocks that
                                        your SSI is willing to wait for a
                                        transaction to get confirmed
                                    </p>
                                </div>
                            </div>
                        </div>
                    </h2>
                </>
            )}
            {menu !== '' && (
                <button
                    onClick={() => {
                        setMenu('')
                        setInput('')
                    }}
                    style={{ marginBottom: '10%' }}
                    className="button"
                >
                    <span>back</span>
                </button>
            )}
            {menu === 'controller' && (
                <>
                    <h3>Update DID Controller</h3>
                    <p>New DID Controller address:</p>
                    <div style={{ display: 'flex' }}>
                        <input
                            ref={refInput}
                            name="controller"
                            style={{
                                width: '100%',
                                marginLeft: '2%',
                                marginRight: '2%',
                                marginTop: '14%',
                            }}
                            type="text"
                            onChange={handleInput}
                            placeholder="Type address"
                            autoFocus
                        />
                    </div>
                    {input !== '' && <Donate />}
                    {input !== '' && donation !== null && (
                        <button
                            onClick={submitUpdate}
                            className="button secondary"
                        >
                            <span>Update DID Controller</span>
                        </button>
                    )}
                </>
            )}
            {menu === 'username' && (
                <>
                    <h3>Update SSI Username</h3>
                    <p>
                        This username is a public name that other dApps can use
                        to verify data about your SSI.
                    </p>
                    <p>
                        Only the owner of the NFT Username is allowed to confirm
                        this update by calling the Accept Pending Username
                        transaction.
                    </p>
                    <div style={{ display: 'flex' }}>
                        <input
                            ref={refInput}
                            name="username"
                            style={{
                                width: '100%',
                                marginLeft: '2%',
                                marginRight: '2%',
                                marginTop: '14%',
                            }}
                            type="text"
                            onChange={handleInput}
                            placeholder="Type username"
                            autoFocus
                        />
                    </div>
                    {input !== '' && <Donate />}
                    {input !== '' && donation !== null && (
                        <button
                            onClick={submitUpdate}
                            className="button secondary"
                        >
                            <span>Update SSI Username</span>
                        </button>
                    )}
                </>
            )}
            {menu === 'deadline' && (
                <>
                    <h3>Update deadline</h3>
                    <p>
                        The deadline is the number of blocks you are willing to
                        wait for a transaction to get processed on the
                        blockchain (each block is approximately 2min).
                    </p>
                    <h4>Type the number of blocks:</h4>
                    <div style={{ display: 'flex' }}>
                        <input
                            ref={refInput}
                            name="deadline"
                            style={{
                                width: '100%',
                                marginLeft: '2%',
                                marginRight: '2%',
                                marginTop: '14%',
                            }}
                            type="text"
                            onChange={handleInput}
                            placeholder="Type number"
                            autoFocus
                        />
                    </div>
                    {input !== '' && input !== '0' && <Donate />}
                    {input !== '' && input !== '0' && donation !== null && (
                        <button
                            onClick={submitUpdate}
                            className="button secondary"
                        >
                            <span>Update Deadline</span>
                        </button>
                    )}
                </>
            )}
        </div>
    )
}

export default Component
