import { ReactNode, useEffect } from 'react'
import Head from 'next/head'
import { Header, Footer, Body } from '..'
import { updateShowZilpay } from '../../src/store/modal'
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'
// import { initJuno } from '@junobuild/core-peer'
// import { ZilPayBase } from '../ZilPay/zilpay-base'
// import { toast } from 'react-toastify'
// import toastTheme from '../../src/hooks/toastTheme'

interface LayoutProps {
    children: ReactNode
}

function LayoutSearch(props: LayoutProps) {
    const { children } = props
    const { asPath } = useRouter()
    const Router = useRouter()
    const language = useSelector((state: RootState) => state.modal.lang)
    const loginInfo = useSelector((state: RootState) => state.modal)
    // const isIncognito = useSelector(
    //     (state: RootState) => state.modal.isIncognito
    // )
    // const isLight = useSelector((state: RootState) => state.modal.isLight)
    // const bg = loginInfo.isLight ? 'bglight' : 'bg'

    useEffect(() => {
        Router.push({}, asPath, { locale: language })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [language])

    useEffect(() => {
        // Remove existing bodylight and body classes
        document.body.classList.remove('bodylight', 'body')

        // Add the appropriate class based on light or dark mode
        if (loginInfo.isLight) {
            document.body.classList.add('bodylight')
        } else {
            document.body.classList.add('body')
        }
    }, [loginInfo.isLight])

    // useEffect(() => {
    //     ;(async () =>
    //         await initJuno({
    //             satelliteId: '7oy2c-ziaaa-aaaal-adqsq-cai',
    //         }))()
    // }, [])

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <Head>
                <title>TYRON</title>
            </Head>
            {/* <div id={bg} /> */}
            <div id="wrapper">
                <div className="innerWrapper">
                    <Header />
                    <Body>{children}</Body>
                </div>
                {/* <Footer /> */}
            </div>
        </div>
    )
}

export default LayoutSearch
