const BASE_URL = 'https://github.com/pungtas/contracts.tyron/blob/main';

export enum SMART_CONTRACTS {
    did = 'did',
    xwallet = 'xwallet',
    dex = 'dex',
    stake = 'stake',
    coop = 'coop',
    permawallet = 'permawallet',
    pst = 'pst',
    psti = 'psti',
    wpsti = 'wpsti'
}

export const VALID_SMART_CONTRACTS: string[] = [
    SMART_CONTRACTS.did,
    SMART_CONTRACTS.xwallet,
    SMART_CONTRACTS.dex,
    SMART_CONTRACTS.stake,
    SMART_CONTRACTS.coop,
    SMART_CONTRACTS.permawallet,
    SMART_CONTRACTS.pst,
    SMART_CONTRACTS.psti,
    SMART_CONTRACTS.wpsti
];

export const SMART_CONTRACTS_URLS: { [key in SMART_CONTRACTS]: string } = {
    [SMART_CONTRACTS.did]: `${BASE_URL}/DID/did.tyron.scilla`,
    [SMART_CONTRACTS.xwallet]: `${BASE_URL}/DID/DIDdapps/DIDxWallet/xwallet.tyron.scilla`,
    [SMART_CONTRACTS.dex]: `${BASE_URL}/DID/DIDdapps/Dex/dex.tyron.scilla`,
    [SMART_CONTRACTS.stake]: `${BASE_URL}/DID/DIDdapps/Stake/stake.tyron.scilla`,
    [SMART_CONTRACTS.coop]: `${BASE_URL}/DID/DIDdapps/Coop/coop.tyron.scilla`,
    [SMART_CONTRACTS.permawallet]: `${BASE_URL}/PERMAWALLET/permawallet.tyron.js`,
    [SMART_CONTRACTS.pst]: `${BASE_URL}/PST/pst.tyron.scilla`,
    [SMART_CONTRACTS.psti]: `${BASE_URL}/PST/new-token/psti.tyron.scilla`,
    [SMART_CONTRACTS.wpsti]: `${BASE_URL}/PST/wrapped-token/wpsti.tyron.scilla`
};
