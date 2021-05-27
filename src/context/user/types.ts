import { TNullable } from '../../interfaces/IData';

export enum ACTION_TYPES {
  SET_AR_ADDRESS = "SET_AR_ADDRESS",
  CLEAR_AR_ADDRESS = "CLEAR_AR_ADDRESS",
  SET_AR_SECRET_KEY = 'SET_AR_SECRET_KEY',
  CLEAR_AR_SECRET_KEY = "CLEAR_AR_SECRET_KEY",
  SET_ZIL_SECRET_KEY = 'SET_ZIL_SECRET_KEY',
  CLEAR_ZIL_SECRET_KEY = "CLEAR_ZIL_SECRET_KEY"
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
    type: ACTION_TYPES.SET_ZIL_SECRET_KEY;
    payload: string;
  }
  | {
    type: ACTION_TYPES.CLEAR_ZIL_SECRET_KEY;
  };

export interface IActionsCreator {
  setArAddress(address: string): TUserAction;
  clearArAddress(): TUserAction;
  setArSecretKey(key: string): TUserAction;
  clearArSecretKey(): TUserAction;
  setZilSecretKey(key: string): TUserAction;
  clearZilSecretKey(): TUserAction;
}

export type TUserState = Readonly<{
  address: TNullable<string>;
  arweaveSecretKey: TNullable<string>;
  zilliqaSecretKey: TNullable<string>;
}>;
