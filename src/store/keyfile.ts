import { createDomain } from 'effector';

const keyfileDomain = createDomain();
export const updateKeyfile = keyfileDomain.createEvent<any | null>();
export const $keyfile = keyfileDomain
    .createStore<any | null>(null)
    .on(updateKeyfile, (_, payload) => payload);
