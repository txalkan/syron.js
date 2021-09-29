import { createDomain } from 'effector';
import { DOMAINS } from 'src/constants/domains';

export interface Username {
  nft: string;
  domain: DOMAINS
}

const usernameDomain = createDomain();
export const updateUsername = usernameDomain.createEvent<Username>();
export const $username = usernameDomain
  .createStore<Username | null>(null)
  .on(updateUsername, (_, payload) => payload);
