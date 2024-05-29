import { createDomain } from 'effector'

const loadingDomain = createDomain()
export const updateLoading = loadingDomain.createEvent<boolean | false>()
export const $loading = loadingDomain
    .createStore<boolean | false>(false)
    .on(updateLoading, (_, payload) => payload)

const loadingDocDomain = createDomain()
export const updateLoadingDoc = loadingDocDomain.createEvent<boolean | false>()
export const $loadingDoc = loadingDocDomain
    .createStore<boolean | false>(false)
    .on(updateLoadingDoc, (_, payload) => payload)

const loadingBreadcrumbs = createDomain()
export const updateLoadingBreadcrumbs = loadingBreadcrumbs.createEvent<
    boolean | false
>()
export const $loadingBreadcrumbs = loadingBreadcrumbs
    .createStore<boolean | false>(false)
    .on(updateLoadingBreadcrumbs, (_, payload) => payload)

const loadingTydra = createDomain()
export const updateLoadingTydra = loadingTydra.createEvent<boolean | true>()
export const $loadingTydra = loadingTydra
    .createStore<boolean | true>(true)
    .on(updateLoadingTydra, (_, payload) => payload)

const walletConnected = createDomain()
export const updateWalletConnected = walletConnected.createEvent<
    boolean | false
>()
export const $walletConnected = walletConnected
    .createStore<boolean | false>(false)
    .on(updateWalletConnected, (_, payload) => payload)
