export enum ModalActionTypes {
    ShowSignInModal,
    HideSignInModal,
    ShowSsiKeyModal,
    HideSsiKeyModal,
    ShowNewWalletModal,
    HideNewWalletModal
}

export interface ModalAction {
    type: ModalActionTypes;
    payload?: any;
}

export function showSignInModal(): ModalAction {
    return {
        type: ModalActionTypes.ShowSignInModal
    };
}

export function hideSignInModal(): ModalAction {
    return {
        type: ModalActionTypes.HideSignInModal
    };
}

export function showSsiKeyModal(): ModalAction {
    return {
        type: ModalActionTypes.ShowSsiKeyModal
    };
}

export function hideSsiKeyModal(): ModalAction {
    return {
        type: ModalActionTypes.HideSsiKeyModal
    };
}

export function showNewWalletModal(): ModalAction {
    return {
        type: ModalActionTypes.ShowNewWalletModal
    };
}

export function hideNewWalletModal(): ModalAction {
    return {
        type: ModalActionTypes.HideNewWalletModal
    };
}
