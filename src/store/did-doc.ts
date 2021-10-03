import { createDomain } from 'effector';

const docDomain = createDomain();
export const updateDid = docDomain.createEvent<any[]|null>();
export const $did = docDomain
    .createStore<any[] | null>(null)
    .on(updateDid, (_, payload) => payload);
