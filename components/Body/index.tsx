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
    UpdateNftModal,
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
    $modalTransfer,
    $modalNft,
} from '../../src/store/modal'
import BatchTransfer from '../Modals/BatchTransfer'

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
    const modalNft = useStore($modalNft)
    const modalTransfer = useStore($modalTransfer)

    return (
        <>
            {!menuOn && !modalTx && !modalDashboard && (
                <>
                    <NewSSIModal />
                    <GetStartedModal />
                    <BuyNFTModal />
                    <NewMotionsModal />
                    <TydraModal />
                    <UpdateNftModal />
                    <BatchTransfer />
                </>
            )}
            {!menuOn && !modalTx && <DashboardModal />}
            {!menuOn && <TransactionStatus />}
            {loading && !modalNewSsi ? (
                <div style={{ marginTop: '10vh' }}>
                    <Spinner />
                </div>
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
                        !modalNft &&
                        !modalTransfer &&
                        children}
                </>
            )}
        </>
    )
}

export default Body
