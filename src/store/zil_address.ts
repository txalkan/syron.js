import { createDomain } from "effector";

export interface ZilAddress {
  base16: string;
  bech32: string;
}

const zilAddrDomain = createDomain();
export const updateZilAddress = zilAddrDomain.createEvent<ZilAddress>();
export const $zil_address = zilAddrDomain
  .createStore<ZilAddress | null>(null)
  .on(updateZilAddress, (_, payload) => payload);
