import { ACTION_TYPES, IActionsCreator } from './types';

export const actionsCreator: IActionsCreator = {
    openModal: (name) => ({
        type: ACTION_TYPES.OPEN_MODAL,
        name
    }),
    closeModal: (name) => ({
        type: ACTION_TYPES.CLOSE_MODAL,
        name
    }),
    createModal: (name) => ({
        type: ACTION_TYPES.CREATE_MODAL,
        name
    }),
    destroyModal: (name) => ({
        type: ACTION_TYPES.DESTROY_MODAL,
        name
    })
};
