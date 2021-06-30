import { TUserState, TUserAction, ACTION_TYPES } from './types';

export const userState: TUserState = {
    arAddress: null,
    arweaveSecretKey: null,
    zilAddress: null,
    zilNetwork: null,
    zilPay: null,
    zilliqaSecretKey: null,
    arconnect: null,
    keyfile: null,
    travelRule: null
};

//@to-do reevaluate
export const userReducer = (state: TUserState, action: TUserAction) => {
    switch (action.type) {
        case ACTION_TYPES.SET_AR_ADDRESS:
            return { ...state, address: action.payload };
        case ACTION_TYPES.CLEAR_AR_ADDRESS:
            return { ...state, address: null };
        default:
            return state;
    }
};
