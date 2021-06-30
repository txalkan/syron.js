import { TNullable } from '../../interfaces/IData';
import { JWKInterface } from 'arweave/node/lib/wallet';

export enum ACTION_TYPES {
	SET_AR_ADDRESS = "SET_AR_ADDRESS",
	CLEAR_AR_ADDRESS = "CLEAR_AR_ADDRESS",
	SET_AR_SECRET_KEY = 'SET_AR_SECRET_KEY',
	CLEAR_AR_SECRET_KEY = "CLEAR_AR_SECRET_KEY",
	SET_ZIL_ADDRESS = "SET_ZIL_ADDRESS",
	CLEAR_ZIL_ADDRESS = "CLEAR_ZIL_ADDRESS",
	SET_ZIL_SECRET_KEY = 'SET_ZIL_SECRET_KEY',
	CLEAR_ZIL_SECRET_KEY = "CLEAR_ZIL_SECRET_KEY",
	SET_ZILPAY = "SET_ZILPAY",
	CLEAR_ZILPAY = "CLEAR_ZILPAY",
	SET_ZIL_NETWORK = "SET_ZIL_NETWORK",
	CLEAR_ZIL_NETWORK = "CLEAR_ZIL_NETWORK",
	SET_ARCONNECT = "SET_ARCONNECT",
	SET_KEYFILE = "SET_KEYFILE",
	SET_TRAVEL_RULE = "TRAVEL_RULE"
}

export type TUserAction =
	| {
		type: ACTION_TYPES.SET_AR_ADDRESS;
		payload: string;
	}
	| {
		type: ACTION_TYPES.CLEAR_AR_ADDRESS;
	}
	| {
	type: ACTION_TYPES.SET_AR_SECRET_KEY;
	payload: string;
	}
	| {
	type: ACTION_TYPES.CLEAR_AR_SECRET_KEY;
	}
	| {
	type: ACTION_TYPES.SET_ZIL_ADDRESS;
	}
	| {
	type: ACTION_TYPES.CLEAR_ZIL_ADDRESS;
	}
	| {
	type: ACTION_TYPES.SET_ZIL_SECRET_KEY;
	payload: string;
	}
	| {
	type: ACTION_TYPES.CLEAR_ZIL_SECRET_KEY;
	}
	| {
	type: ACTION_TYPES.SET_ZILPAY,
	}
	| {
	type: ACTION_TYPES.CLEAR_ZILPAY,
	}
	| {
	type: ACTION_TYPES.SET_ZIL_NETWORK,
	}
	| {
	type: ACTION_TYPES.CLEAR_ZIL_NETWORK,
	}
	| {
	type: ACTION_TYPES.SET_ARCONNECT,
	}
	| {
	type: ACTION_TYPES.SET_KEYFILE,
	}
	| {
	type: ACTION_TYPES.SET_TRAVEL_RULE,
	};

export interface IActionsCreator {
	setArAddress(address: string): TUserAction;
	clearArAddress(): TUserAction;
	setArSecretKey(key: string): TUserAction;
	clearArSecretKey(): TUserAction;
	setZilAddress(address: string): TUserAction;
	clearZilAddress(): TUserAction
	setZilSecretKey(key: string): TUserAction;
	clearZilSecretKey(): TUserAction;
	setZilPay(wallet: any): TUserAction;
	clearZilPay(): TUserAction;
	setZilNetwork(network: any): TUserAction;
	clearZilNetwork(): TUserAction;
	setArconnect(arconnect: any): TUserAction;
	setKeyfile(keyfile: JWKInterface): TUserAction;
	setTravelRule(travelRule: any): TUserAction
}

export type TUserState = Readonly<{
	arAddress: TNullable<string>;
	zilAddress: TNullable<string>;
	arweaveSecretKey: TNullable<string>;
	zilliqaSecretKey: TNullable<string>;
	zilPay: TNullable<any>;
	zilNetwork: TNullable<any>;
	arconnect: TNullable<any>;   //@to-do review along with keyfile
	keyfile: TNullable<any>;
	travelRule: TNullable<any>;
}>;
