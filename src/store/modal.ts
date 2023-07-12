import { createDomain } from 'effector'

const modalDashboardDomain = createDomain()
export const updateModalDashboard = modalDashboardDomain.createEvent<
    boolean | false
>()
export const $modalDashboard = modalDashboardDomain
    .createStore<boolean | false>(false)
    .on(updateModalDashboard, (_, payload) => payload)

const modalNewSsiDomain = createDomain()
export const updateModalNewSsi = modalNewSsiDomain.createEvent<
    boolean | false
>()
export const $modalNewSsi = modalNewSsiDomain
    .createStore<boolean | false>(false)
    .on(updateModalNewSsi, (_, payload) => payload)

const modalTxDomain = createDomain()
export const updateModalTx = modalTxDomain.createEvent<boolean | false>()
export const $modalTx = modalTxDomain
    .createStore<boolean | false>(false)
    .on(updateModalTx, (_, payload) => payload)

const modalTxDomainMinimized = createDomain()
export const updateModalTxMinimized = modalTxDomainMinimized.createEvent<
    boolean | false
>()
export const $modalTxMinimized = modalTxDomainMinimized
    .createStore<boolean | false>(false)
    .on(updateModalTxMinimized, (_, payload) => payload)

const modalGetStartedDomain = createDomain()
export const updateModalGetStarted = modalGetStartedDomain.createEvent<
    boolean | false
>()
export const $modalGetStarted = modalGetStartedDomain
    .createStore<boolean | false>(false)
    .on(updateModalGetStarted, (_, payload) => payload)

const modalBuyNftDomain = createDomain()
export const updateModalBuyNft = modalBuyNftDomain.createEvent<
    boolean | false
>()
export const $modalBuyNft = modalBuyNftDomain
    .createStore<boolean | false>(false)
    .on(updateModalBuyNft, (_, payload) => payload)

const modalWithdrawalDomain = createDomain()
export const updateModalWithdrawal = modalWithdrawalDomain.createEvent<
    boolean | false
>()
export const $modalWithdrawal = modalWithdrawalDomain
    .createStore<boolean | false>(false)
    .on(updateModalWithdrawal, (_, payload) => payload)

const modalNewMotionsDomain = createDomain()
export const updateNewMotionsModal = modalNewMotionsDomain.createEvent<
    boolean | false
>()
export const $modalNewMotions = modalNewMotionsDomain
    .createStore<boolean | false>(false)
    .on(updateNewMotionsModal, (_, payload) => payload)

const modalHodlerAccountDomain = createDomain()
export const updateHodlerModal = modalHodlerAccountDomain.createEvent<
    boolean | false
>()
export const $modalInvestor = modalHodlerAccountDomain
    .createStore<boolean | false>(false)
    .on(updateHodlerModal, (_, payload) => payload)

const modalTydraDomain = createDomain()
export const updateTydraModal = modalTydraDomain.createEvent<boolean | false>()
export const $modalTydra = modalTydraDomain
    .createStore<boolean | false>(false)
    .on(updateTydraModal, (_, payload) => payload)

const modalNftDomain = createDomain()
export const updateNftModal = modalNftDomain.createEvent<boolean | false>()
export const $modalNft = modalNftDomain
    .createStore<boolean | false>(false)
    .on(updateNftModal, (_, payload) => payload)

const modalNewDefi = createDomain()
export const updateNewDefiModal = modalNewDefi.createEvent<boolean | false>()
export const $modalNewDefi = modalNewDefi
    .createStore<boolean | false>(false)
    .on(updateNewDefiModal, (_, payload) => payload)

const newDefiStep = createDomain()
export const updateNewDefiStep = newDefiStep.createEvent<number>()
export const $newDefiStep = newDefiStep
    .createStore<number>(1)
    .on(updateNewDefiStep, (_, payload) => payload)

const modalTransferDomain = createDomain()
export const updateTransferModal = modalTransferDomain.createEvent<
    boolean | false
>()
export const $modalTransfer = modalTransferDomain
    .createStore<boolean | false>(false)
    .on(updateTransferModal, (_, payload) => payload)

const showZilpayDomain = createDomain()
export const updateShowZilpay = showZilpayDomain.createEvent<boolean | false>()
export const $showZilpay = showZilpayDomain
    .createStore<boolean | false>(false)
    .on(updateShowZilpay, (_, payload) => payload)

const showSearchBar = createDomain()
export const updateShowSearchBar = showSearchBar.createEvent<boolean | false>()
export const $showSearchBar = showSearchBar
    .createStore<boolean | false>(false)
    .on(updateShowSearchBar, (_, payload) => payload)

const selectedCurrencyDomain = createDomain()
export const updateSelectedCurrency =
    selectedCurrencyDomain.createEvent<string>()
export const $selectedCurrency = selectedCurrencyDomain
    .createStore<string | null>(null)
    .on(updateSelectedCurrency, (_, payload) => payload)

const selectedCurrencyBalDomain = createDomain()
export const updateSelectedCurrencyBal =
    selectedCurrencyBalDomain.createEvent<any>()
export const $selectedCurrencyBal = selectedCurrencyBalDomain
    .createStore<any | null>(null)
    .on(updateSelectedCurrencyBal, (_, payload) => payload)

const dashboardStateDomain = createDomain()
export const updateDashboardState = dashboardStateDomain.createEvent<any>()
export const $dashboardState = dashboardStateDomain
    .createStore<any | null>(null)
    .on(updateDashboardState, (_, payload) => payload)

const zilpayBalanceDomain = createDomain()
export const updateZilpayBalance = zilpayBalanceDomain.createEvent<number>()
export const $zilpayBalance = zilpayBalanceDomain
    .createStore<number | null>(null)
    .on(updateZilpayBalance, (_, payload) => payload)

const txTypeDomain = createDomain()
export const updateTxType = txTypeDomain.createEvent<any>()
export const $txType = txTypeDomain
    .createStore<any | null>(null)
    .on(updateTxType, (_, payload) => payload)

const xpointsBalanceDomain = createDomain()
export const updateXpointsBalance = xpointsBalanceDomain.createEvent<number>()
export const $xpointsBalance = xpointsBalanceDomain
    .createStore<number | null>(null)
    .on(updateXpointsBalance, (_, payload) => payload)

const investorItemsDomain = createDomain()
export const updateInvestorItems = investorItemsDomain.createEvent<any>()
export const $investorItems = investorItemsDomain
    .createStore<any | null>(null)
    .on(updateInvestorItems, (_, payload) => payload)

const domainInputDomain = createDomain()
export const updateSubdomain = domainInputDomain.createEvent<string>()
export const $subdomainInput = domainInputDomain
    .createStore<string>('')
    .on(updateSubdomain, (_, payload) => payload)

const domainAddrDomain = createDomain()
export const updateDomainAddr = domainAddrDomain.createEvent<string>()
export const $domainAddr = domainAddrDomain
    .createStore<string>('')
    .on(updateDomainAddr, (_, payload) => payload)

const domainLegendDomain = createDomain()
export const updateDomainLegend = domainLegendDomain.createEvent<string>()
export const $domainLegend = domainLegendDomain
    .createStore<string>('save')
    .on(updateDomainLegend, (_, payload) => payload)

const domainLegend2Domain = createDomain()
export const updateDomainLegend2 = domainLegend2Domain.createEvent<string>()
export const $domainLegend2 = domainLegend2Domain
    .createStore<string>('save')
    .on(updateDomainLegend2, (_, payload) => payload)

const domainTxDomain = createDomain()
export const updateDomainTx = domainTxDomain.createEvent<string>()
export const $domainTx = domainTxDomain
    .createStore<string>('')
    .on(updateDomainTx, (_, payload) => payload)

const unlockToastDomain = createDomain()
export const updateUnlockToast = unlockToastDomain.createEvent<boolean>()
export const $unlockToast = unlockToastDomain
    .createStore<boolean>(true)
    .on(updateUnlockToast, (_, payload) => payload)

const typeBatchTransferDomain = createDomain()
export const updateTypeBatchTransfer =
    typeBatchTransferDomain.createEvent<string>()
export const $typeBatchTransfer = typeBatchTransferDomain
    .createStore<string>('transfer')
    .on(updateTypeBatchTransfer, (_, payload) => payload)

const txNameDomain = createDomain()
export const updateTxName = txNameDomain.createEvent<string>()
export const $txName = txNameDomain
    .createStore<string>('')
    .on(updateTxName, (_, payload) => payload)

const tydraDomain = createDomain()
export const updateTydra = tydraDomain.createEvent<string>()
export const $tydra = tydraDomain
    .createStore<string>('')
    .on(updateTydra, (_, payload) => payload)

const selectedNftDomain = createDomain()
export const updateSelectedNft = selectedNftDomain.createEvent<string>()
export const $selectedNft = selectedNftDomain
    .createStore<string>('')
    .on(updateSelectedNft, (_, payload) => payload)
