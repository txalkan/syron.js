import { createDomain } from 'effector';

const arConnectDomain = createDomain();
export const updateArConnect = arConnectDomain.createEvent<any | null>();
export const $arconnect = arConnectDomain
    .createStore<any | null>(null)
    .on(updateArConnect, (_, payload) => payload);
