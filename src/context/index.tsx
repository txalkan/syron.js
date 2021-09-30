import { userState, userReducer } from './user';
import { TUserState, TUserAction } from './user/types';
import { contextFactory } from '../utils/context';

export type TGlobalState = Readonly<{
    user: TUserState;
}>;

export const globalState: TGlobalState = {
    user: userState
};

export const { useDispatch, useSelector, stateContext, dispatchContext } =
    contextFactory(globalState);

export const globalReducer = (
    state: TGlobalState,
    action: unknown
): TGlobalState => ({
    user: userReducer(state.user, action as TUserAction)
});
