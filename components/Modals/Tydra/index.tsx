import { useStore } from 'effector-react'
import {
    $investorItems,
    $modalInvestor,
    $modalTydra,
    updateInvestorModal,
    updateModalTx,
    updateModalTxMinimized,
    updateTydraModal,
} from '../../../src/store/modal'
import CloseReg from '../../../src/assets/icons/ic_cross.svg'
import CloseBlack from '../../../src/assets/icons/ic_cross_black.svg'
import stylesDark from './styles.module.scss'
import stylesLight from './styleslight.module.scss'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import * as tyron from 'tyron'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../src/app/reducers'
import Spinner from '../../Spinner'
import { Selector } from '../..'
import { useTranslation } from 'next-i18next'
import smartContract from '../../../src/utils/smartContract'
import routerHook from '../../../src/hooks/router'
import { $resolvedInfo } from '../../../src/store/resolvedInfo'
import Tydra from '../../../src/assets/logos/tydra.json'
import arweave from '../../../src/config/arweave'
import { ZilPayBase } from '../../ZilPay/zilpay-base'
import { setTxId, setTxStatusLoading } from '../../../src/app/actions'
import ThreeDots from '../../Spinner/ThreeDots'
import CloseIcoReg from '../../../src/assets/icons/ic_cross.svg'
import CloseIcoBlack from '../../../src/assets/icons/ic_cross_black.svg'

function Component() {
    const { t } = useTranslation()
    const { getSmartContract } = smartContract()
    const { navigate } = routerHook()
    const dispatch = useDispatch()
    const net = useSelector((state: RootState) => state.modal.net)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const modalTydra = useStore($modalTydra)
    const resolvedInfo = useStore($resolvedInfo)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const Close = isLight ? CloseBlack : CloseReg
    const CloseIco = isLight ? CloseIcoBlack : CloseIcoReg

    const [currency, setCurrency] = useState('')
    const [txName, setTxName] = useState('')
    const [res, setRes] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const username = resolvedInfo?.name
    const domain = resolvedInfo?.domain
    const domainNavigate = domain !== '' ? domain + '@' : ''

    const listCoin = tyron.Options.default.listCoin()
    const option = [...listCoin]

    const handleOnChange = (value) => {
        setCurrency(value)
    }

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
                setRes(res.id)
            })
        } catch (err) {
            console.log(err)
        }
        setIsLoading(false)
    }

    const sendTxn = async () => {
        setIsLoading(true)
        let freeList = false
        const init_addr = await tyron.SearchBarUtil.default.fetchAddr(
            net,
            'init',
            'did'
        )
        try {
            const get_free_list = await getSmartContract(
                init_addr,
                'tydra_free_list'
            )
            const freelist: Array<string> = get_free_list.result.tydra_free_list
            const is_free = freelist.filter(
                (val) => val === loginInfo.zilAddr.base16.toLowerCase()
            )
            if (is_free.length !== 0) {
                freeList = true
            }
        } catch {
            freeList = false
        }
        const zilpay = new ZilPayBase()
        let tx = await tyron.Init.default.transaction(net)
        const domainId =
            '0x' + (await tyron.Util.default.HashString(resolvedInfo?.name!))
        let params: any = []
        const id = {
            vname: 'id',
            type: 'String',
            value: freeList ? 'free' : currency.toLowerCase(),
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
            value: res,
        }
        params.push(token_uri)

        dispatch(setTxStatusLoading('true'))
        updateModalTxMinimized(false)
        updateModalTx(true)
        await zilpay
            .call({
                contractAddress: init_addr,
                transition: 'MintTydraNft',
                params: params as unknown as Record<string, unknown>[],
                amount: String(freeList ? 0 : 1000),
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
                    updateTydraModal(false)
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

    const toggleActive = (id: string) => {
        // updateDonation(null)
        // resetState()
        setCurrency('')
        if (id === txName) {
            setTxName('')
        } else {
            setTxName(id)
        }
    }

    const outerClose = () => {
        if (window.confirm('Do you really want to close the modal?')) {
            updateTydraModal(false)
        }
    }

    if (!modalTydra) {
        return null
    }

    return (
        <>
            <div onClick={outerClose} className={styles.outerWrapper} />
            <div className={styles.container}>
                <div className={styles.innerContainer}>
                    <div className={styles.headerWrapper}>
                        <div
                            onClick={() => updateTydraModal(false)}
                            className="closeIcon"
                        >
                            <Image
                                alt="ico-close"
                                src={Close}
                                width={15}
                                height={15}
                            />
                        </div>
                        <h5 className={styles.headerTxt}>Deploy TYDRA</h5>
                    </div>
                    <div className={styles.cardWrapper}>
                        <div
                            onClick={() => toggleActive('deploy')}
                            className={
                                txName === 'deploy'
                                    ? styles.cardActive
                                    : styles.card
                            }
                        >
                            <div>DEPLOY</div>
                        </div>
                        <div className={styles.cardActiveWrapper}>
                            {txName === 'deploy' && (
                                <div className={styles.cardRight}>
                                    <div className={styles.closeIcoWrapper}>
                                        <div
                                            onClick={() => toggleActive('')}
                                            className={styles.closeIco}
                                        >
                                            <Image
                                                width={10}
                                                src={CloseIco}
                                                alt="close-ico"
                                            />
                                        </div>
                                    </div>
                                    {res === '' ? (
                                        <div>
                                            <div className={styles.select}>
                                                <Selector
                                                    option={option}
                                                    onChange={handleOnChange}
                                                    placeholder={t(
                                                        'Select coin'
                                                    )}
                                                />
                                            </div>
                                            {currency !== '' && (
                                                <div
                                                    className={
                                                        styles.btnWrapper
                                                    }
                                                >
                                                    <div
                                                        onClick={submitAr}
                                                        className={
                                                            isLight
                                                                ? 'actionBtnLight'
                                                                : 'actionBtn'
                                                        }
                                                    >
                                                        {isLoading ? (
                                                            <ThreeDots color="basic" />
                                                        ) : (
                                                            'DEPLOY TYDRA'
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className={styles.btnWrapper}>
                                            <div
                                                onClick={sendTxn}
                                                className={
                                                    isLight
                                                        ? 'actionBtnLight'
                                                        : 'actionBtn'
                                                }
                                            >
                                                {isLoading ? (
                                                    <ThreeDots color="basic" />
                                                ) : (
                                                    'SEND TYDRA'
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    {/* <div className={styles.contentWrapper}>
                        <div className={styles.select}>
                            <Selector
                                option={option}
                                onChange={handleOnChange}
                                placeholder={t('Select coin')}
                            />
                        </div>
                        {currency !== '' && (
                            <div className={styles.btnWrapper}>
                                <div
                                    onClick={submitAr}
                                    className={
                                        isLight ? 'actionBtnLight' : 'actionBtn'
                                    }
                                >
                                    {isLoading ? (
                                        <ThreeDots color="basic" />
                                    ) : (
                                        'DEPLOY TYDRA'
                                    )}
                                </div>
                            </div>
                        )}
                    </div> */}
                </div>
            </div>
        </>
    )
}

export default Component
