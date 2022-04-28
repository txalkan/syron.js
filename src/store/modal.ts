import { createDomain } from "effector";

export let modalDashboard: boolean;
export let modalNewSsi: boolean;
export let modalTx: boolean;
export let modalGetStarted: boolean;
export let modalBuyNft: boolean;
export let modalAddFunds: boolean;
export let showZilpay: boolean;
export let selectedCurrency: string;

const modalDashboardDomain = createDomain();
export const updateModalDashboard = modalDashboardDomain.createEvent<
  boolean | false
>();
export const $modalDashboard = modalDashboardDomain
  .createStore<boolean | false>(false)
  .on(updateModalDashboard, (_, payload) => payload);

const modalNewSsiDomain = createDomain();
export const updateModalNewSsi = modalNewSsiDomain.createEvent<
  boolean | false
>();
export const $modalNewSsi = modalNewSsiDomain
  .createStore<boolean | false>(false)
  .on(updateModalNewSsi, (_, payload) => payload);

const modalTxDomain = createDomain();
export const updateModalTx = modalTxDomain.createEvent<boolean | false>();
export const $modalTx = modalTxDomain
  .createStore<boolean | false>(false)
  .on(updateModalTx, (_, payload) => payload);

const modalGetStartedDomain = createDomain();
export const updateModalGetStarted = modalGetStartedDomain.createEvent<
  boolean | false
>();
export const $modalGetStarted = modalGetStartedDomain
  .createStore<boolean | false>(false)
  .on(updateModalGetStarted, (_, payload) => payload);

const modalAddFundsDomain = createDomain();
export const updateModalAddFunds = modalAddFundsDomain.createEvent<
  boolean | false
>();
export const $modalAddFunds = modalAddFundsDomain
  .createStore<boolean | false>(false)
  .on(updateModalAddFunds, (_, payload) => payload);

const modalBuyNftDomain = createDomain();
export const updateModalBuyNft = modalBuyNftDomain.createEvent<
  boolean | false
>();
export const $modalBuyNft = modalBuyNftDomain
  .createStore<boolean | false>(false)
  .on(updateModalBuyNft, (_, payload) => payload);

const showZilpayDomain = createDomain();
export const updateShowZilpay = showZilpayDomain.createEvent<boolean | false>();
export const $showZilpay = showZilpayDomain
  .createStore<boolean | false>(false)
  .on(updateShowZilpay, (_, payload) => payload);

const selectedCurrencyDomain = createDomain();
export const updateSelectedCurrency =
  selectedCurrencyDomain.createEvent<string>();
export const $selectedCurrency = selectedCurrencyDomain
  .createStore<string | null>(null)
  .on(updateSelectedCurrency, (_, payload) => payload);
