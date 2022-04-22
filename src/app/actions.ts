export enum ModalActionTypes {
  ShowArweaveModal,
  HideArweaveModal,
  SetSsiModal,
  ShowTxStatusModal,
  HideTxStatusModal,
  SetTxStatusLoading,
  SetTxId,
  ShowGetStartedModal,
  ShowLoginModal,
  updateLoginUsername,
  updateLoginAddress,
  updateLoginZilpay,
  updateLoginArAddress,
  ShowBuyNFTModal,
}

export interface ModalAction {
  type: ModalActionTypes;
  payload?: any;
}

export function showArweaveModal(): ModalAction {
  return {
    type: ModalActionTypes.ShowArweaveModal,
  };
}

export function hideArweaveModal(): ModalAction {
  return {
    type: ModalActionTypes.HideArweaveModal,
  };
}

export function setSsiModal(data): ModalAction {
  return {
    type: ModalActionTypes.SetSsiModal,
    payload: data,
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

export function setTxStatusLoading(data: any): ModalAction {
  return {
    type: ModalActionTypes.SetTxStatusLoading,
    payload: data,
  };
}

export function setTxId(data: any): ModalAction {
  return {
    type: ModalActionTypes.SetTxId,
    payload: data,
  };
}

export function showGetStartedModal(data: boolean): ModalAction {
  return {
    type: ModalActionTypes.ShowGetStartedModal,
    payload: data,
  };
}

export function showLoginModal(data: boolean): ModalAction {
  return {
    type: ModalActionTypes.ShowLoginModal,
    payload: data,
  };
}

export function updateLoginInfoUsername(data: String): ModalAction {
  return {
    type: ModalActionTypes.updateLoginUsername,
    payload: data,
  };
}

export function updateLoginInfoAddress(data: String): ModalAction {
  return {
    type: ModalActionTypes.updateLoginAddress,
    payload: data,
  };
}

export function updateLoginInfoZilpay(data): ModalAction {
  return {
    type: ModalActionTypes.updateLoginZilpay,
    payload: data,
  };
}

export function updateLoginInfoArAddress(data: String): ModalAction {
  return {
    type: ModalActionTypes.updateLoginArAddress,
    payload: data,
  };
}

export function showBuyNFTModal(data: boolean): ModalAction {
  return {
    type: ModalActionTypes.ShowBuyNFTModal,
    payload: data,
  };
}
