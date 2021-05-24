import { TUserState, TUserAction, ACTION_TYPES } from './types';

export const userState: TUserState = {
  address: null
};

export const userReducer = (state: TUserState, action: TUserAction) => {
  switch (action.type) {
    case ACTION_TYPES.SET_ADDRESS:
      return { ...state, address: action.payload };
    case ACTION_TYPES.CLEAR_ADDRESS:
      return { ...state, address: null }
    default:
      return state;
  }
};
