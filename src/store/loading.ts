import { createDomain } from "effector";

export let loading: boolean;

const loadingDomain = createDomain();
export const setLoading = loadingDomain.createEvent<boolean | true>();
export const $loading = loadingDomain
  .createStore<boolean | true>(true)
  .on(setLoading, (_, payload) => payload);
