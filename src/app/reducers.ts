import { combineReducers } from "@reduxjs/toolkit";
import { ModalAction, ModalActionTypes } from "./actions";

const initialState = {
  signInModal: false,
  ssiKeyModal: false,
  newWalletModal: false,
  txStatusModal: false,
  txStatusLoading: false,
  txId: "",
};

function modalReducer(state = initialState, action: ModalAction) {
  switch (action.type) {
    case ModalActionTypes.ShowSignInModal:
      return {
        ...state,
        signInModal: true,
      };
    case ModalActionTypes.HideSignInModal:
      return {
        ...state,
        signInModal: false,
      };
    case ModalActionTypes.ShowSsiKeyModal:
      return {
        ...state,
        ssiKeyModal: true,
      };
    case ModalActionTypes.HideSsiKeyModal:
      return {
        ...state,
        ssiKeyModal: false,
      };
    case ModalActionTypes.ShowNewWalletModal:
      return {
        ...state,
        newWalletModal: true,
      };
    case ModalActionTypes.HideNewWalletModal:
      return {
        ...state,
        newWalletModal: false,
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
    default:
      return state;
  }
}

const rootReducer = combineReducers({ modal: modalReducer });
export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
