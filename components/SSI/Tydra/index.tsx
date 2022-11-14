import styles from './styles.module.scss'
import * as tyron from 'tyron'
import { useSelector } from 'react-redux'
import { RootState } from '../../../src/app/reducers'
import { useStore } from 'effector-react'
import { $resolvedInfo } from '../../../src/store/resolvedInfo'
import { useEffect, useState } from 'react'
import smartContract from '../../../src/utils/smartContract'
import ThreeDots from '../../Spinner/ThreeDots'
import { updateLoading, updateLoadingTydra } from '../../../src/store/loading'

function Component() {
    const { getSmartContract } = smartContract()
    const net = useSelector((state: RootState) => state.modal.net)
    const resolvedInfo = useStore($resolvedInfo)
    const [loadingTydra, setLoadingTydra] = useState(true)
    const [tydra, setTydra] = useState('')

    const fetchTydra = async () => {
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
            let tokenUri = arr[0][domainId]
            if (!tokenUri) {
                tokenUri = arr[1][domainId]
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
        fetchTydra()
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
                    {tydra !== '' && (
                        <img
                            className={styles.tydraImg}
                            src={`data:image/png;base64,${tydra}`}
                            alt="tydra-img"
                        />
                    )}
                </>
            )}
        </div>
    )
}

export default Component
