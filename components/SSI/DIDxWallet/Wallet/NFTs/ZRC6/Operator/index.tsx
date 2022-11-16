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
import { Donate, SearchBarWallet, Selector } from '../../../../../..'
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
import ContinueArrow from '../../../../../../../src/assets/icons/continue_arrow.svg'
import TickIco from '../../../../../../../src/assets/icons/tick.svg'

function Component({ addrName, type }) {
    const zcrypto = tyron.Util.default.Zcrypto()
    const { getSmartContract } = smartContract()
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const resolvedInfo = useStore($resolvedInfo)
    const donation = useStore($donation)
    const net = useSelector((state: RootState) => state.modal.net)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const [loadingSubmit, setLoadingSubmit] = useState(false)
    const [addr, setAddr] = useState('')
    const [savedAddr, setSavedAddr] = useState(false)
    const [otherRecipient, setOtherRecipient] = useState('')
    const [usernameInput, setUsernameInput] = useState('')
    const [loading, setLoading] = useState(false)

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
        let username = input.toLowerCase()
        let domain = ''
        if (input.includes('@')) {
            username = input
                .split('@')[1]
                .replace('.did', '')
                .replace('.ssi', '')
                .toLowerCase()
            domain = input.split('@')[0]
        } else if (input.includes('.')) {
            if (input.split('.')[1] === 'did') {
                username = input.split('.')[0].toLowerCase()
                domain = 'did'
            } else if (input.split('.')[1] === 'ssi') {
                username = input.split('.')[0].toLowerCase()
            } else {
                throw Error()
            }
        }
        const domainId = '0x' + (await tyron.Util.default.HashString(username))
        await tyron.SearchBarUtil.default
            .fetchAddr(net, domainId, domain)
            .then(async (addr) => {
                addr = zcrypto.toChecksumAddress(addr)
                alert(addr)
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
                tx = await tx.confirm(res.ID)
                if (tx.isConfirmed()) {
                    dispatch(setTxStatusLoading('confirmed'))
                    setTimeout(() => {
                        window.open(
                            `https://v2.viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
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
                            <div
                                className={!savedAddr ? 'continueBtn' : ''}
                                onClick={saveAddr}
                            >
                                {!savedAddr ? (
                                    <Image src={ContinueArrow} alt="arrow" />
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
                            <div onClick={handleSubmit} className="actionBtn">
                                {loadingSubmit ? (
                                    <ThreeDots color="basic" />
                                ) : type === 'add' ? (
                                    'ADD OPERATOR'
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

export default Component
