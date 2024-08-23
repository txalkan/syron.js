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

function TyronApp({ Component, pageProps }: AppProps) {
    return (
        <>
            <Provider store={store}>
                <PersistGate persistor={persistor}>
                    <main className={GeistMono.className}>
                        <Component {...pageProps} />
                    </main>
                </PersistGate>
            </Provider>
        </>
    )
}

export default appWithTranslation(TyronApp)
