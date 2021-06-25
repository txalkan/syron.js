import { userState, userReducer } from './user';
import { TUserState, TUserAction } from './user/types';
import {
  modalState,
  modalReducer,
  secModalState,
  secModalReducer
} from './modal';
import {
  TModalAction,
  TModalState,
  TModalStateSec,
  TSecModalAction
} from './modal/types';

import { contextFactory } from '../utils/context';

export type TGlobalState = Readonly<{
  user: TUserState;
  modal: TModalState;
  secModal: TModalStateSec;
}>;

export const globalState: TGlobalState = {
  user: userState,
  modal: modalState,
  secModal: secModalState
};

export const { useDispatch, useSelector, stateContext, dispatchContext } =
  contextFactory(globalState);

export const globalReducer = (
  state: TGlobalState,
  action: unknown
): TGlobalState => ({
  user: userReducer(state.user, action as TUserAction),
  modal: modalReducer(state.modal, action as TModalAction),
  secModal: secModalReducer(state.secModal, action as TSecModalAction)
});
