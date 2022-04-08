import { TNullable } from "../../interfaces/IData";
import { JWKInterface } from "arweave/node/lib/wallet";

export enum ACTION_TYPES {
  SET_AR_ADDRESS = "SET_AR_ADDRESS",
  CLEAR_AR_ADDRESS = "CLEAR_AR_ADDRESS",
  SET_ARCONNECT = "SET_ARCONNECT",
  CLEAR_ARCONNECT = "CLEAR_ARCONNECT",
  SET_KEYFILE = "SET_KEYFILE",
  CLEAR_KEYFILE = "CLEAR_KEYFILE",
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
      type: ACTION_TYPES.SET_ARCONNECT;
      payload: any;
    }
  | {
      type: ACTION_TYPES.CLEAR_ARCONNECT;
    }
  | {
      type: ACTION_TYPES.SET_KEYFILE;
      payload: JWKInterface;
    }
  | {
      type: ACTION_TYPES.CLEAR_KEYFILE;
    };

export interface IActionsCreator {
  setArAddress(arAddress: string): TUserAction;
  clearArAddress(): TUserAction;
  setArconnect(arConnect: any): TUserAction;
  clearArconnect(): TUserAction;
  setKeyfile(keyfile: JWKInterface): TUserAction;
  clearKeyfile(): TUserAction;
}

export type TUserState = Readonly<{
  arAddress: TNullable<string>;
  arConnect: TNullable<any>;
  keyFile: TNullable<JWKInterface>;
}>;

// @todo review using this file againsts managing the state with useStore instead
