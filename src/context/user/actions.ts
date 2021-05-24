import { ACTION_TYPES, IActionsCreator } from './types';

export const actionsCreator: IActionsCreator = {
  setAddress: (adress: string) => ({
    type: ACTION_TYPES.SET_ADDRESS,
    payload: adress
  }),
  clearAddress: () => ({
    type: ACTION_TYPES.CLEAR_ADDRESS
  })
}
