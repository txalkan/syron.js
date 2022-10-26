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
import Arweave from 'arweave'
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

    const submitAr = async () => {
        setIsLoading(true)
        try {
            const data = {
                name: 'Nawelito',
                net: 'tyron.network',
                owner: loginInfo?.arAddr,
                resource: Tydra.img,
            }

            const transaction = await arweave.createTransaction({
                data: JSON.stringify(data),
            })

            transaction.addTag('Content-Type', 'application/json')

            window.arweaveWallet.dispatch(transaction).then((res) => {
                console.log(res)
            })
        } catch (err) {
            console.log(err)
        }
        setIsLoading(false)
    }

    return (
        <div className={styles.cardActiveWrapper}>
            <div
                onClick={() => {
                    submitAr()
                    // setIsLoading(true)
                    // setTimeout(() => {
                    //     setIsDeployed(!isDeployed)
                    //     setIsLoading(false)
                    // }, 1000)
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
