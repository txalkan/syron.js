import { createDomain } from "effector";

export interface IsAdmin {
  verified: boolean;
  hideWallet: boolean;
  legend: string;
}

const isAdminDomain = createDomain();
export const updateIsAdmin = isAdminDomain.createEvent<IsAdmin>();
export const $isAdmin = isAdminDomain
  .createStore<IsAdmin | null>(null)
  .on(updateIsAdmin, (_, payload) => payload);
