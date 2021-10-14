import { createDomain } from 'effector';

export let IsAdmin: boolean;

const isAdminDomain = createDomain();
export const updateIsAdmin = isAdminDomain.createEvent<boolean>();
export const $isAdmin = isAdminDomain
    .createStore<boolean | null>(null)
    .on(updateIsAdmin, (_, payload) => payload);
