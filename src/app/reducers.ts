import { combineReducers } from '@reduxjs/toolkit'
import { ModalAction, ModalActionTypes } from './actions'
import { persistReducer } from 'redux-persist'
import createWebStorage from 'redux-persist/lib/storage/createWebStorage'

const initialState = {
    txStatusLoading: 'idle',
    txId: '',
    loggedInDomain: null,
    loggedInVersion: null,
    loggedInAddress: null,
    zilAddr: null,
    arAddr: null,
    keyFile: null,
    selectedCurrencyDropdown: [],

    //@tydras
    selectedCollectiblesDropdown: [
        'nawelito',
        'nawelitoonfire',
        'nessy',
        'merxek',
        'lexicassi',
    ],
    lang: 'en',
    net: 'mainnet',
    arconnect: null,
    isLight: false,
    isIncognito: false,
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
                loggedInDomain: action.payload,
            }
        case ModalActionTypes.updateLoggedInVersion:
            return {
                ...state,
                loggedInVersion: action.payload,
            }
        case ModalActionTypes.updateLoginAddress:
            return {
                ...state,
                loggedInAddress: action.payload,
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
        case ModalActionTypes.updateCollectiblesDropdown:
            return {
                ...state,
                selectedCollectiblesDropdown: action.payload,
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
        case ModalActionTypes.updateArConnect:
            return {
                ...state,
                arconnect: action.payload,
            }
        case ModalActionTypes.updateIsLight:
            return {
                ...state,
                isLight: action.payload,
            }
        case ModalActionTypes.updateIsIncognito:
            return {
                ...state,
                isIncognito: action.payload,
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
