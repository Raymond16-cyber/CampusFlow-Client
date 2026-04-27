import { combineReducers } from "redux";
import { authReducer } from "./authreducer";

const appReducer = (state = {}) => state;

const rootreducer = combineReducers({
	app: appReducer,
	auth: authReducer,
});

export default rootreducer;
