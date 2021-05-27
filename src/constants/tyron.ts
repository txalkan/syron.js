const BASE_URL = "https://github.com/pungtas/smart-contracts.tyron/blob/main";

export enum SMART_CONTRACTS {
  INIT = "init",
  DID = "did",
  SSI = "ssi",
  PST = "pst",
  PWALLET = "pwallet",
}

export const VALID_SMART_CONTRACTS: string[] = [
  SMART_CONTRACTS.INIT,
  SMART_CONTRACTS.DID,
  SMART_CONTRACTS.SSI,
  SMART_CONTRACTS.PST,
  SMART_CONTRACTS.PWALLET
];

// @TODO: Add missing urls from this list.
export const SMART_CONTRACTS_URLS: { [key in SMART_CONTRACTS]: string } = {
  [SMART_CONTRACTS.INIT]: `${BASE_URL}/INIT/init.tyron.scilla`,
  [SMART_CONTRACTS.DID]: `${BASE_URL}/DID/did.tyron.scilla`,
  [SMART_CONTRACTS.SSI]: `${BASE_URL}/SSI/ssi.tyron.scilla`,
  [SMART_CONTRACTS.PST]: `${BASE_URL}/PST/pst.tyron.scilla`,
  [SMART_CONTRACTS.PWALLET]: `${BASE_URL}/PERMAWALLET/pWallet.tyron.js`,
};
