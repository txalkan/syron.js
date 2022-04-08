import { createDomain } from "effector";

export let new_ssi: string;

const newSSIDomain = createDomain();
export const updateNewSSI = newSSIDomain.createEvent<string>();
export const $new_ssi = newSSIDomain
  .createStore<string | null>(null)
  .on(updateNewSSI, (_, payload) => payload);
