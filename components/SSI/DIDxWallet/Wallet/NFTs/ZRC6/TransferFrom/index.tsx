/* eslint-disable @next/next/no-img-element */
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
import { Donate, SearchBarWallet, Selector, Spinner } from '../../../../../..'
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
import { toast } from 'react-toastify'
import toastTheme from '../../../../../../../src/hooks/toastTheme'
import ContinueArrow from '../../../../../../../src/assets/icons/continue_arrow.svg'
import TickIco from '../../../../../../../src/assets/icons/tick.svg'

function Component({ addrName }) {
    const zcrypto = tyron.Util.default.Zcrypto()
    const { getSmartContract } = smartContract()
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const resolvedInfo = useStore($resolvedInfo)
    const donation = useStore($donation)
    const net = useSelector((state: RootState) => state.modal.net)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const styles = isLight ? stylesLight : stylesDark
    const defaultCheckmark = isLight
        ? defaultCheckmarkDark
        : defaultCheckmarkLight
    const [loadingSubmit, setLoadingSubmit] = useState(false)
    const [selectedNft, setSelectedNft] = useState('')
    const [loadingNftList, setLoadingNftList] = useState(false)
    const [baseUri, setBaseUri] = useState('')
    const [tokenUri, setTokenUri] = useState(Array())
    const [addr, setAddr] = useState('')
    const [savedAddr, setSavedAddr] = useState(false)
    const [otherRecipient, setOtherRecipient] = useState('')
    const [usernameInput, setUsernameInput] = useState('')
    const [loading, setLoading] = useState(false)

    const toggleSelectNft = (val) => {
        if (selectedNft === val) {
            setSelectedNft('')
        } else {
            setSelectedNft(val)
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
            checkTokenId()
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

    const checkTokenId = async () => {
        setLoadingNftList(true)
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
            const tokenAddr = services.get(addrName)
            const base_uri = await getSmartContract(tokenAddr, 'base_uri')
            const baseUri = base_uri.result.base_uri
            setBaseUri(baseUri)
            const get_owners = await getSmartContract(tokenAddr, 'token_owners')
            const get_tokenUris = await getSmartContract(
                tokenAddr,
                'token_uris'
            )

            const owners = get_owners.result.token_owners
            const keyOwner = Object.keys(owners)
            const valOwner = Object.values(owners)
            let token_id: any = []
            for (let i = 0; i < valOwner.length; i += 1) {
                if (
                    valOwner[i] === resolvedInfo?.addr?.toLowerCase() ||
                    valOwner[i] === loginInfo?.zilAddr?.base16.toLowerCase()
                ) {
                    token_id.push(keyOwner[i])
                }
            }

            const tokenUris = get_tokenUris.result.token_uris
            const keyUris = Object.keys(tokenUris)
            const valUris = Object.values(tokenUris)
            let token_uris: any = []
            for (let i = 0; i < valUris.length; i += 1) {
                if (token_id.some((arr) => arr === keyUris[i])) {
                    const obj = {
                        id: keyUris[i],
                        name: valUris[i],
                    }
                    token_uris.push(obj)
                }
            }
            console.log(token_uris)
            setTokenUri(token_uris)
        } catch {
            setTokenUri([])
        }
        setLoadingNftList(false)
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
                checkTokenId()
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
        const to_ = {
            vname: 'to',
            type: 'ByStr20',
            value: addr,
        }
        params.push(to_)
        const token_id = {
            vname: 'token_id',
            type: 'Uint256',
            value: selectedNft,
        }
        params.push(token_id)
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
                transition: 'ZRC6_TransferFrom',
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
                    {loadingNftList ? (
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
                            {tokenUri.length === 0 && (
                                <div>You don&apos;t have any NFTs</div>
                            )}
                            {tokenUri.map((val, i) => (
                                <div
                                    className={styles.wrapperNftOption}
                                    key={i}
                                >
                                    {val.id === selectedNft ? (
                                        <div
                                            onClick={() =>
                                                toggleSelectNft(val.id)
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
                                                toggleSelectNft(val.id)
                                            }
                                        >
                                            <Image
                                                src={defaultCheckmark}
                                                alt="arrow"
                                            />
                                        </div>
                                    )}
                                    <img
                                        onClick={() => toggleSelectNft(val.id)}
                                        style={{ cursor: 'pointer' }}
                                        width={200}
                                        src={`${baseUri}${val.name}`}
                                        alt="lexica-img"
                                    />
                                </div>
                            ))}
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
                                                    'TRANSFER FROM'
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </>
            )}
        </>
    )
}

export default Component
