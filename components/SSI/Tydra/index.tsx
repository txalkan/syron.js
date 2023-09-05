/* eslint-disable @next/next/no-img-element */
import styles from './styles.module.scss'
import * as tyron from 'tyron'
import { $resolvedInfo } from '../../../src/store/resolvedInfo'
import { useEffect, useState } from 'react'
import smartContract from '../../../src/utils/smartContract'
import ThreeDots from '../../Spinner/ThreeDots'
import { updateLoadingTydra } from '../../../src/store/loading'
import * as fetch_ from '../../../src/hooks/fetch'
import { $net } from '../../../src/store/network'
import { useStore } from 'react-stores'
import Image from 'next/image'
import { ecoNfts } from '../../../src/constants/mintDomainName'

interface Props {
    type?: string
}

function Component(props: Props) {
    const net = $net.state.net as 'mainnet' | 'testnet'

    const { type } = props
    const { getSmartContract } = smartContract()
    const { checkVersion } = fetch_.default()
    const resolvedInfo = useStore($resolvedInfo)
    const domain = resolvedInfo?.user_domain!
    const subdomain = resolvedInfo?.user_subdomain!
    const tld = resolvedInfo?.user_tld
    const [loadingTydra, setLoadingTydra] = useState(true)
    const [loadingNoTydra, setLoadingNoTydra] = useState(true)
    const [tydra, setTydra] = useState('')
    const [isTydra, setIsTydra] = useState(true)
    const [baseUri, setBaseUri] = useState(true)
    const [tokenUri, setTokenUri] = useState('')
    //const version = checkVersion(resolvedInfo?.version)

    //@tydras-mainnet
    const tydras = [
        'nawelito',
        'nawelitoonfire',
        'nessy',
        'merxek',
        'ognawelito',
    ]

    const checkType = async () => {
        updateLoadingTydra(true)
        setIsTydra(true)
        console.log(
            `@tydra_resolvedAddr_${subdomain}@${domain}.${tld}`,
            resolvedInfo?.addr
        )
        // if (version < 6) {
        //     fetchTydra('')
        // } else {
        try {
            const did_addr = await tyron.SearchBarUtil.default.fetchAddr(
                net,
                'did',
                resolvedInfo?.user_domain!
            )
            const get_nftDns = await getSmartContract(did_addr, 'nft_dns')
            const nftDns = await tyron.SmartUtil.default.intoMap(
                get_nftDns!.result.nft_dns
            )
            let sub = subdomain
            if (subdomain === '') {
                if (tld === 'did') {
                    sub = 'did'
                } else {
                    sub = 'ssi'
                }
            }
            const nftDns_ = nftDns.get(sub)
            console.log(`@tydra_nftDdns for subdomain "${sub}" is:`, nftDns_)

            const collection = nftDns_.split('#')[0]
            if (tydras.some((val) => val === collection)) {
                fetchTydra(nftDns_)
            } else if (nftDns_ !== '#') {
                setIsTydra(false)
                fetchOtherNft(nftDns_)
            } else {
                console.log('nftDns not found')
                setLoadingTydra(false)
                setTimeout(() => {
                    updateLoadingTydra(false)
                }, 2000)
                setTimeout(() => {
                    setLoadingNoTydra(false)
                }, 5000)
            }
        } catch {
            fetchTydra('')
        }
        //}
    }

    const fetchOtherNft = async (nftName: string) => {
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
            const addrName = nftName.split('#')[0]
            const tokenAddr = services.get(addrName)
            let base_uri
            if (addrName === 'dd10k') {
                base_uri =
                    'https://dd10k.sfo3.cdn.digitaloceanspaces.com/dd10klores/'
            } else {
                base_uri = await getSmartContract(tokenAddr, 'base_uri')
                base_uri = base_uri.result.base_uri
            }
            console.log('@tydra_baseUri', base_uri)
            setBaseUri(base_uri)
            const get_tokenUris = await getSmartContract(
                tokenAddr,
                'token_uris'
            )
            const tokenUris = await tyron.SmartUtil.default.intoMap(
                get_tokenUris!.result.token_uris
            )

            //@dev: adds condition to verify that the DIDxWallet (username.did) or ZilPay wallet is the token owner for the given ID: done at line 57
            let tokenUris_ = tokenUris.get(nftName.split('#')[1])

            //@review: nfts
            if (ecoNfts.includes(addrName)) {
                tokenUris_ = nftName.split('#')[1] + '.png'
            }
            console.log('@tydra_tokenUri', tokenUris_)
            setTokenUri(tokenUris_)
            setLoadingTydra(false)
            setTimeout(() => {
                updateLoadingTydra(false)
            }, 2000)
            setTimeout(() => {
                setLoadingNoTydra(false)
            }, 5000)
        } catch (error) {
            setLoadingTydra(false)
            setTimeout(() => {
                updateLoadingTydra(false)
            }, 2000)
            setTimeout(() => {
                setLoadingNoTydra(false)
            }, 5000)
            console.error('@tydra: failed to verify NFT', error)
        }
    }

    const fetchTydra = async (nftDns: string) => {
        updateLoadingTydra(true)
        setLoadingTydra(true)
        try {
            const init_addr = await tyron.SearchBarUtil.default.fetchAddr(
                net,
                'did',
                'init'
            )
            const base_uri = await getSmartContract(init_addr, 'base_uri')
            const baseUri = base_uri!.result.base_uri
            const get_tokenuri = await getSmartContract(init_addr, 'token_uris')
            const token_uris = await tyron.SmartUtil.default.intoMap(
                get_tokenuri!.result.token_uris
            )
            const arr = Array.from(token_uris.values())
            const domainId =
                '0x' +
                (await tyron.Util.default.HashString(
                    resolvedInfo?.user_domain!
                ))
            let tokenUri: any

            const version = checkVersion(resolvedInfo?.version!)
            if (resolvedInfo?.version?.slice(0, 3) === 'xwa' && version < 6) {
                tokenUri = arr[0][domainId]
                if (!tokenUri) {
                    tokenUri = arr[1][domainId]
                }
                if (!tokenUri) {
                    tokenUri = arr[2][domainId]
                }
            } else {
                const collection = nftDns.split('#')[0]
                console.log('@tydra_collection', collection)

                const id = tydras.indexOf(collection)
                tokenUri = arr[id][domainId]
            }
            await fetch(`${baseUri}${tokenUri}`)
                .then((response) => response.json())
                .then((data) => {
                    console.log('@tydra: token uri - ', tokenUri)
                    setTydra(data.resource)
                    setLoadingTydra(false)
                    setTimeout(() => {
                        updateLoadingTydra(false)
                    }, 2000)
                    setTimeout(() => {
                        setLoadingNoTydra(false)
                    }, 5000)
                })
        } catch (err) {
            setLoadingTydra(false)
            updateLoadingTydra(false)
            setTimeout(() => {
                setLoadingNoTydra(false)
            }, 5000)
        }
    }

    useEffect(() => {
        checkType()
        return () => {
            updateLoadingTydra(false)
            setLoadingNoTydra(false)
            setLoadingTydra(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className={styles.wrapper}>
            {loadingTydra ? (
                <div className={styles.loading}>
                    <ThreeDots color="basic" />
                </div>
            ) : (
                <div className={styles.tydraImg}>
                    {isTydra && tydra !== '' ? (
                        <Image
                            src={`data:image/png;base64,${tydra}`}
                            alt="tydra-img"
                            width={333}
                            height={333}
                        />
                    ) : tokenUri !== '' ? (
                        <img
                            //style={{ cursor: 'pointer' }}
                            width="100%"
                            src={`${baseUri}${tokenUri}`}
                            alt="nft-img"
                        />
                    ) : loadingNoTydra ? (
                        <div className={styles.loading}>
                            <ThreeDots color="basic" />
                        </div>
                    ) : (
                        <>
                            {type === 'account' ? (
                                <div style={{ marginBottom: '2%' }} />
                            ) : (
                                <></>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

export default Component
