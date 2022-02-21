import { JWKInterface } from "arweave/node/lib/wallet";
import { ACTION_TYPES, IActionsCreator } from "./types";

export const actionsCreator: IActionsCreator = {
  setArAddress: (address: string) => ({
    type: ACTION_TYPES.SET_AR_ADDRESS,
    payload: address,
  }),
  clearArAddress: () => ({
    type: ACTION_TYPES.CLEAR_AR_ADDRESS,
  }),
  setArconnect: (arConnect: any) => ({
    type: ACTION_TYPES.SET_ARCONNECT,
    payload: arConnect,
  }),
  clearArconnect: () => ({
    type: ACTION_TYPES.CLEAR_ARCONNECT,
  }),
  setKeyfile: (keyFile: JWKInterface) => ({
    type: ACTION_TYPES.SET_KEYFILE,
    payload: keyFile,
  }),
  clearKeyfile: () => ({
    type: ACTION_TYPES.CLEAR_KEYFILE,
  }),
};
