export enum ModalActionTypes {
  SetTxStatusLoading,
  SetTxId,
  updateLoginUsername,
  updateLoginAddress,
  updateLoginZilpay,
  updateLoginArAddress,
  updateLoginKeyFile,
}

export interface ModalAction {
  type: ModalActionTypes;
  payload?: any;
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

export function updateLoginInfoZilpay(data: {
  base16: string;
  bech32: string;
}): ModalAction {
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

export function updateLoginInfoKeyFile(data): ModalAction {
  return {
    type: ModalActionTypes.updateLoginKeyFile,
    payload: data,
  };
}
