import { combineReducers } from "@reduxjs/toolkit";
import { ModalAction, ModalActionTypes } from "./actions";

const initialState = {
  connectModal: false,
  arweaveModal: false,
  newSSIModal: false,
  txStatusModal: false,
  txStatusLoading: "idle",
  txId: "",
  getStartedModal: false,
};

function modalReducer(state = initialState, action: ModalAction) {
  switch (action.type) {
    case ModalActionTypes.ShowConnectModal:
      return {
        ...state,
        connectModal: true,
      };
    case ModalActionTypes.HideConnectModal:
      return {
        ...state,
        connectModal: false,
      };
    case ModalActionTypes.ShowArweaveModal:
      return {
        ...state,
        arweaveModal: true,
      };
    case ModalActionTypes.HideArweaveModal:
      return {
        ...state,
        arweaveModal: false,
      };
    case ModalActionTypes.ShowNewSSIModal:
      return {
        ...state,
        newSSIModal: true,
      };
    case ModalActionTypes.HideNewSSIModal:
      return {
        ...state,
        newSSIModal: false,
      };
    case ModalActionTypes.ShowTxStatusModal:
      return {
        ...state,
        txStatusModal: true,
      };
    case ModalActionTypes.HideTxStatusModal:
      return {
        ...state,
        txStatusModal: false,
      };
    case ModalActionTypes.SetTxStatusLoading:
      return {
        ...state,
        txStatusLoading: action.payload,
      };
    case ModalActionTypes.SetTxId:
      return {
        ...state,
        txId: action.payload,
      };
    case ModalActionTypes.ShowGetStartedModal:
      return {
        ...state,
        getStartedModal: action.payload,
      };
    default:
      return state;
  }
}

const rootReducer = combineReducers({ modal: modalReducer });
export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
