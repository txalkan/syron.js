export enum MODALS {
    SIGN_IN = 'SIGN_IN',
    SSI_SECRET_KEY = 'SSI_SECRET_KEY'
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
        name: string;
    }
    | { 
        type: ACTION_TYPES.CLOSE_MODAL;
        name: string
    }
    | { 
        type: ACTION_TYPES.CREATE_MODAL;
        name: string
    }
    | { 
        type: ACTION_TYPES.DESTROY_MODAL;
        name: string 
    };

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
