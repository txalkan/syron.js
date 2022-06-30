import styles from './styles.module.scss'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import * as tyron from 'tyron'
import { useStore } from 'effector-react'
import Image from 'next/image'
import {
    $dashboardState,
    $xpointsBalance,
    updateModalTx,
    updateModalTxMinimized,
    updateNewMotionsModal,
    updateShowZilpay,
    updateXpointsBalance,
} from '../../src/store/modal'
import { $net } from '../../src/store/wallet-network'
import { useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'
import ArrowUp from '../../src/assets/logos/arrow-up.png'
import AddIconYellow from '../../src/assets/icons/add_icon_yellow.svg'
import MinusIcon from '../../src/assets/icons/minus_icon.svg'
import { toast } from 'react-toastify'
import { setTxId, setTxStatusLoading } from '../../src/app/actions'
import { ZilPayBase } from '../ZilPay/zilpay-base'
import { useTranslation } from 'next-i18next'

function Component() {
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const net = useStore($net)
    const xpointsBalance = useStore($xpointsBalance)
    const dashboardState = useStore($dashboardState)
    const [hideAdd, setHideAdd] = useState(true)
    const [loading, setLoading] = useState(true)
    const [amount, setAmount] = useState(0)
    const [addLegend, setAddLegend] = useState('new motion')
    const [selectedId, setSelectedId] = useState('')
    const [readMore, setReadMore] = useState('')
    const [motionData, setMotionData] = useState(Array())
    const loginInfo = useSelector((state: RootState) => state.modal)

    let addr = ''
    if (loginInfo.resolvedUsername) {
        addr = loginInfo.resolvedUsername.addr
    }

    const [xpoints_addr, setAddr] = useState(addr)

    useEffect(() => {
        setLoading(true)
        fetchXpoints()
            .then(() => {
                fetchMotion()
                    .then(() => {
                        setLoading(false)
                    })
                    .catch((error) => {
                        toast.error(String(error), {
                            position: 'top-right',
                            autoClose: 2000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: 'dark',
                        })
                    })
            })
            .catch((error) => {
                toast.error(String(error), {
                    position: 'top-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: 'dark',
                })
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dashboardState])

    const fetchXpoints = async () => {
        updateXpointsBalance(0)
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
                    updateXpointsBalance(balance / 1e12)
                }
            })
            .catch(() => {
                setLoading(false)
                throw new Error('Donate DApp: Not able to fetch balance.')
            })
    }

    const fetchMotion = async () => {
        let network = tyron.DidScheme.NetworkNamespace.Mainnet
        if (net === 'testnet') {
            network = tyron.DidScheme.NetworkNamespace.Testnet
        }
        const init = new tyron.ZilliqaInit.default(network)
        await tyron.SearchBarUtil.default
            .fetchAddr(net, 'xpoints', '')
            .then(async (addr) => {
                setAddr(addr)
                await init.API.blockchain
                    .getSmartContractState(addr)
                    .then(async (state_) => {
                        console.log('res', state_)
                        const data = await tyron.SmartUtil.default.intoMap(
                            state_.result.motions
                        )
                        const data2 = await tyron.SmartUtil.default.intoMap(
                            state_.result.ranking
                        )
                        const motions = Array.from(data.values())
                        const id = Array.from(data.keys())
                        const xp = Array.from(data2.values())
                        let arr: any = []

                        for (let i = 0; i < motions.length; i += 1) {
                            const obj = {
                                id: id[i],
                                motion: motions[i],
                                xp: xp[i],
                            }
                            arr = [obj, ...arr]
                        }

                        var res = arr.sort(
                            (a: { xp: number }, b: { xp: number }) =>
                                b.xp - a.xp
                        )
                        setMotionData(res)
                    })
                    .catch(() => {
                        setLoading(false)
                        throw new Error(
                            t('Error: xPoints DApp: Not able to fetch motions')
                        )
                    })
            })
    }

    const handleSubmit = async () => {
        if (loginInfo.zilAddr !== null) {
            try {
                const zilpay = new ZilPayBase()

                const tx_params = Array()

                const tx_action = {
                    vname: 'action',
                    type: 'String',
                    value: 'add',
                }
                tx_params.push(tx_action)

                let id = await tyron.TyronZil.default.OptionParam(
                    tyron.TyronZil.Option.some,
                    'ByStr32',
                    selectedId
                )
                const tx_id = {
                    vname: 'id',
                    type: 'Option ByStr32',
                    value: id,
                }
                tx_params.push(tx_id)

                let motion_ = await tyron.TyronZil.default.OptionParam(
                    tyron.TyronZil.Option.none,
                    'String'
                )
                const tx_motion = {
                    vname: 'motion',
                    type: 'Option String',
                    value: motion_,
                }
                tx_params.push(tx_motion)

                const tx_amount = {
                    vname: 'amount',
                    type: 'Uint128',
                    value: String(Number(amount) * 1e12),
                }
                tx_params.push(tx_amount)

                dispatch(setTxStatusLoading('true'))
                updateModalTxMinimized(false)
                updateModalTx(true)
                let tx = await tyron.Init.default.transaction(net)

                await zilpay
                    .call({
                        contractAddress: xpoints_addr,
                        transition: 'RaiseYourVoice',
                        params: tx_params as unknown as Record<
                            string,
                            unknown
                        >[],
                        amount: String(0),
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
                toastId: 13,
            })
        }
    }

    const handleChange = (e: { target: { value: any } }) => {
        let value = e.target.value
        if (isNaN(value)) {
            toast.error('Please input a valid number.', {
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
            if (Number(value) > xpointsBalance!) {
                toast.error('Not enough xPoints.', {
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
                setAmount(value)
            }
        }
    }

    const vote = (id: React.SetStateAction<string>) => {
        if (id === selectedId) {
            setSelectedId('')
        } else {
            setSelectedId(id)
        }
    }

    const showNewMotion = () => {
        if (dashboardState !== null) {
            updateShowZilpay(false)
            updateNewMotionsModal(true)
        } else {
            updateShowZilpay(true)
        }
    }

    return (
        <div style={{ textAlign: 'center', marginTop: '7%' }}>
            {loading ? (
                <i
                    style={{ color: '#ffff32' }}
                    className="fa fa-lg fa-spin fa-circle-notch"
                    aria-hidden="true"
                ></i>
            ) : (
                <>
                    <h1 style={{ marginBottom: '10%', color: '#ffff32' }}>
                        <span className={styles.x}>x</span>POINTS DApp
                    </h1>
                    {
                        <div style={{ marginTop: '14%' }}>
                            <h3 style={{ marginBottom: '7%', color: 'silver' }}>
                                {t('RAISE YOUR VOICE')}
                            </h3>
                            <div style={{ marginTop: '14%' }}>
                                {hideAdd ? (
                                    <button
                                        type="button"
                                        className={styles.button}
                                        onClick={showNewMotion}
                                    >
                                        <p className={styles.buttonText}>
                                            {addLegend}
                                        </p>
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            className={styles.button}
                                            onClick={() => {
                                                setHideAdd(true)
                                                setAddLegend('new motion')
                                            }}
                                        >
                                            <p className={styles.buttonText}>
                                                {t(addLegend.toUpperCase())}
                                            </p>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    }
                    {hideAdd && (
                        <>
                            <div className={styles.wrapperMotion}>
                                {motionData.map((val, i) => (
                                    <div key={i} className={styles.motion}>
                                        <div className={styles.motionContent}>
                                            <div
                                                className={
                                                    styles.wrapperArrowUp
                                                }
                                            >
                                                <div
                                                    onClick={() => vote(val.id)}
                                                    style={{
                                                        cursor: 'pointer',
                                                        width: '35px',
                                                        height: '35px',
                                                    }}
                                                >
                                                    <Image
                                                        alt="arrow"
                                                        src={ArrowUp}
                                                        width={35}
                                                        height={35}
                                                    />
                                                </div>
                                                <div
                                                    style={{
                                                        marginTop: '10px',
                                                    }}
                                                >
                                                    {Number(val.xp) / 1e12}
                                                </div>
                                            </div>
                                            {val.id === readMore ? (
                                                <div
                                                    className={
                                                        styles.motionTxtWrapper
                                                    }
                                                >
                                                    {val.motion}{' '}
                                                    <span
                                                        onClick={() =>
                                                            setReadMore('')
                                                        }
                                                        style={{
                                                            cursor: 'pointer',
                                                            width: 'fit-content',
                                                        }}
                                                    >
                                                        <Image
                                                            src={MinusIcon}
                                                            alt="add-ico"
                                                        />
                                                    </span>
                                                </div>
                                            ) : val.motion.length > 100 ? (
                                                <div
                                                    className={
                                                        styles.motionTxtWrapper
                                                    }
                                                >
                                                    {val.motion.slice(0, 100)}
                                                    ...
                                                    <span
                                                        onClick={() =>
                                                            setReadMore(val.id)
                                                        }
                                                        style={{
                                                            cursor: 'pointer',
                                                            width: 'fit-content',
                                                        }}
                                                    >
                                                        <Image
                                                            src={AddIconYellow}
                                                            alt="add-ico"
                                                        />
                                                    </span>
                                                </div>
                                            ) : (
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                    }}
                                                    className={
                                                        styles.motionTxtWrapper
                                                    }
                                                >
                                                    {val.motion}
                                                </div>
                                            )}
                                        </div>
                                        {selectedId === val.id && (
                                            <div
                                                className={styles.inputWrapper}
                                            >
                                                <div
                                                    style={{ fontSize: '10px' }}
                                                >
                                                    ADD{' '}
                                                    <span
                                                        style={{
                                                            textTransform:
                                                                'lowercase',
                                                        }}
                                                    >
                                                        x
                                                    </span>
                                                    POINTS
                                                </div>
                                                <input
                                                    style={{
                                                        marginLeft: '3%',
                                                    }}
                                                    type="text"
                                                    placeholder={t(
                                                        'Type amount'
                                                    )}
                                                    onChange={handleChange}
                                                    autoFocus
                                                />
                                                <input
                                                    style={{ marginLeft: '2%' }}
                                                    type="button"
                                                    className={
                                                        'button secondary'
                                                    }
                                                    value={t('ADD')}
                                                    onClick={() => {
                                                        handleSubmit()
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    )
}

export default Component
