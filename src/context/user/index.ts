import { TUserState, TUserAction, ACTION_TYPES } from './types';

export const userState: TUserState = {
    arAddress: null,
    zilAddress: null,
    ssiSecretKey: null,
    zilSecretKey: null,
    arConnect: null,
    keyFile: null,
    zilPay: null,
    zilNetwork: null
};

//@to-do reevaluate
export const userReducer = (state: TUserState, action: TUserAction) => {
    switch (action.type) {
        case ACTION_TYPES.SET_AR_ADDRESS:
            return { ...state, arAddress: action.payload };
        case ACTION_TYPES.CLEAR_AR_ADDRESS:
            return { ...state, arAddress: null };
        case ACTION_TYPES.SET_ZIL_ADDRESS:
            return { ...state, zilAddress: action.payload };
        case ACTION_TYPES.CLEAR_ZIL_ADDRESS:
            return { ...state, zilAddress: null };
        case ACTION_TYPES.SET_SSI_SECRET_KEY:
            return { ...state, ssiSecretKey: action.payload };
        case ACTION_TYPES.CLEAR_SSI_SECRET_KEY:
            return { ...state, ssiSecretKey: null };
        case ACTION_TYPES.SET_ARCONNECT:
            return { ...state, arConnect: action.payload };
        case ACTION_TYPES.CLEAR_ARCONNECT:
            return { ...state, arConnect: null };
        case ACTION_TYPES.SET_KEYFILE:
            return { ...state, keyFile: action.payload };
        case ACTION_TYPES.CLEAR_KEYFILE:
            return { ...state, keyFile: null };
        case ACTION_TYPES.SET_ZILPAY:
            return { ...state, zilPay: action.payload };
        case ACTION_TYPES.CLEAR_ZILPAY:
            return { ...state, zilPay: null };
        case ACTION_TYPES.SET_ZIL_NETWORK:
            return { ...state, zilNetwork: action.payload };
        case ACTION_TYPES.CLEAR_ZIL_NETWORK:
            return { ...state, zilNetwork: null };
        default:
            return state;
    }
};
