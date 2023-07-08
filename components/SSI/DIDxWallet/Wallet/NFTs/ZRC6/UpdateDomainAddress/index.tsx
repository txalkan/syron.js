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
import {
    Arrow,
    Donate,
    ModalImg,
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
import defaultCheckmarkLight from '../../../../../../../src/assets/icons/default_checkmark.svg'
import defaultCheckmarkDark from '../../../../../../../src/assets/icons/default_checkmark_black.svg'
import selectedCheckmarkDark from '../../../../../../../src/assets/icons/selected_checkmark.svg'
import selectedCheckmarkLight from '../../../../../../../src/assets/icons/selected_checkmark_purple.svg'
import { toast } from 'react-toastify'
import toastTheme from '../../../../../../../src/hooks/toastTheme'
import TickIco from '../../../../../../../src/assets/icons/tick.svg'
import AddIconBlack from '../../../../../../../src/assets/icons/add_icon_black.svg'
import AddIconReg from '../../../../../../../src/assets/icons/add_icon.svg'
import fetch from '../../../../../../../src/hooks/fetch'
import { $net } from '../../../../../../../src/store/network'

function Component({ addrName }) {
    const net = $net.state.net as 'mainnet' | 'testnet'

    const zcrypto = tyron.Util.default.Zcrypto()
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const resolvedInfo = useStore($resolvedInfo)
    const donation = useStore($donation)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const styles = isLight ? stylesLight : stylesDark
    const AddIcon = isLight ? AddIconBlack : AddIconReg
    const defaultCheckmark = isLight
        ? defaultCheckmarkDark
        : defaultCheckmarkLight
    const selectedCheckmark = isLight
        ? selectedCheckmarkLight
        : selectedCheckmarkDark
    const [selectedNft, setSelectedNft] = useState('')
    const [addr, setAddr] = useState('')
    const [savedAddr, setSavedAddr] = useState(false)
    const [otherRecipient, setOtherRecipient] = useState('')
    const [usernameInput, setUsernameInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [showModalImg, setShowModalImg] = useState(false)
    const [dataModalImg, setDataModalImg] = useState('')

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

    const { getNftsWallet } = fetch()
    const [loadingNftList, setLoadingNftList] = useState(false)
    const [tokenIds, setTokenIds] = useState(Array())
    const [tokenUris, setTokenUris] = useState(Array())
    const [baseUri, setBaseUri] = useState('')
    const checkTokenId = async () => {
        setLoadingNftList(true)
        const res = await getNftsWallet(addrName)
        setTokenIds(res.tokenIds)
        setTokenUris(res.tokenUris)
        setBaseUri(res.baseUri)
        setTimeout(() => {
            setLoadingNftList(false)
        }, 400)
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
                checkTokenId()
            })
            .catch(() => {
                toast.error('Invalid domain.', {
                    position: 'top-right',
                    autoClose: 4000,
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

    const [loadingSubmit, setLoadingSubmit] = useState(false)
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
        const token_id = {
            vname: 'token_id',
            type: 'Uint256',
            value: selectedNft,
        }
        params.push(token_id)
        const new_addr = {
            vname: 'new_addr',
            type: 'ByStr20',
            value: addr,
        }
        params.push(new_addr)
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
                transition: 'UpdateDomainAddress',
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
            label: 'Address',
        },
        {
            value: 'nft',
            label: 'NFT Domain Name',
        },
    ]

    return (
        <>
            <div style={{ marginTop: '17px', marginBottom: '17px' }}>
                <Selector
                    option={optionTypeOtherAddr}
                    onChange={onChangeTypeOther}
                    placeholder="New address"
                />
            </div>
            {otherRecipient !== '' && (
                <h6 className={styles.txt}>domain address</h6>
            )}
            {otherRecipient === 'address' ? (
                <div
                    style={{
                        marginTop: '16px',
                    }}
                >
                    <div className={styles.containerInput}>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder={t('Address')}
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
                            {tokenIds.length === 0 ? (
                                <div
                                    style={{
                                        marginTop: '10%',
                                        width: '100%',
                                        display: 'flex',
                                        justifyContent: 'left',
                                    }}
                                >
                                    This xWALLET doesn&apos;t have any NFTs.
                                </div>
                            ) : (
                                <>
                                    {addrName !== '.gzil' ? (
                                        <>
                                            {tokenUris.map((val, i) => (
                                                <div
                                                    className={
                                                        styles.wrapperNftOption
                                                    }
                                                    key={i}
                                                >
                                                    {val.id === selectedNft ? (
                                                        <div
                                                            onClick={() =>
                                                                toggleSelectNft(
                                                                    val.id
                                                                )
                                                            }
                                                            className={
                                                                styles.optionIco
                                                            }
                                                        >
                                                            <Image
                                                                src={
                                                                    selectedCheckmark
                                                                }
                                                                alt="arrow"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className={
                                                                styles.optionIco
                                                            }
                                                            onClick={() =>
                                                                toggleSelectNft(
                                                                    val.id
                                                                )
                                                            }
                                                        >
                                                            <Image
                                                                src={
                                                                    defaultCheckmark
                                                                }
                                                                alt="arrow"
                                                            />
                                                        </div>
                                                    )}
                                                    <img
                                                        onClick={() =>
                                                            toggleSelectNft(
                                                                val.id
                                                            )
                                                        }
                                                        style={{
                                                            cursor: 'pointer',
                                                        }}
                                                        width={200}
                                                        src={`${baseUri}${val.name}`}
                                                        alt="lexica-img"
                                                    />
                                                    {dataModalImg ===
                                                        `${baseUri}${val.name}` && (
                                                        <ModalImg
                                                            showModalImg={
                                                                showModalImg
                                                            }
                                                            setShowModalImg={
                                                                setShowModalImg
                                                            }
                                                            dataModalImg={
                                                                dataModalImg
                                                            }
                                                            setDataModalImg={
                                                                setDataModalImg
                                                            }
                                                        />
                                                    )}
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            alignItems:
                                                                'center',
                                                        }}
                                                    >
                                                        <div
                                                            onClick={() => {
                                                                setDataModalImg(
                                                                    `${baseUri}${val.name}`
                                                                )
                                                                setShowModalImg(
                                                                    true
                                                                )
                                                            }}
                                                            style={{
                                                                marginLeft:
                                                                    '5px',
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            <Image
                                                                alt="arrow-ico"
                                                                src={AddIcon}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    ) : (
                                        <>
                                            <div
                                                style={{
                                                    marginTop: '10%',
                                                    width: '100%',
                                                    display: 'flex',
                                                    justifyContent: 'left',
                                                }}
                                            >
                                                You can update the domain
                                                address of any of the following
                                                NFTs:
                                            </div>
                                            <div
                                                style={{
                                                    marginTop: '10%',
                                                    width: '100%',
                                                    display: 'flex',
                                                    justifyContent: 'left',
                                                }}
                                            >
                                                NFT IDs
                                            </div>
                                            {tokenIds.map((val, i) => (
                                                <div
                                                    className={
                                                        styles.wrapperNftOption
                                                    }
                                                    key={i}
                                                >
                                                    {val.id === selectedNft ? (
                                                        <div
                                                            onClick={() =>
                                                                toggleSelectNft(
                                                                    val.id
                                                                )
                                                            }
                                                            className={
                                                                styles.optionIco
                                                            }
                                                        >
                                                            <Image
                                                                src={
                                                                    selectedCheckmark
                                                                }
                                                                alt="arrow"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className={
                                                                styles.optionIco
                                                            }
                                                            onClick={() =>
                                                                toggleSelectNft(
                                                                    val.id
                                                                )
                                                            }
                                                        >
                                                            <Image
                                                                src={
                                                                    defaultCheckmark
                                                                }
                                                                alt="arrow"
                                                            />
                                                        </div>
                                                    )}
                                                    <code>{val.id}</code>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </>
                            )}
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
                                                className={
                                                    isLight
                                                        ? 'actionBtnLight'
                                                        : 'actionBtn'
                                                }
                                            >
                                                {loadingSubmit ? (
                                                    <ThreeDots color="black" />
                                                ) : (
                                                    'UPDATE ADDRESS'
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
