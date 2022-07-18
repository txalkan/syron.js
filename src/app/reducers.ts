import { combineReducers } from '@reduxjs/toolkit'
import { ModalAction, ModalActionTypes } from './actions'
import { persistReducer } from 'redux-persist'
import createWebStorage from 'redux-persist/lib/storage/createWebStorage'

const initialState = {
    txStatusLoading: 'idle',
    txId: '',
    username: null,
    address: null,
    zilAddr: null,
    arAddr: null,
    keyFile: null,
    selectedCurrencyDropdown: [],
    resolvedUsername: null,
    lang: 'en',
    net: 'mainnet',
}

function modalReducer(state = initialState, action: ModalAction) {
    switch (action.type) {
        case ModalActionTypes.SetTxStatusLoading:
            return {
                ...state,
                txStatusLoading: action.payload,
            }
        case ModalActionTypes.SetTxId:
            return {
                ...state,
                txId: action.payload,
            }
        case ModalActionTypes.updateLoginUsername:
            return {
                ...state,
                username: action.payload,
            }
        case ModalActionTypes.updateLoginAddress:
            return {
                ...state,
                address: action.payload,
            }
        case ModalActionTypes.updateLoginZilpay:
            return {
                ...state,
                zilAddr: action.payload,
            }
        case ModalActionTypes.updateLoginArAddress:
            return {
                ...state,
                arAddr: action.payload,
            }
        case ModalActionTypes.updateLoginKeyFile:
            return {
                ...state,
                keyFile: action.payload,
            }
        case ModalActionTypes.updateCurrencyDropdown:
            return {
                ...state,
                selectedCurrencyDropdown: action.payload,
            }
        case ModalActionTypes.updateResolvedInfo:
            return {
                ...state,
                resolvedUsername: action.payload,
            }
        case ModalActionTypes.updateLang:
            return {
                ...state,
                lang: action.payload,
            }
        case ModalActionTypes.updateNet:
            return {
                ...state,
                net: action.payload,
            }
        default:
            return state
    }
}

const createNoopStorage = () => {
    return {
        getItem(_key) {
            return Promise.resolve(null)
        },
        setItem(_key, value) {
            return Promise.resolve(value)
        },
        removeItem(_key) {
            return Promise.resolve()
        },
    }
}

const storage =
    typeof window === 'undefined'
        ? createNoopStorage()
        : createWebStorage('local')

const reducer = combineReducers({ modal: modalReducer })
const persistConfig = {
    key: 'root',
    storage,
}
const rootReducer = persistReducer(persistConfig, reducer)
export type RootState = ReturnType<typeof rootReducer>
export default rootReducer
