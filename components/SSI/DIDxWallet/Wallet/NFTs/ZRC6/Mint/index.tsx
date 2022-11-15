import React, { useEffect, useState } from 'react'
import * as tyron from 'tyron'
import Image from 'next/image'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import { useStore } from 'effector-react'
import { $resolvedInfo } from '../../../../../../../src/store/resolvedInfo'
import { useTranslation } from 'next-i18next'
import routerHook from '../../../../../../../src/hooks/router'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../../../../../src/app/reducers'
import ThreeDots from '../../../../../../Spinner/ThreeDots'
import {
    $donation,
    updateDonation,
} from '../../../../../../../src/store/donation'
import CloseIcoReg from '../../../../../../../src/assets/icons/ic_cross.svg'
import CloseIcoBlack from '../../../../../../../src/assets/icons/ic_cross_black.svg'
import { toast } from 'react-toastify'
import toastTheme from '../../../../../../../src/hooks/toastTheme'
import ContinueArrow from '../../../../../../../src/assets/icons/continue_arrow.svg'
import TickIco from '../../../../../../../src/assets/icons/tick.svg'
import Selector from '../../../../../../Selector'
import { Donate, SearchBarWallet, Spinner } from '../../../../../..'
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
import defaultCheckmarkLight from '../../../../../../../src/assets/icons/default_checkmark.svg'
import defaultCheckmarkDark from '../../../../../../../src/assets/icons/default_checkmark_black.svg'
import selectedCheckmark from '../../../../../../../src/assets/icons/selected_checkmark.svg'

function Component({ addrName }) {
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
    const defaultCheckmark = isLight
        ? defaultCheckmarkDark
        : defaultCheckmarkLight
    const [txName, setTxName] = useState('')
    const [addr, setAddr] = useState('')
    const [savedAddr, setSavedAddr] = useState(false)
    const [recipient, setRecipient] = useState('')
    const [otherRecipient, setOtherRecipient] = useState('')
    const [loading, setLoading] = useState(false)
    const [loadingSubmit, setLoadingSubmit] = useState(false)
    const [usernameInput, setUsernameInput] = useState('')
    const [nftInput, setNftInput] = useState('')
    const [nftLoading, setNftLoading] = useState(false)
    const [nftList, setNftList] = useState([])
    const [selectedNft, setSelectedNft] = useState('')

    const handleInputAdddr = (event: { target: { value: any } }) => {
        setSavedAddr(false)
        setAddr(event.target.value)
    }

    const handleInputLexica = (event: { target: { value: any } }) => {
        setSelectedNft('')
        setNftList([])
        setNftInput(event.target.value)
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

    const searchLexica = async () => {
        setNftLoading(true)
        await fetch(`https://lexica.art/api/v1/search?q=${nftInput}`)
            .then((response) => response.json())
            .then((data) => {
                setNftLoading(false)
                let shuffled = data.images
                    .map((value) => ({ value, sort: Math.random() }))
                    .sort((a, b) => a.sort - b.sort)
                    .map(({ value }) => value)
                // setTydra(data.resource)
                console.log(shuffled.slice(0, 10))
                setNftList(shuffled.slice(0, 10))
                // @todo-i-fixed would be better to make the selection of 10 aleatory instead of the first 10? so everytime we search it shows a new selection
            })
            .catch(() => {
                setNftLoading(false)
            })
    }

    const handleOnKeyPressAddr = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            saveAddr()
        }
    }

    const handleOnKeyPressLexica = ({
        key,
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            searchLexica()
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
        setLoadingSubmit(true)
        let amount: any = '0'
        try {
            const init_addr = await tyron.SearchBarUtil.default.fetchAddr(
                net,
                'init',
                'did'
            )
            const get_services = await getSmartContract(init_addr, 'services')
            const services = await tyron.SmartUtil.default.intoMap(
                get_services.result.services
            )
            const serviceAddr = services.get('lexicassi')
            const get_premiumprice = await getSmartContract(
                serviceAddr,
                'premium_price'
            )
            const premium_price = await tyron.SmartUtil.default.intoMap(
                get_premiumprice.result.premium_price
            )
            amount = premium_price
        } catch {
            amount = '0'
        }
        const zilpay = new ZilPayBase()
        let tx = await tyron.Init.default.transaction(net)
        let tokenUri = selectedNft
        // try {
        //     tokenUri = await fetchTydra()
        // } catch (err) {
        //     throw new Error()
        // }
        let params: any = []
        const addrName_ = {
            vname: 'addrName',
            type: 'String',
            value: addrName,
        }
        params.push(addrName_)
        const recipient_ = {
            vname: 'to',
            type: 'ByStr20',
            value: recipient === 'SSI' ? resolvedInfo?.addr : addr,
        }
        params.push(recipient_)
        const token_uri = {
            vname: 'token_uri',
            type: 'String',
            value: tokenUri,
        }
        params.push(token_uri)
        const amount_ = {
            vname: 'amount',
            type: 'Uint128',
            value: amount,
        }
        params.push(amount_)
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
                transition: 'ZRC6_Mint',
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
                                        className={
                                            !savedAddr ? 'continueBtn' : ''
                                        }
                                        onClick={saveAddr}
                                    >
                                        {!savedAddr ? (
                                            <Image
                                                src={ContinueArrow}
                                                alt="arrow"
                                            />
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
                </>
            )}
            {(recipient === 'ADDR' && savedAddr) || recipient === 'SSI' ? (
                <div>
                    <div
                        style={{
                            marginTop: '16px',
                        }}
                    >
                        <div className={styles.txt}>
                            <a
                                href="https://lexica.art/"
                                target="_blank"
                                rel="noreferrer"
                            >
                                lexica.art
                            </a>
                        </div>
                        {/* @todo-i-fixed add link to lexica.art */}
                        <div className={styles.containerInput}>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="Search for an image"
                                onChange={
                                    handleInputLexica
                                    // @todo-i-fixed handleInputLexica could be better since the input string is not an NFT
                                }
                                onKeyPress={handleOnKeyPressLexica}
                            />
                            {nftLoading ? (
                                <Spinner />
                            ) : (
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <div
                                        className={'continueBtn'}
                                        onClick={searchLexica}
                                    >
                                        <Image
                                            src={ContinueArrow}
                                            alt="arrow"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        {nftList.length > 0 && (
                            <>
                                {nftList.map((val: any, i) => (
                                    <div
                                        className={styles.wrapperNftOption}
                                        key={i}
                                    >
                                        {val.id === selectedNft ? (
                                            <div
                                                onClick={() =>
                                                    setSelectedNft('')
                                                }
                                                className={styles.optionIco}
                                            >
                                                <Image
                                                    src={selectedCheckmark}
                                                    alt="arrow"
                                                />
                                            </div>
                                        ) : (
                                            <div
                                                className={styles.optionIco}
                                                onClick={() =>
                                                    setSelectedNft(val.id)
                                                }
                                            >
                                                <Image
                                                    src={defaultCheckmark}
                                                    alt="arrow"
                                                />
                                            </div>
                                        )}
                                        <img
                                            width={200}
                                            src={val.srcSmall}
                                            alt="lexica-img"
                                        />
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                    {selectedNft !== '' && (
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
                                            'MINT'
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            ) : (
                <></>
            )}
        </>
    )
}

export default Component
