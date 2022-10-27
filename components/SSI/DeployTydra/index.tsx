import { useStore } from 'effector-react'
import * as tyron from 'tyron'
import { $resolvedInfo } from '../../../src/store/resolvedInfo'
import styles from './styles.module.scss'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../src/app/reducers'
import { ZilPayBase } from '../../ZilPay/zilpay-base'
import { setTxId, setTxStatusLoading } from '../../../src/app/actions'
import { updateModalTx, updateModalTxMinimized } from '../../../src/store/modal'
import ThreeDots from '../../Spinner/ThreeDots'
import Tydra from '../../../src/assets/logos/tydra.json'
import arweave from '../../../src/config/arweave'
import routerHook from '../../../src/hooks/router'

function Component() {
    const { navigate } = routerHook()
    const dispatch = useDispatch()
    const net = useSelector((state: RootState) => state.modal.net)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const resolvedInfo = useStore($resolvedInfo)
    const [isLoading, setIsLoading] = useState(false)
    const username = resolvedInfo?.name
    const domain = resolvedInfo?.domain
    const domainNavigate = domain !== '' ? domain + '@' : ''

    const submitAr = async () => {
        setIsLoading(true)
        try {
            const data = {
                name: 'Nawelito',
                net: 'tyron.network',
                first_owner: loginInfo?.arAddr,
                resource: Tydra.img,
            }

            const transaction = await arweave.createTransaction({
                data: JSON.stringify(data),
            })

            transaction.addTag('Content-Type', 'application/json')

            window.arweaveWallet.dispatch(transaction).then((res) => {
                sendTxn(res.id)
            })
        } catch (err) {
            console.log(err)
        }
        setIsLoading(false)
    }

    const sendTxn = async (tokenUri) => {
        setIsLoading(true)
        const zilpay = new ZilPayBase()
        let tx = await tyron.Init.default.transaction(net)
        const domainId =
            '0x' + (await tyron.Util.default.HashString(resolvedInfo?.name!))
        let params: any = []
        const id = {
            vname: 'id',
            type: 'String',
            value: 'zil',
        }
        params.push(id)
        const token_id = {
            vname: 'token_id',
            type: 'ByStr32',
            value: domainId,
        }
        params.push(token_id)
        const token_uri = {
            vname: 'token_uri',
            type: 'String',
            value: tokenUri,
        }
        params.push(token_uri)

        const init_addr = await tyron.SearchBarUtil.default.fetchAddr(
            net,
            'init',
            'did'
        )

        dispatch(setTxStatusLoading('true'))
        updateModalTxMinimized(false)
        updateModalTx(true)
        await zilpay
            .call({
                contractAddress: init_addr,
                transition: 'MintTydraNft',
                params: params as unknown as Record<string, unknown>[],
                amount: String(1000),
            })
            .then(async (res) => {
                dispatch(setTxId(res.ID))
                dispatch(setTxStatusLoading('submitted'))
                tx = await tx.confirm(res.ID)
                if (tx.isConfirmed()) {
                    setIsLoading(false)
                    dispatch(setTxStatusLoading('confirmed'))
                    setTimeout(() => {
                        window.open(
                            `https://v2.viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                        )
                    }, 1000)
                    navigate(`/${domainNavigate}${username}/didx`)
                } else if (tx.isRejected()) {
                    setIsLoading(false)
                    dispatch(setTxStatusLoading('failed'))
                }
            })
            .catch((err) => {
                setIsLoading(false)
                dispatch(setTxStatusLoading('rejected'))
                updateModalTxMinimized(false)
                updateModalTx(true)
                throw err
            })
    }

    return (
        <div className={styles.cardActiveWrapper}>
            <div onClick={submitAr} className={styles.card}>
                <div className={styles.cardTitle3}>
                    {isLoading ? <ThreeDots color="basic" /> : 'DEPLOY TYDRA'}
                </div>
            </div>
        </div>
    )
}

export default Component
