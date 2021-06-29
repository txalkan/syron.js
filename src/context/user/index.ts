import { TUserState, TUserAction, ACTION_TYPES } from './types';

export const userState: TUserState = {
  arAddress: null,
  arweaveSecretKey: null,
  zilAddress: null,
  zilNetwork: null,
  zilPay: null,
  zilliqaSecretKey: null
};

export const userReducer = (state: TUserState, action: TUserAction) => {
  switch (action.type) {
    case ACTION_TYPES.SET_AR_ADDRESS:
      return { ...state, address: action.payload };
    case ACTION_TYPES.CLEAR_AR_ADDRESS:
      return { ...state, address: null }
    default:
      return state;
  }
};
