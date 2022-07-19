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

const modalAddFundsDomain = createDomain()
export const updateModalAddFunds = modalAddFundsDomain.createEvent<
    boolean | false
>()
export const $modalAddFunds = modalAddFundsDomain
    .createStore<boolean | false>(false)
    .on(updateModalAddFunds, (_, payload) => payload)

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
