/* eslint-disable @next/next/no-img-element */
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
import TickIco from '../../../../../../../src/assets/icons/tick.svg'
import Selector from '../../../../../../Selector'
import {
    Arrow,
    Donate,
    ModalImg,
    SearchBarWallet,
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
import AddIconBlack from '../../../../../../../src/assets/icons/add_icon_black.svg'
import AddIconReg from '../../../../../../../src/assets/icons/add_icon.svg'
import * as fetch_ from '../../../../../../../src/hooks/fetch'

function Component({ addrName }) {
    const zcrypto = tyron.Util.default.Zcrypto()
    const { getSmartContract } = smartContract()
    const { fetchLexica } = fetch_.default()
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const resolvedInfo = useStore($resolvedInfo)
    const donation = useStore($donation)
    const net = useSelector((state: RootState) => state.modal.net)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const AddIcon = isLight ? AddIconBlack : AddIconReg
    const styles = isLight ? stylesLight : stylesDark
    const defaultCheckmark = isLight
        ? defaultCheckmarkDark
        : defaultCheckmarkLight
    const selectedCheckmark = isLight
        ? selectedCheckmarkLight
        : selectedCheckmarkDark
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
    const [selectedNft, setSelectedNft] = useState([])
    const [reRender, setReRender] = useState(true)
    const [showModalImg, setShowModalImg] = useState(false)
    const [dataModalImg, setDataModalImg] = useState('')

    const handleInputAdddr = (event: { target: { value: any } }) => {
        setSavedAddr(false)
        setAddr(event.target.value)
    }

    const handleInputLexica = (event: { target: { value: any } }) => {
        setSelectedNft([])
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
        const lexicaList = await fetchLexica()
        await fetch(`https://lexica.art/api/v1/search?q=${nftInput}`)
            .then((response) => response.json())
            .then((data) => {
                setNftLoading(false)
                let filteredData: any = Array()
                for (let i = 0; i < data.images.length; i += 1) {
                    if (!lexicaList?.some((arr) => arr === data.images[i].id)) {
                        filteredData.push(data.images[i])
                    }
                }
                let shuffled = filteredData
                    .map((value) => ({ value, sort: Math.random() }))
                    .sort((a, b) => a.sort - b.sort)
                    .map(({ value }) => value)
                // setTydra(data.resource)
                console.log(shuffled.slice(0, 10))
                setNftList(shuffled.slice(0, 10))
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

    const checkIsSelectedNft = (id) => {
        if (selectedNft.some((val) => val === id)) {
            return true
        } else {
            return false
        }
    }

    const selectNft = (id: string) => {
        if (!checkIsSelectedNft(id)) {
            let arr: any = selectedNft
            arr.push(id)
            setSelectedNft(arr)
            setReRender(false)
            setTimeout(() => {
                setReRender(true)
            }, 10)
        } else {
            let arr = selectedNft.filter((arr) => arr !== id)
            setSelectedNft(arr)
        }
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
        const to_token_uri_pair_list: any[] = []
        const addr_ = recipient === 'SSI' ? resolvedInfo?.addr : addr
        for (let i = 0; i < selectedNft.length; i += 1) {
            to_token_uri_pair_list.push({
                argtypes: ['ByStr20', 'String'],
                arguments: [`${addr_}`, `${selectedNft[i]}`],
                constructor: 'Pair',
            })
        }
        const to_token_uri_pair_list_ = {
            vname: 'to_token_uri_pair_list',
            type: 'List( Pair ByStr20 String )',
            value: to_token_uri_pair_list,
        }
        params.push(to_token_uri_pair_list_)
        const amount_ = {
            vname: 'amount',
            type: 'Uint128',
            value: `${parseInt(amount) * selectedNft.length}`,
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
                transition: 'ZRC6_BatchMint',
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
                        <div className={styles.containerInput}>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="Search for an image"
                                onChange={handleInputLexica}
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
                                    <div onClick={searchLexica}>
                                        <Arrow />
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
                                        <div
                                            onClick={() => selectNft(val.id)}
                                            className={styles.optionIco}
                                        >
                                            <Image
                                                src={
                                                    checkIsSelectedNft(val.id)
                                                        ? selectedCheckmark
                                                        : defaultCheckmark
                                                }
                                                alt="arrow"
                                            />
                                        </div>
                                        <img
                                            onClick={() => selectNft(val.id)}
                                            style={{ cursor: 'pointer' }}
                                            width={200}
                                            src={val.srcSmall}
                                            alt="lexica-img"
                                        />
                                        {dataModalImg === val.src && (
                                            <ModalImg
                                                showModalImg={showModalImg}
                                                setShowModalImg={
                                                    setShowModalImg
                                                }
                                                dataModalImg={dataModalImg}
                                                setDataModalImg={
                                                    setDataModalImg
                                                }
                                            />
                                        )}
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <div
                                                onClick={() => {
                                                    setDataModalImg(val.src)
                                                    setShowModalImg(true)
                                                }}
                                                style={{
                                                    marginLeft: '5px',
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
                        )}
                    </div>
                    {selectedNft.length > 0 && (
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
                                            'BATCH MINT'
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
            {reRender && <div />}
        </>
    )
}

export default Component
