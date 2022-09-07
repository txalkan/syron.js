import React from 'react'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { ZilPayBase } from '../../ZilPay/zilpay-base'
import { updateLoginInfoZilpay, UpdateNet } from '../../../src/app/actions'
import { RootState } from '../../../src/app/reducers'
import { updateShowZilpay } from '../../../src/store/modal'
import { useTranslation } from 'next-i18next'
import { updateTxList } from '../../../src/store/transactions'
import toastTheme from '../../../src/hooks/toastTheme'

function Component() {
    const dispatch = useDispatch()
    const { t } = useTranslation()
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const isZil = window.location.pathname.includes('/zil')

    const handleConnect = React.useCallback(async () => {
        try {
            const wallet = new ZilPayBase()
            const zp = await wallet.zilpay()
            const connected = await zp.wallet.connect()

            const network = zp.wallet.net
            dispatch(UpdateNet(network))

            const address = zp.wallet.defaultAccount

            if (connected && address) {
                dispatch(updateLoginInfoZilpay(address))
                updateShowZilpay(true)
            }

            const cache = window.localStorage.getItem(
                String(zp.wallet.defaultAccount?.base16)
            )
            if (cache) {
                updateTxList(JSON.parse(cache))
            }
        } catch (err) {
            toast.error(String(err), {
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
        if (isZil) {
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

    return (
        <div
            style={{
                display: 'flex',
                width: '100%',
                justifyContent: 'center',
                marginTop: '10%',
            }}
        >
            <div onClick={handleConnect} className={btnColor()}>
                {t('CONNECT')}
            </div>
        </div>
    )
}

export default Component
