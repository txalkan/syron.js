import { ReactNode } from 'react'
import { useStore } from 'effector-react'
import Head from 'next/head'
import { Header, Footer, Menu, Dashboard } from '..'
import { $menuOn } from '../../src/store/menuOn'
import { $loading } from '../../src/store/loading'
import {
    $modalDashboard,
    $modalNewSsi,
    $modalTx,
    $modalGetStarted,
    $modalBuyNft,
    $modalAddFunds,
    $modalWithdrawal,
    $modalNewMotions,
} from '../../src/store/modal'

interface LayoutProps {
    children: ReactNode
}

function LayoutSearch(props: LayoutProps) {
    const { children } = props
    const menuOn = useStore($menuOn)
    const loading = useStore($loading)
    const modalDashboard = useStore($modalDashboard)
    const modalNewSsi = useStore($modalNewSsi)
    const modalTx = useStore($modalTx)
    const modalGetStarted = useStore($modalGetStarted)
    const modalBuyNft = useStore($modalBuyNft)
    const modalAddFunds = useStore($modalAddFunds)
    const modalWithdrawal = useStore($modalWithdrawal)
    const modalNewMotions = useStore($modalNewMotions)

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
            <div id="bg" />
            <div id="wrapper">
                <Header />
                {loading ? (
                    <i
                        style={{ color: '#ffff32' }}
                        className="fa fa-lg fa-spin fa-circle-notch"
                        aria-hidden="true"
                    ></i>
                ) : (
                    <>
                        {!menuOn &&
                            !modalNewSsi &&
                            !modalTx &&
                            !modalGetStarted &&
                            !modalBuyNft &&
                            !modalAddFunds &&
                            !modalDashboard &&
                            !modalWithdrawal &&
                            !modalNewMotions &&
                            children}
                    </>
                )}
                <Menu />
                <Dashboard />
                <Footer />
            </div>
        </div>
    )
}

export default LayoutSearch
