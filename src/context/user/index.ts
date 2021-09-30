import { TUserState, TUserAction, ACTION_TYPES } from './types';

export const userState: TUserState = {
    arAddress: null,
    arConnect: null,
    keyFile: null
};

//@to-do reevaluate
export const userReducer = (state: TUserState, action: TUserAction) => {
    switch (action.type) {
        case ACTION_TYPES.SET_AR_ADDRESS:
            return { ...state, arAddress: action.payload };
        case ACTION_TYPES.CLEAR_AR_ADDRESS:
            return { ...state, arAddress: null };
        case ACTION_TYPES.SET_ARCONNECT:
            return { ...state, arConnect: action.payload };
        case ACTION_TYPES.CLEAR_ARCONNECT:
            return { ...state, arConnect: null };
        case ACTION_TYPES.SET_KEYFILE:
            return { ...state, keyFile: action.payload };
        case ACTION_TYPES.CLEAR_KEYFILE:
            return { ...state, keyFile: null };
        default:
            return state;
    }
};
