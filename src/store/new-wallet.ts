import { createDomain } from 'effector';

export let new_wallet: string;

const newWalletDomain = createDomain();
export const updateNewWallet = newWalletDomain.createEvent<string | null>();
export const $new_wallet = newWalletDomain
    .createStore<string | null>(null)
    .on(updateNewWallet, (_, payload) => payload);
