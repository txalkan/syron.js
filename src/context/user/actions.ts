import { JWKInterface } from 'arweave/node/lib/wallet';
import { Iivms101Message } from 'src/interfaces/IIvms101Message';
import { ACTION_TYPES, IActionsCreator } from './types';

export const actionsCreator: IActionsCreator = {
    setArAddress: (address: string) => ({
        type: ACTION_TYPES.SET_AR_ADDRESS,
        payload: address
    }),
    clearArAddress: () => ({
        type: ACTION_TYPES.CLEAR_AR_ADDRESS
    }),
    setZilAddress: (address: string) => ({
        type: ACTION_TYPES.SET_ZIL_ADDRESS,
        payload: address
    }),
    clearZilAddress: () => ({
        type: ACTION_TYPES.CLEAR_ZIL_ADDRESS
    }),
    setSsiSecretKey: (key: string) => ({
        type: ACTION_TYPES.SET_SSI_SECRET_KEY,
        payload: key
    }),
    clearSsiSecretKey: () => ({
        type: ACTION_TYPES.CLEAR_SSI_SECRET_KEY
    }),
    setZilSecretKey: (key: string) => ({
        type: ACTION_TYPES.SET_ZIL_SECRET_KEY,
        payload: key
    }),
    clearZilSecretKey: () => ({
        type: ACTION_TYPES.CLEAR_ZIL_SECRET_KEY
    }),
    setZilPay: (wallet: any) => ({
        type: ACTION_TYPES.SET_ZILPAY,
        payload: wallet
    }),
    clearZilPay: () => ({
        type: ACTION_TYPES.CLEAR_ZILPAY
    }),
    setZilNetwork: (network: any) => ({
        type: ACTION_TYPES.SET_ZIL_NETWORK,
        payload: network
    }),
    clearZilNetwork: () => ({
        type: ACTION_TYPES.CLEAR_ZIL_NETWORK
    }),
    setArconnect: (arConnect: any) => ({
        type: ACTION_TYPES.SET_ARCONNECT,
        payload: arConnect
    }),
    clearArconnect: () => ({
        type: ACTION_TYPES.CLEAR_ARCONNECT
    }),
    setKeyfile: (keyFile: JWKInterface) => ({
        type: ACTION_TYPES.SET_KEYFILE,
        payload: keyFile
    }),
    clearKeyfile: () => ({
        type: ACTION_TYPES.CLEAR_KEYFILE
    }),
    setTravelRule: (travelRule: Iivms101Message) => ({
        type: ACTION_TYPES.SET_TRAVEL_RULE,
        payload: travelRule
    }),
    clearTravelRule: () => ({
        type: ACTION_TYPES.CLEAR_TRAVEL_RULE
    })
};
