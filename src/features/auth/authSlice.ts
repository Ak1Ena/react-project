import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';

interface AuthState {
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
}

const initialState: AuthState = {
  user: {
    id: 'user-1',
    name: 'Mock User',
    email: 'mock@example.com',
  },
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
    },
  },
});

export const { logout } = authSlice.actions;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export default authSlice.reducer;
