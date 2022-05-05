import { createDomain } from "effector";

export let loading: boolean;

const loadingDomain = createDomain();
export const updateLoading = loadingDomain.createEvent<boolean | false>();
export const $loading = loadingDomain
  .createStore<boolean | false>(false)
  .on(updateLoading, (_, payload) => payload);

export let loadingDoc: boolean;

const loadingDocDomain = createDomain();
export const updateLoadingDoc = loadingDomain.createEvent<boolean | false>();
export const $loadingDoc = loadingDocDomain
  .createStore<boolean | false>(false)
  .on(updateLoadingDoc, (_, payload) => payload);
