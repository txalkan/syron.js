export enum ModalActionTypes {
  ShowSignInModal,
  HideSignInModal,
  ShowSsiKeyModal,
  HideSsiKeyModal,
  ShowNewWalletModal,
  HideNewWalletModal,
  ShowTxStatusModal,
  HideTxStatusModal,
  SetTxStatusLoading,
  SetTxId,
}

export interface ModalAction {
  type: ModalActionTypes;
  payload?: any;
}

export function showSignInModal(): ModalAction {
  return {
    type: ModalActionTypes.ShowSignInModal,
  };
}

export function hideSignInModal(): ModalAction {
  return {
    type: ModalActionTypes.HideSignInModal,
  };
}

export function showSsiKeyModal(): ModalAction {
  return {
    type: ModalActionTypes.ShowSsiKeyModal,
  };
}

export function hideSsiKeyModal(): ModalAction {
  return {
    type: ModalActionTypes.HideSsiKeyModal,
  };
}

export function showNewWalletModal(): ModalAction {
  return {
    type: ModalActionTypes.ShowNewWalletModal,
  };
}

export function hideNewWalletModal(): ModalAction {
  return {
    type: ModalActionTypes.HideNewWalletModal,
  };
}

export function showTxStatusModal(): ModalAction {
  return {
    type: ModalActionTypes.ShowTxStatusModal,
  };
}

export function hideTxStatusModal(): ModalAction {
  return {
    type: ModalActionTypes.HideTxStatusModal,
  };
}

export function setTxStatusLoading(data): ModalAction {
  return {
    type: ModalActionTypes.SetTxStatusLoading,
    payload: data,
  };
}

export function setTxId(data): ModalAction {
  return {
    type: ModalActionTypes.SetTxId,
    payload: data,
  };
}
