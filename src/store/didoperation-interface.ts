import { createDomain } from "effector";

export let didOpsInterface: string;

const didOpsInterfaceDomain = createDomain();
export const updateDidOpsInterface = didOpsInterfaceDomain.createEvent<string | null>();
export const $didOpsInterface = didOpsInterfaceDomain
  .createStore<string | null>('')
  .on(updateDidOpsInterface, (_, payload) => payload);
