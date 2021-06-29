import { TNullable } from '../../interfaces/IData';

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
  CLEAR_ZIL_NETWORK = "CLEAR_ZIL_NETWORK"
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
}

export type TUserState = Readonly<{
  arAddress: TNullable<string>;
  zilAddress: TNullable<string>;
  arweaveSecretKey: TNullable<string>;
  zilliqaSecretKey: TNullable<string>;
  zilPay: TNullable<any>;
  zilNetwork: TNullable<any>;
}>;
