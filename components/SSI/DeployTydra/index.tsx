import { useStore } from 'effector-react'
import * as tyron from 'tyron'
import { $resolvedInfo } from '../../../src/store/resolvedInfo'
import styles from './styles.module.scss'
import { useTranslation } from 'next-i18next'
import { toast } from 'react-toastify'
import { useState } from 'react'
import toastTheme from '../../../src/hooks/toastTheme'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../src/app/reducers'
import smartContract from '../../../src/utils/smartContract'
import { ZilPayBase } from '../../ZilPay/zilpay-base'
import { setTxId, setTxStatusLoading } from '../../../src/app/actions'
import { updateModalTx, updateModalTxMinimized } from '../../../src/store/modal'
import ThreeDots from '../../Spinner/ThreeDots'
import Tydra from '../../../src/assets/logos/tydra.json'
import arweave from '../../../src/config/arweave'

function Component() {
    const { t } = useTranslation()
    const { getSmartContract } = smartContract()
    const dispatch = useDispatch()
    const zcrypto = tyron.Util.default.Zcrypto()
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const net = useSelector((state: RootState) => state.modal.net)
    const zilAddr = useSelector((state: RootState) => state.modal.zilAddr)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const resolvedInfo = useStore($resolvedInfo)
    const [isDeployed, setIsDeployed] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [tokenUri, setTokenUri] = useState('')

    const submitAr = async () => {
        setIsDeployed(false)
        setTokenUri('')
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
                setTokenUri(res.id)
                sendTxn()
            })
        } catch (err) {
            console.log(err)
        }
        setIsLoading(false)
    }

    const sendTxn = async () => {
        setIsLoading(true)
        const zilpay = new ZilPayBase()
        let tx = await tyron.Init.default.transaction(net)
        const domainId = '0x' + (await tyron.Util.default.HashString(resolvedInfo?.name!))
        console.log(domainId)
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
            type: 'ByStr32',
            value: tokenUri,
        }
        params.push(token_uri)

        dispatch(setTxStatusLoading('true'))
            updateModalTxMinimized(false)
            updateModalTx(true)
            await zilpay
                .call({
                    contractAddress: resolvedInfo?.addr!,
                    transition: 'MintTydraNft',
                    params: params as unknown as Record<string, unknown>[],
                    amount: String(0),
                })
                .then(async (res) => {
                    dispatch(setTxId(res.ID))
                    dispatch(setTxStatusLoading('submitted'))
                    tx = await tx.confirm(res.ID)
                    if (tx.isConfirmed()) {
                        setIsLoading(false)
                        setIsDeployed(false)
                        dispatch(setTxStatusLoading('confirmed'))
                        setTimeout(() => {
                            window.open(
                                `https://v2.viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
                            )
                        }, 1000)
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
            <div
                onClick={() => {
                    if (isDeployed) {
                        sendTxn()
                    } else {
                        submitAr()
                    }
                }}
                className={isDeployed ? styles.cardDeployed : styles.card}
            >
                <div className={styles.cardTitle3}>
                    {isLoading ? (
                        <ThreeDots color="basic" />
                    ) : !isDeployed ? (
                        'DEPLOY TYDRA'
                    ) : (
                        'SAVE DEPLOYMENT'
                    )}
                </div>
            </div>
        </div>
    )
}

export default Component
