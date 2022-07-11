import { createDomain } from 'effector'

export let loading: boolean
export let loadingDoc: boolean
export let noRedirect: boolean

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

const noRedirectDomain = createDomain()
export const updateNoRedirect = noRedirectDomain.createEvent<boolean | false>()
export const $noRedirect = noRedirectDomain
    .createStore<boolean | false>(false)
    .on(updateNoRedirect, (_, payload) => payload)
