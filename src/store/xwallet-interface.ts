import { createDomain } from "effector";

export let walletInterface: string;

const walletInterfaceDomain = createDomain();
export const updateWalletInterface = walletInterfaceDomain.createEvent<string | null>();
export const $walletInterface = walletInterfaceDomain
  .createStore<string | null>('')
  .on(updateWalletInterface, (_, payload) => payload);
