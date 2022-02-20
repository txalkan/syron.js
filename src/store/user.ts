import { createDomain } from "effector";

export interface User {
  name: string;
  domain: string;
}

const userDomain = createDomain();
export const updateUser = userDomain.createEvent<User>();
export const $user = userDomain
  .createStore<User | null>(null)
  .on(updateUser, (_, payload) => payload);
