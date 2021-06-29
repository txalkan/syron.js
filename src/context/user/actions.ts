import { ACTION_TYPES, IActionsCreator } from './types';

export const actionsCreator: IActionsCreator = {
  setArAddress: (address: string) => ({
    type: ACTION_TYPES.SET_AR_ADDRESS,
    payload: address
  }),
  clearArAddress: () => ({
    type: ACTION_TYPES.CLEAR_AR_ADDRESS
  }),
  setArSecretKey: (key: string) => ({
    type: ACTION_TYPES.SET_AR_SECRET_KEY,
    payload: key
  }),
  clearArSecretKey: () => ({
    type: ACTION_TYPES.CLEAR_AR_SECRET_KEY,
  }),
  setZilAddress: (address: string) => ({
    type: ACTION_TYPES.SET_ZIL_ADDRESS,
    payload: address
  }),
  clearZilAddress: () => ({
    type: ACTION_TYPES.CLEAR_ZIL_ADDRESS
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
  })
}
