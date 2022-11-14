import React, { useEffect, useState } from 'react'
import * as tyron from 'tyron'
import Image from 'next/image'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { useStore } from 'effector-react'
import { $resolvedInfo } from '../../../../../../src/store/resolvedInfo'
import { useTranslation } from 'next-i18next'
import routerHook from '../../../../../../src/hooks/router'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../../../../src/app/reducers'
import ThreeDots from '../../../../../Spinner/ThreeDots'
import { $donation, updateDonation } from '../../../../../../src/store/donation'
import CloseIcoReg from '../../../../../../src/assets/icons/ic_cross.svg'
import CloseIcoBlack from '../../../../../../src/assets/icons/ic_cross_black.svg'
import { toast } from 'react-toastify'
import toastTheme from '../../../../../../src/hooks/toastTheme'
import ContinueArrow from '../../../../../../src/assets/icons/continue_arrow.svg'
import TickIco from '../../../../../../src/assets/icons/tick.svg'
import Selector from '../../../../../Selector'
import { Donate, SearchBarWallet } from '../../../../..'
import { ZilPayBase } from '../../../../../ZilPay/zilpay-base'
import { setTxId, setTxStatusLoading } from '../../../../../../src/app/actions'
import {
    updateModalTx,
    updateModalTxMinimized,
} from '../../../../../../src/store/modal'
import smartContract from '../../../../../../src/utils/smartContract'

function Component() {
    const zcrypto = tyron.Util.default.Zcrypto()
    const { getSmartContract } = smartContract()
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const resolvedInfo = useStore($resolvedInfo)
    const donation = useStore($donation)
    const net = useSelector((state: RootState) => state.modal.net)
    const username = resolvedInfo?.name
    const domain = resolvedInfo?.domain
    const domainNavigate = domain !== '' ? domain + '@' : ''
    const { navigate } = routerHook()
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const CloseIco = isLight ? CloseIcoBlack : CloseIcoReg
    const styles = isLight ? stylesLight : stylesDark
    const [txName, setTxName] = useState('')
    const [addrName, setAddrName] = useState('')
    const [addr, setAddr] = useState('')
    const [savedAddr, setSavedAddr] = useState(false)
    const [recipient, setRecipient] = useState('')
    const [otherRecipient, setOtherRecipient] = useState('')
    const [loading, setLoading] = useState(false)
    const [usernameInput, setUsernameInput] = useState('')

    const handleChangeAddr = (value: string) => {
        updateDonation(null)
        setRecipient('')
        setOtherRecipient('')
        setAddr('')
        setSavedAddr(false)
        setUsernameInput('')
        setAddrName(value)
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

    const toggleActive = (id: string) => {
        updateDonation(null)
        //resetState()
        if (id === txName) {
            setTxName('')
        } else {
            setTxName(id)
        }
    }

    const onChangeRecipient = (value: string) => {
        updateDonation(null)
        setAddr('')
        setSavedAddr(false)
        setRecipient(value)
    }

    const onChangeTypeOther = (value: string) => {
        updateDonation(null)
        setAddr('')
        setSavedAddr(false)
        setOtherRecipient(value)
    }

    const fetchTydra = async () => {
        try {
            const init_addr = await tyron.SearchBarUtil.default.fetchAddr(
                net,
                'init',
                'did'
            )
            const get_tokenuri = await getSmartContract(init_addr, 'token_uris')
            const token_uris = await tyron.SmartUtil.default.intoMap(
                get_tokenuri.result.token_uris
            )
            const arr = Array.from(token_uris.values())
            const domainId =
                '0x' +
                (await tyron.Util.default.HashString(resolvedInfo?.name!))
            const tokenUri = arr[0][domainId]
            return tokenUri
        } catch (err) {
            throw new Error()
        }
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
        const init_addr = await tyron.SearchBarUtil.default.fetchAddr(
            net,
            'init',
            'did'
        )
        const get_services = await getSmartContract(init_addr, 'ddk10')
        const services = await tyron.SmartUtil.default.intoMap(
            get_services.result.services
        )
        // const amount = services.get('ddk10')
        console.log(services)
        // const get_premiumprice = await getSmartContract(init_addr, 'premium_price')
        // console.log('@', get_premiumprice)
        // const zilpay = new ZilPayBase()
        // let tx = await tyron.Init.default.transaction(net)
        // let tokenUri = null
        // try {
        //     tokenUri = await fetchTydra()
        // } catch (err) {
        //     throw new Error()
        // }
        // let params: any = []
        // const addrName_ = {
        //     vname: 'addrName',
        //     type: 'String',
        //     value: addrName,
        // }
        // params.push(addrName_)
        // const recipient_ = {
        //     vname: 'recipient',
        //     type: 'ByStr20',
        //     value: recipient === 'SSI' ? resolvedInfo?.addr : addrName,
        // }
        // params.push(recipient_)
        // const donation_ = await tyron.Donation.default.tyron(donation!)
        // const tyron_ = {
        //     vname: 'tyron',
        //     type: 'Option Uint128',
        //     value: donation_,
        // }
        // params.push(tyron_)
        // // const nftID = {
        // //     vname: 'nftID',
        // //     type: 'String',
        // //     value: nft,
        // // }
        // // params.push(nftID)
        // // const donation_ = await tyron.Donation.default.tyron(
        // //     donation!
        // // )
        // // const tyron_ = {
        // //     vname: 'tyron',
        // //     type: 'Option Uint128',
        // //     value: donation_,
        // // }
        // // params.push(tyron_)

        // dispatch(setTxStatusLoading('true'))
        // updateModalTxMinimized(false)
        // updateModalTx(true)
        // await zilpay
        //     .call({
        //         contractAddress: resolvedInfo?.addr!,
        //         transition: 'ZRC6_Mint',
        //         params: params as unknown as Record<string, unknown>[],
        //         amount: String(donation),
        //     })
        //     .then(async (res) => {
        //         dispatch(setTxId(res.ID))
        //         dispatch(setTxStatusLoading('submitted'))
        //         tx = await tx.confirm(res.ID)
        //         if (tx.isConfirmed()) {
        //             dispatch(setTxStatusLoading('confirmed'))
        //             setTimeout(() => {
        //                 window.open(
        //                     `https://v2.viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
        //                 )
        //             }, 1000)
        //         } else if (tx.isRejected()) {
        //             dispatch(setTxStatusLoading('failed'))
        //         }
        //     })
        //     .catch((err) => {
        //         dispatch(setTxStatusLoading('rejected'))
        //         updateModalTxMinimized(false)
        //         updateModalTx(true)
        //         throw err
        //     })
    }

    const optionRecipient = [
        {
            value: 'SSI',
            label: t('This SSI'),
        },
        {
            value: 'ADDR',
            label: 'Another Wallet',
        },
    ]

    const optionAddr = [
        {
            value: 'nawelito',
            label: 'Nawelito',
        },
        {
            value: 'ddk10',
            label: 'DDK10',
        },
    ]

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
        <div className={styles.wrapper}>
            {txName !== '' && (
                <div
                    className={styles.closeWrapper}
                    onClick={() => toggleActive('')}
                />
            )}
            <div className={styles.content}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '10%',
                    }}
                >
                    <div className={styles.title}>ZRC6</div>
                </div>
                <div className={styles.cardWrapper}>
                    <div className={styles.cardActiveWrapper}>
                        <div
                            onClick={() => toggleActive('mint')}
                            className={
                                txName === 'mint'
                                    ? styles.cardActive
                                    : styles.card
                            }
                        >
                            <div>MINT</div>
                        </div>
                        {txName === 'mint' && (
                            <div className={styles.cardRight}>
                                <div className={styles.closeIcoWrapper}>
                                    <div
                                        onClick={() => toggleActive('')}
                                        className={styles.closeIco}
                                    >
                                        <Image
                                            width={10}
                                            src={CloseIco}
                                            alt="close-ico"
                                        />
                                    </div>
                                </div>
                                <div className={styles.contentWrapper}>
                                    <div style={{ marginTop: '16px' }}>
                                        <Selector
                                            option={optionAddr}
                                            onChange={handleChangeAddr}
                                            placeholder="Select Address Name"
                                        />
                                    </div>
                                    {addrName !== '' && (
                                        <>
                                            <div style={{ marginTop: '16px' }}>
                                                <Selector
                                                    option={optionRecipient}
                                                    onChange={onChangeRecipient}
                                                    placeholder="Select Recipient"
                                                />
                                            </div>
                                            {recipient === 'ADDR' && (
                                                <>
                                                    <div
                                                        style={{
                                                            marginTop: '16px',
                                                        }}
                                                    >
                                                        <Selector
                                                            option={
                                                                optionTypeOtherAddr
                                                            }
                                                            onChange={
                                                                onChangeTypeOther
                                                            }
                                                            placeholder="Select Type"
                                                        />
                                                    </div>
                                                    {otherRecipient ===
                                                    'address' ? (
                                                        <div
                                                            style={{
                                                                marginTop:
                                                                    '16px',
                                                            }}
                                                        >
                                                            <div
                                                                className={
                                                                    styles.txt
                                                                }
                                                            >
                                                                Input Address
                                                            </div>
                                                            <div
                                                                className={
                                                                    styles.containerInput
                                                                }
                                                            >
                                                                <input
                                                                    type="text"
                                                                    className={
                                                                        styles.input
                                                                    }
                                                                    placeholder={t(
                                                                        'Type address'
                                                                    )}
                                                                    onChange={
                                                                        handleInputAdddr
                                                                    }
                                                                    onKeyPress={
                                                                        handleOnKeyPressAddr
                                                                    }
                                                                />
                                                                <div
                                                                    style={{
                                                                        display:
                                                                            'flex',
                                                                        alignItems:
                                                                            'center',
                                                                        cursor: 'pointer',
                                                                    }}
                                                                >
                                                                    <div
                                                                        className={
                                                                            !savedAddr
                                                                                ? 'continueBtn'
                                                                                : ''
                                                                        }
                                                                        onClick={
                                                                            saveAddr
                                                                        }
                                                                    >
                                                                        {!savedAddr ? (
                                                                            <Image
                                                                                src={
                                                                                    ContinueArrow
                                                                                }
                                                                                alt="arrow"
                                                                            />
                                                                        ) : (
                                                                            <div
                                                                                style={{
                                                                                    marginTop:
                                                                                        '5px',
                                                                                }}
                                                                            >
                                                                                <Image
                                                                                    width={
                                                                                        40
                                                                                    }
                                                                                    src={
                                                                                        TickIco
                                                                                    }
                                                                                    alt="tick"
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : otherRecipient ===
                                                      'nft' ? (
                                                        <SearchBarWallet
                                                            resolveUsername={
                                                                resolveUsername
                                                            }
                                                            handleInput={
                                                                handleInput
                                                            }
                                                            input={
                                                                usernameInput
                                                            }
                                                            loading={loading}
                                                            saved={savedAddr}
                                                        />
                                                    ) : (
                                                        <></>
                                                    )}
                                                </>
                                            )}
                                            {(recipient === 'ADDR' &&
                                                savedAddr) ||
                                            recipient === 'SSI' ? (
                                                <div>
                                                    <Donate />
                                                    {donation !== null && (
                                                        <div
                                                            style={{
                                                                width: '100%',
                                                                display: 'flex',
                                                                justifyContent:
                                                                    'center',
                                                            }}
                                                        >
                                                            <div
                                                                onClick={
                                                                    handleSubmit
                                                                }
                                                                className="actionBtn"
                                                            >
                                                                MINT
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <></>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className={styles.cardActiveWrapper}>
                        <div
                            onClick={() => toggleActive('batchMint')}
                            className={
                                txName === 'batchMint'
                                    ? styles.cardActive
                                    : styles.card
                            }
                        >
                            <div>BATCH MINT</div>
                        </div>
                        {txName === 'batchMint' && (
                            <div className={styles.cardRight}>
                                <div className={styles.closeIcoWrapper}>
                                    <div
                                        onClick={() => toggleActive('')}
                                        className={styles.closeIco}
                                    >
                                        <Image
                                            width={10}
                                            src={CloseIco}
                                            alt="close-ico"
                                        />
                                    </div>
                                </div>
                                <></>
                            </div>
                        )}
                    </div>
                    <div className={styles.cardActiveWrapper}>
                        <div
                            onClick={() => toggleActive('burn')}
                            className={
                                txName === 'burn'
                                    ? styles.cardActive
                                    : styles.card
                            }
                        >
                            <div>BURN</div>
                        </div>
                        {txName === 'burn' && (
                            <div className={styles.cardRight}>
                                <div className={styles.closeIcoWrapper}>
                                    <div
                                        onClick={() => toggleActive('')}
                                        className={styles.closeIco}
                                    >
                                        <Image
                                            width={10}
                                            src={CloseIco}
                                            alt="close-ico"
                                        />
                                    </div>
                                </div>
                                <></>
                            </div>
                        )}
                    </div>
                    <div className={styles.cardActiveWrapper}>
                        <div
                            onClick={() => toggleActive('batchBurn')}
                            className={
                                txName === 'batchBurn'
                                    ? styles.cardActive
                                    : styles.card
                            }
                        >
                            <div>BATCH BURN</div>
                        </div>
                        {txName === 'batchBurn' && (
                            <div className={styles.cardRight}>
                                <div className={styles.closeIcoWrapper}>
                                    <div
                                        onClick={() => toggleActive('')}
                                        className={styles.closeIco}
                                    >
                                        <Image
                                            width={10}
                                            src={CloseIco}
                                            alt="close-ico"
                                        />
                                    </div>
                                </div>
                                <></>
                            </div>
                        )}
                    </div>
                    <div className={styles.cardActiveWrapper}>
                        <div
                            onClick={() => toggleActive('setSpender')}
                            className={
                                txName === 'setSpender'
                                    ? styles.cardActive
                                    : styles.card
                            }
                        >
                            <div>SET SPENDER</div>
                        </div>
                        {txName === 'setSpender' && (
                            <div className={styles.cardRight}>
                                <div className={styles.closeIcoWrapper}>
                                    <div
                                        onClick={() => toggleActive('')}
                                        className={styles.closeIco}
                                    >
                                        <Image
                                            width={10}
                                            src={CloseIco}
                                            alt="close-ico"
                                        />
                                    </div>
                                </div>
                                <></>
                            </div>
                        )}
                    </div>
                    <div className={styles.cardActiveWrapper}>
                        <div
                            onClick={() => toggleActive('addOperator')}
                            className={
                                txName === 'addOperator'
                                    ? styles.cardActive
                                    : styles.card
                            }
                        >
                            <div>ADD OPERATOR</div>
                        </div>
                        {txName === 'addOperator' && (
                            <div className={styles.cardRight}>
                                <div className={styles.closeIcoWrapper}>
                                    <div
                                        onClick={() => toggleActive('')}
                                        className={styles.closeIco}
                                    >
                                        <Image
                                            width={10}
                                            src={CloseIco}
                                            alt="close-ico"
                                        />
                                    </div>
                                </div>
                                <></>
                            </div>
                        )}
                    </div>
                    <div className={styles.cardActiveWrapper}>
                        <div
                            onClick={() => toggleActive('removeOperator')}
                            className={
                                txName === 'removeOperator'
                                    ? styles.cardActive
                                    : styles.card
                            }
                        >
                            <div>REMOVE OPERATOR</div>
                        </div>
                        {txName === 'removeOperator' && (
                            <div className={styles.cardRight}>
                                <div className={styles.closeIcoWrapper}>
                                    <div
                                        onClick={() => toggleActive('')}
                                        className={styles.closeIco}
                                    >
                                        <Image
                                            width={10}
                                            src={CloseIco}
                                            alt="close-ico"
                                        />
                                    </div>
                                </div>
                                <></>
                            </div>
                        )}
                    </div>
                    <div className={styles.cardActiveWrapper}>
                        <div
                            onClick={() => toggleActive('transferForm')}
                            className={
                                txName === 'transferForm'
                                    ? styles.cardActive
                                    : styles.card
                            }
                        >
                            <div>TRANSFER FORM</div>
                        </div>
                        {txName === 'transferForm' && (
                            <div className={styles.cardRight}>
                                <div className={styles.closeIcoWrapper}>
                                    <div
                                        onClick={() => toggleActive('')}
                                        className={styles.closeIco}
                                    >
                                        <Image
                                            width={10}
                                            src={CloseIco}
                                            alt="close-ico"
                                        />
                                    </div>
                                </div>
                                <></>
                            </div>
                        )}
                    </div>
                    <div className={styles.cardActiveWrapper}>
                        <div
                            onClick={() => toggleActive('batchTransferForm')}
                            className={
                                txName === 'batchTransferForm'
                                    ? styles.cardActive
                                    : styles.card
                            }
                        >
                            <div>BATCH TRANSFER FORM</div>
                        </div>
                        {txName === 'batchTransferForm' && (
                            <div className={styles.cardRight}>
                                <div className={styles.closeIcoWrapper}>
                                    <div
                                        onClick={() => toggleActive('')}
                                        className={styles.closeIco}
                                    >
                                        <Image
                                            width={10}
                                            src={CloseIco}
                                            alt="close-ico"
                                        />
                                    </div>
                                </div>
                                <></>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Component
