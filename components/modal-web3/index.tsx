import {
    useWeb3Modal,
    useWeb3ModalEvents,
    useWeb3ModalState,
} from '@web3modal/wagmi/react'
import { useTranslation } from 'next-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'

export default function ConnectButton() {
    const { t } = useTranslation()
    const isLight = useSelector((state: RootState) => state.modal.isLight)

    // @dev Modal hooks
    const { open } = useWeb3Modal()
    //const state = useWeb3ModalState()
    //const events = useWeb3ModalEvents()

    return (
        <>
            <div
                onClick={() => open()}
                className={isLight ? 'actionBtnLight' : 'actionBtn'}
                style={{ width: '300px', textTransform: 'none' }}
            >
                WalletConnect
                <w3m-button />
            </div>
            {/* <w3m-button />
            <w3m-network-button />
            <w3m-connect-button />
            <w3m-account-button />
            <button onClick={() => open()}>Connect Wallet</button>
            <button onClick={() => open({ view: 'Networks' })}>
                Choose Network
            </button> */}
            {/* <button onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}>
                Toggle Theme Mode
              </button> */}
            {/* <pre>{JSON.stringify(state, null, 2)}</pre> */}
            {/* <pre>{JSON.stringify({ themeMode, themeVariables }, null, 2)}</pre> */}
            {/* <pre>{JSON.stringify(events, null, 2)}</pre> */}
        </>
    )
}
