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
    TydraModal,
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
    $modalTydra,
} from '../../src/store/modal'

interface LayoutProps {
    children: any
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
    const modalTydra = useStore($modalTydra)

    return (
        <>
            {!menuOn && !modalTx && !modalDashboard && (
                <>
                    <NewSSIModal />
                    <GetStartedModal />
                    <BuyNFTModal />
                    <NewMotionsModal />
                    <TydraModal />
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
                        !modalTydra &&
                        children}
                </>
            )}
        </>
    )
}

export default Body
