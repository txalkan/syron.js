import { TNullable } from '../../interfaces/IData';

export enum ACTION_TYPES {
  SET_ADDRESS = "SET_ADDRESS",
  CLEAR_ADDRESS = "CLEAR_ADDRESS",
}

export type TUserAction =
  | {
      type: ACTION_TYPES.SET_ADDRESS;
      payload: string;
    }
  | {
      type: ACTION_TYPES.CLEAR_ADDRESS;
    };

export interface IActionsCreator {
  setAddress(address: string): TUserAction;
  clearAddress(): TUserAction;
}

export type TUserState = Readonly<{
  address: TNullable<string>;
}>;
