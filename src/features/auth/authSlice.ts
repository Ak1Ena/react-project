import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from './authAPI';
import type { RootState } from '../../app/store';

interface AuthState {
  user: User | null;
  error: string | null;
}

const savedUser = localStorage.getItem('user');

const initialState: AuthState = {
  user: savedUser ? JSON.parse(savedUser) : null,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.error = null;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    setAuthError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.error = null;
      localStorage.removeItem('user');
    },
  },
});

export const { setUser, setAuthError, clearError, logout } = authSlice.actions;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectAuthError = (state: RootState) => state.auth.error;
export default authSlice.reducer;
