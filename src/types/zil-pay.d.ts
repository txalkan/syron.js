abstract class TypeChecker {
    private _args:
        | Array
        | string
        | symbol
        | number
        | undefined
        | null
        | object
        | Function;

    abstract get isUndefined(): boolean;
    abstract get isInt(): boolean;
    abstract get isFloat(): boolean;
    abstract get isArray(): boolean;
    abstract get isString(): boolean;
    abstract get isObject(): boolean;
    abstract get isBoolean(): boolean;
    abstract get isFunction(): boolean;
    abstract get isSymbol(): boolean;

    abstract constructor(...args) {
        this._args = args;
    }
}

export interface Block {
    TxBlock: {
        body: object;
        header: object;
    };
    TxHashes: Array<string[]>;
}

export interface ZIlpayResponse<T> {
    id: number;
    jsonrpc: string;
    req: {
        payload: {
            id: number;
            jsonrpc: string;
            method: string;
            params: string[];
        };
        url: string;
    };
    result?: T;
    error?: {
        code: number;
        message: string;
    };
}

export type Net = 'mainnet' | 'testnet' | 'private';

export interface ZIlPayBlockchain {
    getBalance: (address: string) => Promise<
        ZIlpayResponse<{
            balance: string;
            nonce: number;
        }>
    >;
    createTransaction: (tx) => Promise<ZIlpayResponse<any>>;
    getBlockChainInfo: () => Promise<ZIlpayResponse<any>>;
    getCurrentDSEpoch: () => Promise<ZIlpayResponse<any>>;
    getCurrentMiniEpoch: () => Promise<ZIlpayResponse<any>>;
    getDSBlockRate: () => Promise<ZIlpayResponse<any>>;
    getLatestDSBlock: () => Promise<ZIlpayResponse<any>>;
    getLatestTxBlock: () => Promise<ZIlpayResponse<any>>;
    getMinerInfo: () => Promise<ZIlpayResponse<any>>;
    getMinimumGasPrice: () => Promise<ZIlpayResponse<any>>;
    getNumDSBlocks: () => Promise<ZIlpayResponse<any>>;
    getNumTransactions: () => Promise<ZIlpayResponse<any>>;
    getNumTxBlocks: () => Promise<ZIlpayResponse<any>>;
    getPrevDSDifficulty: () => Promise<ZIlpayResponse<any>>;
    getPrevDifficulty: () => Promise<ZIlpayResponse<any>>;
    getRecentTransactions: () => Promise<ZIlpayResponse<any>>;
    getShardingStructure: () => Promise<ZIlpayResponse<any>>;
    getSmartContractCode: (address: string) => Promise<ZIlpayResponse<any>>;
    getSmartContractInit: (address: string) => Promise<ZIlpayResponse<any>>;
    getSmartContractState: (address: string) => Promise<ZIlpayResponse<any>>;
    getSmartContractSubState: (
        address: string,
        field: string,
        params: string[]
    ) => Promise<ZIlpayResponse<any>>;
    getSmartContracts: (address: string) => Promise<ZIlpayResponse<any>>;
    getTotalCoinSupply: () => Promise<ZIlpayResponse<any>>;
    getTransaction: (id: string) => Promise<ZIlpayResponse<any>>;
    getTransactionRate: () => Promise<ZIlpayResponse<any>>;
}

export interface ZIlPayInject {
    observableNetwork();
    ERRORS: {
        CONNECT: string;
        CONTRACT_HASN_TDEPLOYED: string;
        DISABLED: string;
        DISABLE_DMETHOD: string;
        INIT_PARAMS: string;
        MUST_BE_OBJECT: string;
        MUST_BE_STRING: string;
        REQUIRED: string;
    };
    TypeChecker: TypeChecker;
    blockchain: ZIlPayBlockchain;
    contracts: {
        transactions: any;
        at: (address: string) => any;
        new: (code: any, init: any) => any;
    };
    crypto: {
        fromBech32Address: (address: string) => string;
        isValidChecksumAddress: (address: string) => boolean;
        normaliseAddress: (address: string) => string;
        toBech32Address: (address: string) => string;
        toChecksumAddress: (address: string) => string;
        toHex: (address: string) => string;
    };
    utils: {
        BN: any;
        Long: any;
        bytes: any;
        units: any;
        validation: {
            isAddress: (address: string) => boolean;
            isBech32: (address: string) => boolean;
        };
    };
    wallet: {
        defaultAccount: null | {
            base16: string;
            bech32: string;
        };
        isConnect: boolean;
        isEnable: boolean;
        net: Net;
        addTransactionsQueue: (...hashs: string[]) => void;
        connect: () => Promise<boolean>;
        observableAccount: () => any;
        observableBlock: () => any;
        observableNetwork: () => any;
        observableTransaction: () => any;
        sign: (prams: any) => Promise<any>;
    };
}
