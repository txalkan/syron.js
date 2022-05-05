import { createDomain } from "effector";

export interface BuyInfo {
  recipientOpt?: string;
  anotherAddr?: string;
  currency?: string;
  currentBalance?: any;
  isEnough?: boolean;
}

const buyInfoDomain = createDomain();
export const updateBuyInfo = buyInfoDomain.createEvent<BuyInfo | null>();
export const $buyInfo = buyInfoDomain
  .createStore<BuyInfo | null>(null)
  .on(updateBuyInfo, (_, payload) => payload);
