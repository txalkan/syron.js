import { createDomain } from "effector";

export let menuOn: boolean;

const domain = createDomain();
export const updateMenuOn = domain.createEvent<boolean | false>();
export const $menuOn = domain
  .createStore<boolean | false>(false)
  .on(updateMenuOn, (_, payload) => payload);
