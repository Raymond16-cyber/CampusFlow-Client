import { applyMiddleware, createStore } from "redux";
import { thunk } from "redux-thunk";
import rootreducer from "./reducers/rootreducer";

export const store = createStore(rootreducer, applyMiddleware(thunk));

export type RootState = ReturnType<typeof rootreducer>;
export type AppDispatch = typeof store.dispatch;
