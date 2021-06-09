import { userState, userReducer } from './user';
import { TUserState, TUserAction } from './user/types';
import { modalState, modalReducer } from './modal';
import { TModalAction, TModalState } from './modal/types';

import { contextFactory } from '../utils/context';

export type TGlobalState = Readonly<{
  user: TUserState;
  modal: TModalState;
}>;

export const globalState: TGlobalState = {
  user: userState,
  modal: modalState
};

export const { useDispatch, useSelector, stateContext, dispatchContext } =
  contextFactory(globalState);

export const globalReducer = (
  state: TGlobalState,
  action: unknown
): TGlobalState => ({
  user: userReducer(state.user, action as TUserAction),
  modal: modalReducer(state.modal, action as TModalAction)
});
