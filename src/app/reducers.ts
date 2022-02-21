import { combineReducers } from "@reduxjs/toolkit";
import { ModalAction, ModalActionTypes } from "./actions";

const initialState = {
  signInModal: false,
  ssiKeyModal: false,
  newWalletModal: false,
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
    default:
      return state;
  }
}

const rootReducer = combineReducers({ modal: modalReducer });
export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
