import {
    TModalState,
    TModalAction,
    ACTION_TYPES,
    TModalStateSec
} from './types';

export const modalState: TModalState = {};

export const secModalState: TModalStateSec = {};

export const modalReducer = (state: TModalState, action: TModalAction) => {
    switch (action.type) {
        case ACTION_TYPES.OPEN_MODAL:
            return {
                [action.modalName]: { ...state[action.modalName], isOpen: true }
            };
        case ACTION_TYPES.CLOSE_MODAL:
            return {
                [action.modalName]: {
                    ...state[action.modalName],
                    isOpen: false
                }
            };
        case ACTION_TYPES.CREATE_MODAL:
            return {
                [action.modalName]: { isOpen: false }
            };
        case ACTION_TYPES.DESTROY_MODAL: {
            const newState = { ...modalState };
            delete newState[action.modalName];
            return newState;
        }
    }
};

export const secModalReducer = (
    state: TModalStateSec,
    action: TModalAction
) => {
    switch (action.type) {
        case ACTION_TYPES.OPEN_MODAL:
            return {
                [action.modalName]: { ...state[action.modalName], isOpen: true }
            };
        case ACTION_TYPES.CLOSE_MODAL:
            return {
                [action.modalName]: {
                    ...state[action.modalName],
                    isOpen: false
                }
            };
        case ACTION_TYPES.CREATE_MODAL:
            return {
                [action.modalName]: { isOpen: false }
            };
        case ACTION_TYPES.DESTROY_MODAL: {
            const newState = { ...modalState };
            delete newState[action.modalName];
            return newState;
        }
    }
};
