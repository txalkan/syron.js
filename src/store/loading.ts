import { createDomain } from "effector";

export let loading: boolean;

const loadingDomain = createDomain();
export const setLoading = loadingDomain.createEvent<boolean | false>();
export const $loading = loadingDomain
  .createStore<boolean | false>(false)
  .on(setLoading, (_, payload) => payload);
