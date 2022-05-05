import { legacy_createStore as createStore } from "@reduxjs/toolkit";
import rootReducer from "./reducers";
import { persistStore } from "redux-persist";

export const store = createStore(rootReducer);

export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
