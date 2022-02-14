import { createDomain } from 'effector';

const currentUsername = createDomain();
export const updateCurrentUsername = currentUsername.createEvent<any | null>();
export const $currentusername = currentUsername
    .createStore<any | null>(null)
    .on(updateCurrentUsername, (_, payload) => payload);
