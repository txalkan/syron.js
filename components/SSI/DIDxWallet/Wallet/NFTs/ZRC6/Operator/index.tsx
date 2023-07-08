import React, { useEffect, useState } from 'react'
import * as tyron from 'tyron'
import Image from 'next/image'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { useStore } from 'effector-react'
import { $resolvedInfo } from '../../../../../../../src/store/resolvedInfo'
import { useTranslation } from 'next-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../../../../../src/app/reducers'
import ThreeDots from '../../../../../../Spinner/ThreeDots'
import {
    $donation,
    updateDonation,
} from '../../../../../../../src/store/donation'
import {
    Arrow,
    Donate,
    SearchBarWallet,
    Selector,
    Spinner,
} from '../../../../../..'
import { ZilPayBase } from '../../../../../../ZilPay/zilpay-base'
import {
    setTxId,
    setTxStatusLoading,
} from '../../../../../../../src/app/actions'
import {
    updateModalTx,
    updateModalTxMinimized,
} from '../../../../../../../src/store/modal'
import smartContract from '../../../../../../../src/utils/smartContract'
import { toast } from 'react-toastify'
import toastTheme from '../../../../../../../src/hooks/toastTheme'
import TickIco from '../../../../../../../src/assets/icons/tick.svg'
import trash_red from '../../../../../../../src/assets/icons/trash_red.svg'
import l_trash from '../../../../../../../src/assets/icons/trash.svg'
import d_trash from '../../../../../../../src/assets/icons/trash_dark.svg'
import { $net } from '../../../../../../../src/store/network'

function Component({ addrName, type }) {
    const net = $net.state.net as 'mainnet' | 'testnet'

    const zcrypto = tyron.Util.default.Zcrypto()
    const { getSmartContract } = smartContract()
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const resolvedInfo = useStore($resolvedInfo)
    const donation = useStore($donation)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const trash = isLight ? d_trash : l_trash
    const [loadingSubmit, setLoadingSubmit] = useState(false)
    const [loadingOperator, setLoadingOperator] = useState(true)
    const [addr, setAddr] = useState('')
    const [savedAddr, setSavedAddr] = useState(false)
    const [otherRecipient, setOtherRecipient] = useState('')
    const [usernameInput, setUsernameInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [operators, setOperators] = useState(Array())

    const toggleSelectedOperator = (val) => {
        updateDonation(null)
        if (val == addr) {
            setAddr('')
        } else {
            setAddr(val)
        }
    }

    const handleInputAdddr = (event: { target: { value: any } }) => {
        setSavedAddr(false)
        setAddr(event.target.value)
    }

    const saveAddr = () => {
        const addr_ = tyron.Address.default.verification(addr)
        if (addr_ !== '') {
            setAddr(addr)
            setSavedAddr(true)
        } else {
            toast.error(t('Wrong address.'), {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 5,
            })
        }
    }

    const handleOnKeyPressAddr = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            saveAddr()
        }
    }

    const onChangeTypeOther = (value: string) => {
        updateDonation(null)
        setAddr('')
        setSavedAddr(false)
        setOtherRecipient(value)
    }

    const handleInput = ({
        currentTarget: { value },
    }: React.ChangeEvent<HTMLInputElement>) => {
        updateDonation(null)
        setSavedAddr(false)
        setAddr('')
        setUsernameInput(value)
    }

    const resolveUsername = async () => {
        setLoading(true)
        const input = usernameInput.replace(/ /g, '')
        let domain = input.toLowerCase()
        let tld = ''
        let subdomain = ''
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

        let _subdomain
        if (subdomain && subdomain !== '') {
            _subdomain = subdomain
        }
        await tyron.SearchBarUtil.default
            .fetchAddr(net, tld, domain, _subdomain)
            .then(async (addr) => {
                addr = zcrypto.toChecksumAddress(addr)
                setAddr(addr)
                setSavedAddr(true)
            })
            .catch(() => {
                toast.error('Identity verification unsuccessful.', {
                    position: 'top-right',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                })
            })
        setLoading(false)
    }

    const fetchOperator = async () => {
        setLoadingOperator(true)
        try {
            const init_addr = await tyron.SearchBarUtil.default.fetchAddr(
                net,
                'did',
                'init'
            )
            const get_services = await getSmartContract(init_addr, 'services')
            const services = await tyron.SmartUtil.default.intoMap(
                get_services!.result.services
            )
            const tokenAddr = services.get(addrName)
            const get_operators = await getSmartContract(tokenAddr, 'operators')
            const operators = await tyron.SmartUtil.default.intoMap(
                get_operators!.result.operators
            )
            const operators_ = operators.get(resolvedInfo?.addr?.toLowerCase()!)
            const operators__ = Object.keys(operators_)
            setOperators(operators__)
        } catch {
            setOperators([])
        }
        setLoadingOperator(false)
    }

    const handleSubmit = async () => {
        setLoadingSubmit(true)
        const zilpay = new ZilPayBase()
        let tx = await tyron.Init.default.transaction(net)
        let params: any = []
        const addrName_ = {
            vname: 'addrName',
            type: 'String',
            value: addrName,
        }
        params.push(addrName_)
        const operator_ = {
            vname: 'operator',
            type: 'ByStr20',
            value: addr,
        }
        params.push(operator_)
        const donation_ = await tyron.Donation.default.tyron(donation!)
        const tyron_ = {
            vname: 'tyron',
            type: 'Option Uint128',
            value: donation_,
        }
        params.push(tyron_)

        setLoadingSubmit(false)
        dispatch(setTxStatusLoading('true'))
        updateModalTxMinimized(false)
        updateModalTx(true)
        await zilpay
            .call({
                contractAddress: resolvedInfo?.addr!,
                transition:
                    type === 'add' ? 'ZRC6_AddOperator' : 'ZRC6_RemoveOperator',
                params: params as unknown as Record<string, unknown>[],
                amount: String(donation),
            })
            .then(async (res) => {
                dispatch(setTxId(res.ID))
                dispatch(setTxStatusLoading('submitted'))
                tx = await tx.confirm(res.ID, 33)
                if (tx.isConfirmed()) {
                    dispatch(setTxStatusLoading('confirmed'))
                    setTimeout(() => {
                        window.open(
                            `https://viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                        )
                    }, 1000)
                } else if (tx.isRejected()) {
                    dispatch(setTxStatusLoading('failed'))
                }
            })
            .catch((err) => {
                dispatch(setTxStatusLoading('rejected'))
                updateModalTxMinimized(false)
                updateModalTx(true)
                throw err
            })
    }

    const optionTypeOtherAddr = [
        {
            value: 'address',
            label: 'Type Address',
        },
        {
            value: 'nft',
            label: 'NFT Domain Name',
        },
    ]

    useEffect(() => {
        if (type !== 'add') {
            fetchOperator()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (type === 'add') {
        return (
            <>
                <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                    <Selector
                        option={optionTypeOtherAddr}
                        onChange={onChangeTypeOther}
                        placeholder="Select Type"
                    />
                </div>
                {otherRecipient === 'address' ? (
                    <div
                        style={{
                            marginTop: '16px',
                        }}
                    >
                        <div className={styles.txt}>Input Address</div>
                        <div className={styles.containerInput}>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder={t('Type address')}
                                onChange={handleInputAdddr}
                                onKeyPress={handleOnKeyPressAddr}
                            />
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                }}
                            >
                                <div onClick={saveAddr}>
                                    {!savedAddr ? (
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
                    </div>
                ) : otherRecipient === 'nft' ? (
                    <SearchBarWallet
                        resolveUsername={resolveUsername}
                        handleInput={handleInput}
                        input={usernameInput}
                        loading={loading}
                        saved={savedAddr}
                    />
                ) : (
                    <></>
                )}
                {savedAddr && (
                    <>
                        <Donate />
                        {donation !== null && (
                            <div
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                }}
                            >
                                <div
                                    onClick={handleSubmit}
                                    className="actionBtn"
                                >
                                    {loadingSubmit ? (
                                        <ThreeDots color="basic" />
                                    ) : (
                                        'ADD OPERATOR'
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </>
        )
    } else {
        return (
            <>
                {loadingOperator ? (
                    <div
                        style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <Spinner />
                    </div>
                ) : (
                    <>
                        {operators.length > 0 ? (
                            <>
                                {operators.map((val, i) => (
                                    <div
                                        key={i}
                                        className={styles.operatorWrapper}
                                    >
                                        <div
                                            onClick={() =>
                                                toggleSelectedOperator(val)
                                            }
                                            className={styles.trashIco}
                                        >
                                            <Image
                                                src={
                                                    val === addr
                                                        ? trash_red
                                                        : trash
                                                }
                                                alt="ico-delete"
                                            />
                                        </div>
                                        <div className={styles.txtOperator}>
                                            {val.slice(0, 7)}...{val.slice(-7)}
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div>
                                This xWALLET doesn&apos;t have any operators.
                            </div>
                        )}
                    </>
                )}
                {addr !== '' && (
                    <>
                        <Donate />
                        {donation !== null && (
                            <div
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                }}
                            >
                                <div
                                    onClick={handleSubmit}
                                    className={
                                        isLight ? 'actionBtnLight' : 'actionBtn'
                                    }
                                >
                                    {loadingSubmit ? (
                                        <ThreeDots color="black" />
                                    ) : (
                                        'REMOVE OPERATOR'
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </>
        )
    }
}

export default Component
