import { VALID_DOMAINS } from "../../constants/domains";

export const isValidUsername = (username: string) =>
  /^[\w\d_]+$/.test(username) && username.length > 5 && username.length < 15;

export const isValidDomain = (domain: string) => VALID_DOMAINS.includes(domain);

