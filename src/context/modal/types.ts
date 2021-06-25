export enum MODALS {
  SIGN_IN = 'SIGN_IN',
  PRIVATE_KEY = 'PRIVATE_KEY'
}

export enum ACTION_TYPES {
  OPEN_MODAL = 'OPEN_MODAL',
  CLOSE_MODAL = 'CLOSE_MODAL',
  CREATE_MODAL = 'CREATE_MODAL',
  DESTROY_MODAL = 'DESTROY_MODAL'
}

export type TModalAction =
  | {
      type: ACTION_TYPES.OPEN_MODAL;
      modalName: string;
    }
  | { type: ACTION_TYPES.CLOSE_MODAL; modalName: string }
  | { type: ACTION_TYPES.CREATE_MODAL; modalName: string }
  | { type: ACTION_TYPES.DESTROY_MODAL; modalName: string };

export type TSecModalAction =
  | {
      type: ACTION_TYPES.OPEN_MODAL;
      modalName: string;
    }
  | { type: ACTION_TYPES.CLOSE_MODAL; modalName: string }
  | { type: ACTION_TYPES.CREATE_MODAL; modalName: string }
  | { type: ACTION_TYPES.DESTROY_MODAL; modalName: string };
export interface IActionsCreator {
  openModal(name: string): TModalAction;
  closeModal(name: string): TModalAction;
  createModal(name: string): TModalAction;
  destroyModal(name: string): TModalAction;
}

export type TModalState = Readonly<{
  [key: string]: {
    isOpen: boolean;
  };
}>;

export type TModalStateSec = Readonly<{
  [secKey: string]: {
    isOpen: boolean;
  };
}>;
