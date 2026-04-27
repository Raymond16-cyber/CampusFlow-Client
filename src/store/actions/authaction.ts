import axios from "axios";
import type { AnyAction } from "redux";
import type { ThunkAction } from "redux-thunk";
import type { RootState } from "../store";


export const baseURL = "http://172.20.10.2:5000";


export const registerAction = (
  data: any
): ThunkAction<Promise<void>, RootState, unknown, AnyAction> => {
  return async (dispatch) => {
    dispatch({ type: "REGISTER_REQUEST" });

    try {
      const res = await axios.post(`${baseURL}/api/auth/register`, data);

      dispatch({
        type: "REGISTER_SUCCESS",
        payload: {
          message: res.data.message,
          user: res.data.user,
          token: res.data.token,
          requiresVerification: res.data.requiresVerification,
          status: res.data.verification?.status
        }
      })

      
    } catch (error) {
      let errorMsg = "An unknown error occurred";

      if (axios.isAxiosError(error)) {
        errorMsg =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message;
      }
      dispatch({
        type: "REGISTER_FAILURE",
        payload: errorMsg,
      });     
    }
  };
};

export const loginAction = (
  data: { email: string; password: string }
): ThunkAction<Promise<void>, RootState, unknown, AnyAction> => {
  return async (dispatch) => {
    dispatch({ type: "LOGIN_REQUEST" });

    try {
      const res = await axios.post(`${baseURL}/api/auth/login`, data);

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          message: res.data.message || "Successfully logged in.",
          user: res.data.user,
          token: res.data.token,
          requiresVerification: false,
          status: null,
        },
      });
    } catch (error) {
      let errorMsg = "An unknown error occurred";

      if (axios.isAxiosError(error)) {
        errorMsg =
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message;
      }

      dispatch({
        type: "LOGIN_FAILURE",
        payload: errorMsg,
      });
    }
  };
};