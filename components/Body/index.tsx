import { ReactNode } from 'react'
import { useStore } from 'effector-react'
import {
    NewSSIModal,
    BuyNFTModal,
    DashboardModal,
    GetStartedModal,
    NewMotionsModal,
    TransactionStatus,
    Spinner,
} from '..'
import { $menuOn } from '../../src/store/menuOn'
import { $loading } from '../../src/store/loading'
import {
    $modalDashboard,
    $modalNewSsi,
    $modalTx,
    $modalGetStarted,
    $modalBuyNft,
    $modalNewMotions,
} from '../../src/store/modal'

interface LayoutProps {
    children: ReactNode
}

function Body(props: LayoutProps) {
    const { children } = props
    const menuOn = useStore($menuOn)
    const loading = useStore($loading)
    const modalDashboard = useStore($modalDashboard)
    const modalNewSsi = useStore($modalNewSsi)
    const modalTx = useStore($modalTx)
    const modalGetStarted = useStore($modalGetStarted)
    const modalBuyNft = useStore($modalBuyNft)
    const modalNewMotions = useStore($modalNewMotions)

    return (
        <>
            {!menuOn && !modalTx && !modalDashboard && (
                <>
                    <NewSSIModal />
                    <GetStartedModal />
                    <BuyNFTModal />
                    <NewMotionsModal />
                </>
            )}
            {!menuOn && !modalTx && <DashboardModal />}
            {!menuOn && <TransactionStatus />}
            {loading && !modalNewSsi ? (
                <Spinner />
            ) : (
                <>
                    {!menuOn &&
                        !modalNewSsi &&
                        !modalTx &&
                        !modalGetStarted &&
                        !modalBuyNft &&
                        !modalDashboard &&
                        !modalNewMotions &&
                        children}
                </>
            )}
        </>
    )
}

export default Body
