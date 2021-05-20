import { createContext, Dispatch, useContext } from 'react';

export const contextFactory = <State, Action>(defaultState: State) => {
  const defaultDispatcher: Dispatch<Action> = () => ({});

  const stateContext = createContext<State>(defaultState);
  const dispatchContext = createContext<Dispatch<any>>(defaultDispatcher);

  const useDispatch = () => {
    const dispatch = useContext(dispatchContext);
    return dispatch;
  };

  const useSelector = <T>(selector: (state: State) => T) => {
    const state = useContext(stateContext);
    return selector(state);
  };

  return { useDispatch, useSelector, stateContext, dispatchContext };
};
