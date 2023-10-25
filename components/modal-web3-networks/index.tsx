import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useTranslation } from 'next-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'

export default function ConnectButton() {
    const { t } = useTranslation()
    const isLight = useSelector((state: RootState) => state.modal.isLight)

    // 4. Use modal hook
    const { open } = useWeb3Modal()

    return (
        <div
            onClick={() => open({ view: 'Networks' })}
            className={isLight ? 'actionBtnLight' : 'actionBtn'}
            style={{ width: '300px' }}
        >
            {t('SELECT NETWORK')}
            <w3m-network-button />
        </div>
    )
}
