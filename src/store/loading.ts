import { createDomain } from "effector";

export let loading: boolean;

const loadingDomain = createDomain();
export const updateLoading = loadingDomain.createEvent<boolean | false>();
export const $loading = loadingDomain
  .createStore<boolean | false>(false)
  .on(updateLoading, (_, payload) => payload);
