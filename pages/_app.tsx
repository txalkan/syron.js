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
// import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import AuthGuard from './AuthGuard'
import type { _SERVICE as siwbService } from './idls/ic_siwb_provider.d.ts'
import { idlFactory as siwbIdl } from './idls/ic_siwb_provider.idl'
import { SiwbIdentityProvider } from 'ic-use-siwb-identity'

function TyronApp({ Component, pageProps }: AppProps) {
    return (
        <SiwbIdentityProvider<siwbService>
            canisterId={
                process.env.NEXT_PUBLIC_SIWB! ?? 'mwm4a-eiaaa-aaaah-aebnq-cai'
            }
            idlFactory={siwbIdl}
            httpAgentOptions={{
                host: 'https://icp-api.io',
            }}
        >
            <Provider store={store}>
                <PersistGate persistor={persistor}>
                    <main className={GeistMono.className}>
                        <Component {...pageProps} />
                    </main>
                </PersistGate>
            </Provider>
        </SiwbIdentityProvider>
    )
}

export default appWithTranslation(TyronApp)
