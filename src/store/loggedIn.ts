import { createDomain } from 'effector';

export interface LoggedIn {
    username?: string;
    address?: string;
}

const loggedInDomain = createDomain();
export const updateLoggedIn = loggedInDomain.createEvent<LoggedIn | null>();
export const $loggedIn = loggedInDomain
    .createStore<LoggedIn | null>(null)
    .on(updateLoggedIn, (_, payload) => payload);
