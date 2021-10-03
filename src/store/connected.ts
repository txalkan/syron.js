import { createDomain } from 'effector';

export let Connected: boolean;

const connectedDomain = createDomain();
export const updateConnected = connectedDomain.createEvent<boolean>();
export const $connected = connectedDomain
    .createStore<boolean | null>(null)
    .on(updateConnected, (_, payload) => payload);
