import { createDomain } from "effector";

export interface Wallet {
  base16: string;
  bech32: string;
}

const walletDomain = createDomain();
export const updateAddress = walletDomain.createEvent<Wallet | null>();
export const $wallet = walletDomain
  .createStore<Wallet | null>(null)
  .on(updateAddress, (_, payload) => payload);
