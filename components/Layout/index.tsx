import { ReactNode, useEffect } from 'react'
import { useStore } from 'effector-react'
import Head from 'next/head'
//@todo-i what is the status of the unused modals?
import {
    Header,
    Footer,
    Menu,
    Dashboard,
    NewSSIModal,
    AddFundsModal,
    BuyNFTModal,
    DashboardModal,
    GetStartedModal,
    NewMotionsModal,
    TransactionStatus,
    WithdrawalModal,
    Spinner,
    InvestorModal,
    ZilPay,
} from '..'
import { $menuOn } from '../../src/store/menuOn'
import { $loading, $loadingDoc } from '../../src/store/loading'
import {
    $modalDashboard,
    $modalNewSsi,
    $modalTx,
    $modalGetStarted,
    $modalBuyNft,
    $modalAddFunds,
    $modalWithdrawal,
    $modalNewMotions,
    $modalInvestor,
    $showZilpay,
    updateShowZilpay,
} from '../../src/store/modal'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'
import { ZilPayBase } from '../ZilPay/zilpay-base'
import { UpdateNet } from '../../src/app/actions'
import { toast } from 'react-toastify'
import toastTheme from '../../src/hooks/toastTheme'

interface LayoutProps {
    children: ReactNode
}

function LayoutSearch(props: LayoutProps) {
    const { children } = props
    const { asPath } = useRouter()
    const Router = useRouter()
    const dispatch = useDispatch()
    const language = useSelector((state: RootState) => state.modal.lang)
    const menuOn = useStore($menuOn)
    const loading = useStore($loading)
    const loadingDoc = useStore($loadingDoc)
    const modalDashboard = useStore($modalDashboard)
    const modalNewSsi = useStore($modalNewSsi)
    const modalTx = useStore($modalTx)
    const modalGetStarted = useStore($modalGetStarted)
    const modalBuyNft = useStore($modalBuyNft)
    const modalNewMotions = useStore($modalNewMotions)
    const modalAddFunds = useStore($modalAddFunds)
    const modalWithdrawal = useStore($modalWithdrawal)
    const modalInvestor = useStore($modalInvestor)
    const loginInfo = useSelector((state: RootState) => state.modal)
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const showZilpay = useStore($showZilpay)

    const bg = loginInfo.isLight ? 'bglight' : 'bg'

    const checkZilpayNetwork = async () => {
        if (loginInfo.zilAddr) {
            const wallet = new ZilPayBase()
            const zp = await wallet.zilpay()
            const network = zp.wallet.net
            if (network !== loginInfo.net) {
                updateShowZilpay(true)
                toast.info(`Network changed to ${network}`, {
                    position: 'top-center',
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: toastTheme(isLight),
                    toastId: 2,
                })
            }
        }
    }

    useEffect(() => {
        Router.push({}, asPath, { locale: language })
        checkZilpayNetwork()
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
                {!loadingDoc && <Header />}
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
                {!modalNewSsi &&
                    !modalGetStarted &&
                    !modalBuyNft &&
                    !modalAddFunds &&
                    !modalWithdrawal &&
                    !modalInvestor &&
                    !modalNewMotions && (
                        <>
                            <Menu />
                            <Dashboard />
                        </>
                    )}
                <Footer />
            </div>
        </div>
    )
}

export default LayoutSearch
