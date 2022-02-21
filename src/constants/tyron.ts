const BASE_URL = "https://github.com/pungtas/contracts.tyron/blob/main";

export enum SMART_CONTRACTS {
  did = "did",
  xwallet = "xwallet",
  dex = "dex",
  stake = "stake",
  coop = "coop",
  xpoints = "xpoints",
  donate = "donate",
  dao = "dao",
  token = "token",
  $si = "$si",
}

export const VALID_SMART_CONTRACTS: string[] = [
  SMART_CONTRACTS.did,
  SMART_CONTRACTS.xwallet,
  SMART_CONTRACTS.dex,
  SMART_CONTRACTS.stake,
  SMART_CONTRACTS.coop,
  SMART_CONTRACTS.donate,
  SMART_CONTRACTS.xpoints,
  SMART_CONTRACTS.dao,
  SMART_CONTRACTS.token,
  SMART_CONTRACTS.$si,
];

export const SMART_CONTRACTS_URLS: { [key in SMART_CONTRACTS]: string } = {
  [SMART_CONTRACTS.did]: `${BASE_URL}/DID/did.tyron.scilla`,
  [SMART_CONTRACTS.xwallet]: `${BASE_URL}/DID/DIDdapps/DIDxWallet/xwallet.tyron.scilla`,
  [SMART_CONTRACTS.dex]: `${BASE_URL}/DID/DIDdapps/Dex/dex.tyron.scilla`,
  [SMART_CONTRACTS.stake]: `${BASE_URL}/DID/DIDdapps/Stake/stake.tyron.scilla`,
  [SMART_CONTRACTS.coop]: `${BASE_URL}/DID/DIDdapps/Coop/coop.tyron.scilla`,
  [SMART_CONTRACTS.xpoints]: `${BASE_URL}/xPOINTS/xpoints.tyron.scilla`,
  [SMART_CONTRACTS.donate]: `${BASE_URL}/DID/DIDdapps/Donate/donate.tyron.scilla`,
  [SMART_CONTRACTS.dao]: `${BASE_URL}/DID/DIDdapps/DAO/dao.tyron`,
  [SMART_CONTRACTS.token]: `${BASE_URL}/FUNGIBLE_TOKENS/README.md`,
  [SMART_CONTRACTS.dao]: `${BASE_URL}/FUNGIBLE_TOKENS/README.md`,
  [SMART_CONTRACTS.$si]: `${BASE_URL}/FUNGIBLE_TOKENS/$si.tyron.scilla`,
};
