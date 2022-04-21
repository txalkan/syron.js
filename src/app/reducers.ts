import { combineReducers } from "@reduxjs/toolkit";
import { ModalAction, ModalActionTypes } from "./actions";
import { persistReducer } from "redux-persist";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";

const initialState = {
  arweaveModal: false,
  newSSIModal: false,
  loginModal: false,
  txStatusModal: false,
  txStatusLoading: "idle",
  txId: "",
  getStartedModal: false,
  username: null,
  address: null,
  zilAddr: null,
  arAddr: null,
};

function modalReducer(state = initialState, action: ModalAction) {
  switch (action.type) {
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
    case ModalActionTypes.SetSsiModal:
      return {
        ...state,
        newSSIModal: action.payload,
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
    case ModalActionTypes.ShowLoginModal:
      return {
        ...state,
        loginModal: action.payload,
      };
    case ModalActionTypes.updateLoginUsername:
      return {
        ...state,
        username: action.payload,
      };
    case ModalActionTypes.updateLoginAddress:
      return {
        ...state,
        address: action.payload,
      };
    case ModalActionTypes.updateLoginZilpay:
      return {
        ...state,
        zilAddr: action.payload,
      };
    case ModalActionTypes.updateLoginArAddress:
      return {
        ...state,
        arAddr: action.payload,
      };
    default:
      return state;
  }
}

const createNoopStorage = () => {
  return {
    getItem(_key) {
      return Promise.resolve(null);
    },
    setItem(_key, value) {
      return Promise.resolve(value);
    },
    removeItem(_key) {
      return Promise.resolve();
    },
  };
};

const storage =
  typeof window === "undefined"
    ? createNoopStorage()
    : createWebStorage("local");

const reducer = combineReducers({ modal: modalReducer });
const persistConfig = {
  key: "root",
  storage,
};
const rootReducer = persistReducer(persistConfig, reducer);
export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
