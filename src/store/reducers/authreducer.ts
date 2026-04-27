

type AuthState = {
  user: any | null;
  token: string | null;
  requiresVerification: boolean;
  verificationStatus: string | null;
  loading: boolean;
  message: string | null;
  error: string | null;
  isAuthenticated: boolean;
};

const initialState: AuthState = {
  user: null,
  token: null,
  requiresVerification: false,
  verificationStatus: null,
  loading: false,
  message: null,
  error: null,
  isAuthenticated: false,
};

export const authReducer = (state = initialState, action: any): AuthState => {
  switch (action.type) {
    case "REGISTER_REQUEST":
    case "LOGIN_REQUEST":
      return {
        ...state,
        loading: true,
        message: null,
        error: null,
      };
    case "REGISTER_SUCCESS":
    case "LOGIN_SUCCESS":
      return {
        ...state,
        loading: false,
        user: action.payload.user ?? null,
        token: action.payload.token ?? null,
        requiresVerification: Boolean(action.payload.requiresVerification),
        verificationStatus: action.payload.status ?? null,
        message: action.payload.message ?? "Registration successful",
        error: null,
        isAuthenticated: Boolean(action.payload.token),
      };
    case "REGISTER_FAILURE":
    case "LOGIN_FAILURE":
      return {
        ...state,
        loading: false,
        message: null,
        error: action.payload,
      };
    case "CLEAR_AUTH_FEEDBACK":
      return {
        ...state,
        message: null,
        error: null,
      };
    default:
      return state;
  }
};