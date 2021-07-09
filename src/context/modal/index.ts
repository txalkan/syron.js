import { TModalState, TModalAction, ACTION_TYPES } from './types';

export const modalState: TModalState = {
    SIGN_IN: {
        isOpen: false
    }
};

export const modalReducer = (
    state: TModalState,
    action: TModalAction
) => {
    switch (action.type) {
        case ACTION_TYPES.OPEN_MODAL:
            return {
                [action.name]: { 
                    ...state[action.name],
                    isOpen: true }
            };
        case ACTION_TYPES.CLOSE_MODAL:
            return {
                [action.name]: {
                    ...state[action.name],
                    isOpen: false
                }
            };
        case ACTION_TYPES.CREATE_MODAL:
            return {
                [action.name]: { 
                    isOpen: false 
                }
            };
        case ACTION_TYPES.DESTROY_MODAL: {
            const newState = { ...modalState };
            delete newState[action.name];
            return newState;
        }
    }
};
