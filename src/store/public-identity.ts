import { createDomain } from 'effector';

export let PublicIdentity: string

const publicIdentityDomain = createDomain();
export const updatePublicIdentity = publicIdentityDomain.createEvent<string>();
export const $publicIdentity = publicIdentityDomain
    .createStore<string | null>(null)
    .on(updatePublicIdentity, (_, payload) => payload);
