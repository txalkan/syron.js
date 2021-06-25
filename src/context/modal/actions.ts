import { ACTION_TYPES, IActionsCreator } from './types';

export const actionsCreator: IActionsCreator = {
  openModal: (modalName) => ({
    type: ACTION_TYPES.OPEN_MODAL,
    modalName
  }),
  closeModal: (modalName) => ({
    type: ACTION_TYPES.CLOSE_MODAL,
    modalName
  }),
  createModal: (modalName) => ({
    type: ACTION_TYPES.CREATE_MODAL,
    modalName
  }),
  destroyModal: (modalName) => ({
    type: ACTION_TYPES.DESTROY_MODAL,
    modalName
  })
};

export const actionsCreatorSec: IActionsCreator = {
  openModal: (modalName) => ({
    type: ACTION_TYPES.OPEN_MODAL,
    modalName
  }),
  closeModal: (modalName) => ({
    type: ACTION_TYPES.CLOSE_MODAL,
    modalName
  }),
  createModal: (modalName) => ({
    type: ACTION_TYPES.CREATE_MODAL,
    modalName
  }),
  destroyModal: (modalName) => ({
    type: ACTION_TYPES.DESTROY_MODAL,
    modalName
  })
};
