import { useStore } from 'effector-react'
import {
    $modalNewDefi,
    $modalNft,
    $modalTydra,
    $selectedNft,
    $tydra,
    updateModalTx,
    updateModalTxMinimized,
    updateNewDefiModal,
    updateNftModal,
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
import { AddFunds, Donate, SearchBarWallet, Selector } from '../..'
import { useTranslation } from 'next-i18next'
import smartContract from '../../../src/utils/smartContract'
import routerHook from '../../../src/hooks/router'
import { $resolvedInfo } from '../../../src/store/resolvedInfo'
import CloseIcoReg from '../../../src/assets/icons/ic_cross.svg'
import CloseIcoBlack from '../../../src/assets/icons/ic_cross_black.svg'
import { $donation, updateDonation } from '../../../src/store/donation'
import { toast } from 'react-toastify'
import toastTheme from '../../../src/hooks/toastTheme'
import fetch from '../../../src/hooks/fetch'
import { $arconnect } from '../../../src/store/arconnect'
import useArConnect from '../../../src/hooks/useArConnect'
import { updateOriginatorAddress } from '../../../src/store/originatorAddress'
import { ZilPayBase } from '../../ZilPay/zilpay-base'
import { setTxId, setTxStatusLoading } from '../../../src/app/actions'

function Component() {
    const zcrypto = tyron.Util.default.Zcrypto()
    const { t } = useTranslation()
    const { connect } = useArConnect()
    const { getSmartContract } = smartContract()
    const { navigate } = routerHook()
    const dispatch = useDispatch()
    const net = useSelector((state: RootState) => state.modal.net)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const modalNewDefi = useStore($modalNewDefi)
    const selectedNft = useStore($selectedNft)
    const resolvedInfo = useStore($resolvedInfo)
    const donation = useStore($donation)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const styles = isLight ? stylesLight : stylesDark
    const Close = isLight ? CloseBlack : CloseReg
    const CloseIco = isLight ? CloseIcoBlack : CloseIcoReg

    const [loading, setLoading] = useState(false)
    const [didDomain, setDidDomain] = useState(Array())
    const [selectedDomain, setSelectedDomain] = useState('')
    const [step, setStep] = useState(1)

    const outerClose = () => {
        if (window.confirm('Are you sure about closing this window?')) {
            setSelectedDomain('')
            updateDonation(null)
            updateNewDefiModal(false)
        }
    }

    if (!modalNewDefi) {
        return null
    }

    return (
        <>
            <div onClick={outerClose} className={styles.outerWrapper} />
            <div className={styles.container}>
                <div className={styles.innerContainer}>
                    <div className={styles.headerWrapper}>
                        <div onClick={outerClose} className="closeIcon">
                            <Image
                                alt="ico-close"
                                src={Close}
                                width={15}
                                height={15}
                            />
                        </div>
                        <h5 className={styles.headerTxt}>DEFIxWALLET</h5>
                    </div>
                    <div className={styles.content}>
                        {step === 1 ? (
                            <div
                                onClick={() => setStep(2)}
                                className={
                                    isLight ? 'actionBtnLight' : 'actionBtn'
                                }
                                style={{ width: '300px' }}
                            >
                                <div>CREATE</div>
                            </div>
                        ) : (
                            <div
                                onClick={() => setStep(1)}
                                className={
                                    isLight ? 'actionBtnLight' : 'actionBtn'
                                }
                                style={{ width: '300px' }}
                            >
                                <div>Save SUBDOMAIN</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Component
