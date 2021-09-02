const BASE_URL = 'https://github.com/pungtas/smart-contracts.tyron/blob/main';

export enum SMART_CONTRACTS {
    INIT = 'init',
    DID = 'did',
    COOP = 'coop',
    xWALLET = 'xwallet',
    SSI = 'ssi',
    PST = 'pst',
    PSTi = 'psti',
    xPSTi = 'xpsti',
    pWALLET = 'pwallet'
}

export const VALID_SMART_CONTRACTS: string[] = [
    SMART_CONTRACTS.INIT,
    SMART_CONTRACTS.DID,
    SMART_CONTRACTS.COOP,
    SMART_CONTRACTS.xWALLET,
    SMART_CONTRACTS.SSI,
    SMART_CONTRACTS.PST,
    SMART_CONTRACTS.PSTi,
    SMART_CONTRACTS.xPSTi,
    SMART_CONTRACTS.pWALLET
];

// @TODO: Add missing urls from this list.
export const SMART_CONTRACTS_URLS: { [key in SMART_CONTRACTS]: string } = {
    [SMART_CONTRACTS.DID]: `${BASE_URL}/DID/did.tyron.scilla`,
    [SMART_CONTRACTS.xWALLET]: `${BASE_URL}/DID/DIDdapps/DIDxWallet/xwallet.tyron.scilla`,
    [SMART_CONTRACTS.COOP]: `${BASE_URL}/COOP/NFTcoop.tyron`,
    [SMART_CONTRACTS.INIT]: `${BASE_URL}/INIT/init.tyron.scilla`,
    [SMART_CONTRACTS.PST]: `${BASE_URL}/PST/pst.tyron.scilla`,
    [SMART_CONTRACTS.PSTi]: `${BASE_URL}/PST/new-token/PSTi.tyron.scilla`,
    [SMART_CONTRACTS.xPSTi]: `${BASE_URL}/PST/wrapped-token/xPSTi.tyron.scilla`,
    [SMART_CONTRACTS.pWALLET]: `${BASE_URL}/PERMAWALLET/pWallet.tyron.js`,
    [SMART_CONTRACTS.SSI]: `${BASE_URL}/SSI/ssi.tyron.scilla`
};
