import '../src/styles/css/fontawesome-all.min.css'
import '../src/styles/css/main.css'
import '../src/styles/css/noscript.css'
import '../src/styles/scss/variables/_breakpoints.scss'
import '../src/styles/scss/variables/_colors.scss'
import '../src/styles/scss/_normalizer.scss'
import '../src/styles/scss/application.scss'

import type { AppProps } from 'next/app'
import { Provider } from 'react-redux'
import { store } from '../src/app/store'

function SSIBrowser({ Component, pageProps }: AppProps) {
    //return <Component {...pageProps} />
    return (
        <>
            <Provider store={store}>
                <Component {...pageProps} />
            </Provider>
        </>
    )
}

export default SSIBrowser