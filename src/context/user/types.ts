import { TNullable } from '../../interfaces/IData';
import { JWKInterface } from 'arweave/node/lib/wallet';
import { Iivms101Message } from 'src/interfaces/IIvms101Message';

export enum ACTION_TYPES {
    SET_AR_ADDRESS = 'SET_AR_ADDRESS',
    CLEAR_AR_ADDRESS = 'CLEAR_AR_ADDRESS',
    SET_ZIL_ADDRESS = 'SET_ZIL_ADDRESS',
    CLEAR_ZIL_ADDRESS = 'CLEAR_ZIL_ADDRESS',
    SET_SSI_SECRET_KEY = 'SET_AR_SECRET_KEY',
    CLEAR_SSI_SECRET_KEY = 'CLEAR_AR_SECRET_KEY',
    SET_ZIL_SECRET_KEY = 'SET_ZIL_SECRET_KEY',
    CLEAR_ZIL_SECRET_KEY = 'CLEAR_ZIL_SECRET_KEY',
    SET_ZILPAY = 'SET_ZILPAY',
    CLEAR_ZILPAY = 'CLEAR_ZILPAY',
    SET_ZIL_NETWORK = 'SET_ZIL_NETWORK',
    CLEAR_ZIL_NETWORK = 'CLEAR_ZIL_NETWORK',
    SET_ARCONNECT = 'SET_ARCONNECT',
    CLEAR_ARCONNECT = 'CLEAR_ARCONNECT',
    SET_KEYFILE = 'SET_KEYFILE',
    CLEAR_KEYFILE = 'CLEAR_KEYFILE',
    SET_TRAVEL_RULE = 'TRAVEL_RULE',
    CLEAR_TRAVEL_RULE = 'CLEAR_TRAVEL RULE'
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
          type: ACTION_TYPES.SET_ZIL_ADDRESS;
          payload: string;
      }
    | {
          type: ACTION_TYPES.CLEAR_ZIL_ADDRESS;
      }
    | {
          type: ACTION_TYPES.SET_SSI_SECRET_KEY;
          payload: string;
      }
    | {
          type: ACTION_TYPES.CLEAR_SSI_SECRET_KEY;
      }
    | {
          type: ACTION_TYPES.SET_ZIL_SECRET_KEY;
          payload: string;
      }
    | {
          type: ACTION_TYPES.CLEAR_ZIL_SECRET_KEY;
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
      }
    | {
          type: ACTION_TYPES.SET_ZILPAY;
          payload: any;
      }
    | {
          type: ACTION_TYPES.CLEAR_ZILPAY;
      }
    | {
          type: ACTION_TYPES.SET_ZIL_NETWORK;
          payload: any;
      }
    | {
          type: ACTION_TYPES.CLEAR_ZIL_NETWORK;
      }
    | {
          type: ACTION_TYPES.SET_TRAVEL_RULE;
          payload: Iivms101Message;
      }
    | {
          type: ACTION_TYPES.CLEAR_TRAVEL_RULE;
      };

export interface IActionsCreator {
    setArAddress(arAddress: string): TUserAction;
    clearArAddress(): TUserAction;
    setZilAddress(zilAddress: string): TUserAction;
    clearZilAddress(): TUserAction;
    setSsiSecretKey(key: string): TUserAction;
    clearSsiSecretKey(): TUserAction;
    setZilSecretKey(key: string): TUserAction;
    clearZilSecretKey(): TUserAction;
    setArconnect(arConnect: any): TUserAction;
    clearArconnect(): TUserAction;
    setKeyfile(keyfile: JWKInterface): TUserAction;
    clearKeyfile(): TUserAction;
    setZilPay(zilPay: any): TUserAction;
    clearZilPay(): TUserAction;
    setZilNetwork(network: any): TUserAction;
    clearZilNetwork(): TUserAction;
    setTravelRule(travelRule: Iivms101Message): TUserAction;
    clearTravelRule(): TUserAction;
}

export type TUserState = Readonly<{
    arAddress: TNullable<string>;
    zilAddress: TNullable<string>;
    ssiSecretKey: TNullable<string>;
    zilSecretKey: TNullable<string>;
    arConnect: TNullable<any>; //@to-do review along with keyfile
    keyFile: TNullable<JWKInterface>;
    zilPay: TNullable<any>;
    zilNetwork: TNullable<any>;
    travelRule: TNullable<Iivms101Message>;
}>;
