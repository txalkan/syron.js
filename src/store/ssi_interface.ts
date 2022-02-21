import { createDomain } from "effector";

export let Identity: string;

const interfaceDomain = createDomain();
export const updateSSIInterface = interfaceDomain.createEvent<string | null>();
export const $ssi_interface = interfaceDomain
  .createStore<string | null>(null)
  .on(updateSSIInterface, (_, payload) => payload);
