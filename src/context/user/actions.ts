import { ACTION_TYPES, IActionsCreator } from './types';

export const actionsCreator: IActionsCreator = {
  setArAddress: (adress: string) => ({
    type: ACTION_TYPES.SET_AR_ADDRESS,
    payload: adress
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
  setZilSecretKey: (key: string) => ({
    type: ACTION_TYPES.SET_ZIL_SECRET_KEY,
    payload: key
  }),
  clearZilSecretKey: () => ({
    type: ACTION_TYPES.CLEAR_ZIL_SECRET_KEY
  })
}
