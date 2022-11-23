import styles from './styles.module.scss'
import * as tyron from 'tyron'
import { useSelector } from 'react-redux'
import { RootState } from '../../../src/app/reducers'
import { useStore } from 'effector-react'
import { $resolvedInfo } from '../../../src/store/resolvedInfo'
import { useEffect, useState } from 'react'
import smartContract from '../../../src/utils/smartContract'
import ThreeDots from '../../Spinner/ThreeDots'
import { updateLoadingTydra } from '../../../src/store/loading'
import * as fetch_ from '../../../src/hooks/fetch'
import toastTheme from '../../../src/hooks/toastTheme'
import { toast } from 'react-toastify'

function Component() {
    const { getSmartContract } = smartContract()
    const { checkVersion } = fetch_.default()
    const net = useSelector((state: RootState) => state.modal.net)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const resolvedInfo = useStore($resolvedInfo)
    const [loadingTydra, setLoadingTydra] = useState(true)
    const [tydra, setTydra] = useState('')
    const [isTydra, setIsTydra] = useState(true)
    const [baseUri, setBaseUri] = useState(true)
    const [tokenUri, setTokenUri] = useState('')
    const version = checkVersion(resolvedInfo?.version)

    const checkType = async () => {
        setIsTydra(true)
        if (version < 6) {
            fetchTydra('')
        } else {
            try {
                const domainId =
                    '0x' +
                    (await tyron.Util.default.HashString(resolvedInfo?.name!))
                const did_addr = await tyron.SearchBarUtil.default.fetchAddr(
                    net,
                    domainId,
                    'did'
                )
                const get_nftDns = await getSmartContract(did_addr, 'nft_dns')
                console.log('name:', resolvedInfo?.name)
                console.log('did_addr:', did_addr)
                console.log('get_nftDns', get_nftDns)
                const nftDns = await tyron.SmartUtil.default.intoMap(
                    get_nftDns.result.nft_dns
                )
                let subdomain = resolvedInfo?.domain!
                if (subdomain === '') {
                    subdomain = 'ssi'
                }
                const nftDns_ = nftDns.get(subdomain)
                console.log('nft_dns', nftDns_)
                const collection = nftDns_.split('#')[0]
                if (
                    collection === 'nawelito' ||
                    collection === 'nawelitoonfire' ||
                    collection === 'nessy'
                ) {
                    fetchTydra(nftDns_)
                } else if (nftDns_) {
                    setIsTydra(false)
                    fetchOtherNft(nftDns_)
                } else {
                    console.log('nftDns not found')
                    setLoadingTydra(false)
                    setTimeout(() => {
                        updateLoadingTydra(false)
                    }, 3000)
                }
            } catch {
                fetchTydra('')
            }
        }
    }

    const fetchOtherNft = async (nftName: string) => {
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
            const tokenAddr = services.get(nftName.split('#')[0])
            const base_uri = await getSmartContract(tokenAddr, 'base_uri')
            const baseUri = base_uri.result.base_uri
            setBaseUri(baseUri)
            const get_tokenUris = await getSmartContract(
                tokenAddr,
                'token_uris'
            )
            console.log('@', get_tokenUris)
            const tokenUris = await tyron.SmartUtil.default.intoMap(
                get_tokenUris.result.token_uris
            )
            console.log('@', tokenUris)

            //@todo-i add condition to verify that the DIDxWallet (username.did) or ZilPay wallet is the token owner for the given ID
            const tokenUris_ = tokenUris.get(nftName.split('#')[1])
            setTokenUri(tokenUris_)
            setLoadingTydra(false)
            setTimeout(() => {
                updateLoadingTydra(false)
            }, 3000)
        } catch (error) {
            setLoadingTydra(false)
            setTimeout(() => {
                updateLoadingTydra(false)
            }, 3000)
            toast.error('Failed to verify NFT', {
                position: 'bottom-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
                toastId: 2,
            })
        }
    }

    const fetchTydra = async (nftDns: string) => {
        updateLoadingTydra(true)
        setLoadingTydra(true)
        try {
            const init_addr = await tyron.SearchBarUtil.default.fetchAddr(
                net,
                'init',
                'did'
            )
            const base_uri = await getSmartContract(init_addr, 'base_uri')
            const baseUri = base_uri.result.base_uri
            const get_tokenuri = await getSmartContract(init_addr, 'token_uris')
            const token_uris = await tyron.SmartUtil.default.intoMap(
                get_tokenuri.result.token_uris
            )
            const arr = Array.from(token_uris.values())
            const domainId =
                '0x' +
                (await tyron.Util.default.HashString(resolvedInfo?.name!))
            let tokenUri
            if (version < 6) {
                tokenUri = arr[0][domainId]
                if (!tokenUri) {
                    tokenUri = arr[1][domainId]
                }
                if (!tokenUri) {
                    tokenUri = arr[2][domainId]
                }
            } else {
                const collection = nftDns.split('#')[0]
                if (collection === 'nawelito') {
                    tokenUri = arr[0][domainId]
                } else if (collection === 'nawelitoonfire') {
                    tokenUri = arr[1][domainId]
                } else if (collection === 'nessy') {
                    tokenUri = arr[2][domainId]
                }
            }
            console.log('tydra', tokenUri)
            await fetch(`${baseUri}${tokenUri}`)
                .then((response) => response.json())
                .then((data) => {
                    setLoadingTydra(false)
                    setTimeout(() => {
                        updateLoadingTydra(false)
                    }, 3000)
                    setTydra(data.resource)
                })
        } catch (err) {
            setLoadingTydra(false)
            updateLoadingTydra(false)
        }
    }

    useEffect(() => {
        checkType()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div>
            {loadingTydra ? (
                <div className={styles.loading}>
                    <ThreeDots color="basic" />
                </div>
            ) : (
                <>
                    {isTydra ? (
                        <>
                            {tydra !== '' && (
                                <img
                                    className={styles.tydraImg}
                                    src={`data:image/png;base64,${tydra}`}
                                    alt="tydra-img"
                                />
                            )}
                        </>
                    ) : tokenUri !== '' ? (
                        <img
                            style={{ cursor: 'pointer' }}
                            width={200}
                            src={`${baseUri}${tokenUri}`}
                            alt="lexica-img"
                        />
                    ) : (
                        <></>
                    )}
                </>
            )}
        </div>
    )
}

export default Component
