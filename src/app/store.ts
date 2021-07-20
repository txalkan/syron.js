import { createStore, ThunkAction, Action } from '@reduxjs/toolkit';
import rootReducer from './reducers';

const store = createStore(rootReducer);
export default store;

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>;
