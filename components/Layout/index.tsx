import { ReactNode, useEffect } from 'react'
import Head from 'next/head'
import { Header, Footer, Body } from '..'
import { updateShowZilpay } from '../../src/store/modal'
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'
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
    const isIncognito = useSelector(
        (state: RootState) => state.modal.isIncognito
    )
    // const isLight = useSelector((state: RootState) => state.modal.isLight)

    const bg = loginInfo.isLight ? 'bglight' : 'bg'

    const checkZilpayNetwork = async () => {
        if (loginInfo.zilAddr) {
            // const wallet = new ZilPayBase()
            // const zp = await wallet.zilpay()
            // const network = zp.wallet.net
            updateShowZilpay(true)
            // if (network !== loginInfo.net) {
            //     toast.info(`Network changed to ${network}`, {
            //         position: 'top-center',
            //         autoClose: 2000,
            //         hideProgressBar: false,
            //         closeOnClick: true,
            //         pauseOnHover: true,
            //         draggable: true,
            //         progress: undefined,
            //         theme: toastTheme(isLight),
            //         toastId: 2,
            //     })
            // }
        }
    }

    useEffect(() => {
        Router.push({}, asPath, { locale: language })
        if (!isIncognito) {
            checkZilpayNetwork()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [language])

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
            <div id={bg} />
            <div id="wrapper">
                <div className="innerWrapper">
                    <Header />
                    <Body>{children}</Body>
                </div>
                <Footer />
            </div>
        </div>
    )
}

export default LayoutSearch
