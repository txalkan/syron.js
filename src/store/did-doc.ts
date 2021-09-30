import { createDomain } from 'effector';

const docDomain = createDomain();
export const updateDid = docDomain.createEvent<any[]>();
export const $did = docDomain
  .createStore<any[] | null>(null)
  .on(updateDid, (_, payload) => payload);
