import '../styles/css/fontawesome-all.min.css'
import '../styles/css/main.css'
import '../styles/css/noscript.css'
import '../styles/scss/variables/_breakpoints.scss'
import '../styles/scss/variables/_colors.scss'
import '../styles/scss/_normalizer.scss'
import '../styles/scss/application.scss'
import 'react-toastify/dist/ReactToastify.css'

import type { AppProps } from 'next/app'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from '../src/app/store'
import { appWithTranslation } from 'next-i18next'
//import { MetaMaskUIProvider } from '@metamask/sdk-react-ui'

import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'

import { WagmiConfig } from 'wagmi'
import {
    zkSync,
    zkSyncTestnet,
    polygonZkEvm,
    polygonZkEvmTestnet,
} from 'wagmi/chains'
import { useEffect, useState } from 'react'

// 1. Get projectId
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || ''

// 2. Create wagmiConfig

const metadata = {
    name: 'Tyron',
    description: 'Tyron SSI Protocol',
    url: 'https://tyron.network',
    icons: ['https://avatars.githubusercontent.com/u/37784886'], //@pending
}

const chains = [zkSync, zkSyncTestnet, polygonZkEvm, polygonZkEvmTestnet]
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })

// 3. Create modal
createWeb3Modal({ wagmiConfig, projectId, chains })

function Tyron({ Component, pageProps }: AppProps) {
    const [ready, setReady] = useState(false)

    useEffect(() => {
        setReady(true)
    }, [])

    return (
        <>
            {ready ? (
                <WagmiConfig config={wagmiConfig}>
                    {/* <MetaMaskUIProvider
                        sdkOptions={{
                            dappMetadata: {
                                name: 'Tyron',
                            },
                        }}
                    > */}
                    <Provider store={store}>
                        <PersistGate persistor={persistor}>
                            <Component {...pageProps} />
                        </PersistGate>
                    </Provider>
                    {/* </MetaMaskUIProvider> */}
                </WagmiConfig>
            ) : null}
        </>
    )
}

export default appWithTranslation(Tyron)
