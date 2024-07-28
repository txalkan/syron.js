import React from 'react'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { ZilPayBase } from '../../ZilPay/zilpay-base'
import { updateLoginInfoZilpay } from '../../../src/app/actions'
import { RootState } from '../../../src/app/reducers'
import { updateShowZilpay } from '../../../src/store/modal'
import { useTranslation } from 'next-i18next'
//@review import { updateTxList } from '../../../src/store/transactions'
import toastTheme from '../../../src/hooks/toastTheme'
import isZil from '../../../src/hooks/isZil'
import { $resolvedInfo } from '../../../src/store/resolvedInfo'
import { updateNet } from '../../../src/store/network'
import { useStore } from 'react-stores'

function Component() {
    const dispatch = useDispatch()
    const { t } = useTranslation()
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const resolvedInfo = useStore($resolvedInfo)
    const isZil_ = isZil(resolvedInfo?.version)

    const handleConnectZilPay = React.useCallback(async () => {
        try {
            const zilpay = new ZilPayBase()
            const zp = await zilpay.zilpay()
            const connected = await zp.wallet.connect()

            const network = zp.wallet.net
            updateNet(network)
            const address = zp.wallet.defaultAccount

            if (connected && address) {
                dispatch(updateLoginInfoZilpay(address))
                updateShowZilpay(true)
            }

            // const cache = window.localStorage.getItem(
            //     String(zp.wallet.defaultAccount?.base16)
            // )
            // if (cache) {
            //     updateTxList(JSON.parse(cache))
            // }
        } catch (err) {
            toast.warn(String(err), {
                position: 'top-right',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: toastTheme(isLight),
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch])

    const btnColor = () => {
        if (isZil_) {
            if (isLight) {
                return 'actionBtnBlueLight'
            } else {
                return 'actionBtnBlue'
            }
        } else {
            if (isLight) {
                return 'actionBtnLight'
            } else {
                return 'actionBtn'
            }
        }
    }

    function signIn(): void | PromiseLike<void> {
        throw new Error('Function not implemented.')
    }

    return (
        <div
            style={{
                display: 'flex',
                width: '100%',
                justifyContent: 'center',
                marginTop: '10%',
            }}
        >
            <div onClick={async () => await signIn()} className={btnColor()}>
                {t('Sign_In')}
            </div>
        </div>
    )
}

export default Component
