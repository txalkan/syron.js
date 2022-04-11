export enum ModalActionTypes {
  ShowConnectModal,
  HideConnectModal,
  ShowArweaveModal,
  HideArweaveModal,
  ShowNewSSIModal,
  HideNewSSIModal,
  ShowTxStatusModal,
  HideTxStatusModal,
  SetTxStatusLoading,
  SetTxId,
  ShowGetStartedModal,
  ShowLoginModal,
}

export interface ModalAction {
  type: ModalActionTypes;
  payload?: any;
}

export function showConnectModal(): ModalAction {
  return {
    type: ModalActionTypes.ShowConnectModal,
  };
}

export function hideConnectModal(): ModalAction {
  return {
    type: ModalActionTypes.HideConnectModal,
  };
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

export function showNewSSIModal(): ModalAction {
  return {
    type: ModalActionTypes.ShowNewSSIModal,
  };
}

export function hideNewSSIModal(): ModalAction {
  return {
    type: ModalActionTypes.HideNewSSIModal,
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
