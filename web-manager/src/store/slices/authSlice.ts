import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAdmin: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAdmin: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ user: AuthUser; token: string; isAdmin?: boolean }>
    ) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAdmin = action.payload.isAdmin ?? false;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAdmin = false;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
