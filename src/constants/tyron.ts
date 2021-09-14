const BASE_URL = 'https://github.com/pungtas/contracts.tyron/blob/main';

export enum SMART_CONTRACTS {
    did = 'did',
    xwallet = 'xwallet',
    coop = 'coop',
    permawallet = 'permawallet',
    pst = 'pst',
    psti = 'psti',
    wpsti = 'wpsti'
}

export const VALID_SMART_CONTRACTS: string[] = [
    SMART_CONTRACTS.did,
    SMART_CONTRACTS.xwallet,
    SMART_CONTRACTS.coop,
    SMART_CONTRACTS.permawallet,
    SMART_CONTRACTS.pst,
    SMART_CONTRACTS.psti,
    SMART_CONTRACTS.wpsti
];

// @TODO: Add missing urls from this list.
export const SMART_CONTRACTS_URLS: { [key in SMART_CONTRACTS]: string } = {
    [SMART_CONTRACTS.did]: `${BASE_URL}/DID/did.tyron.scilla`,
    [SMART_CONTRACTS.xwallet]: `${BASE_URL}/DID/DIDdapps/DIDxWallet/xwallet.tyron.scilla`,
    [SMART_CONTRACTS.coop]: `${BASE_URL}/DID/DIDdapps/COOP/coop.tyron.scilla`,
    [SMART_CONTRACTS.permawallet]: `${BASE_URL}/PERMAWALLET/permawallet.tyron.js`,
    [SMART_CONTRACTS.pst]: `${BASE_URL}/PST/pst.tyron.scilla`,
    [SMART_CONTRACTS.psti]: `${BASE_URL}/PST/new-token/psti.tyron.scilla`,
    [SMART_CONTRACTS.wpsti]: `${BASE_URL}/PST/wrapped-token/wpsti.tyron.scilla`,
};
