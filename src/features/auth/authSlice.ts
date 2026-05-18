import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import * as authAPI from './authAPI';
import type { User } from './authAPI';
import type { RootState } from '../../app/store';

interface AuthState {
  user: User | null;
  users: User[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const savedUser = localStorage.getItem('user');

const initialState: AuthState = {
  user: savedUser ? JSON.parse(savedUser) : null,
  users: [],
  status: 'idle',
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: Pick<User, 'username' | 'password'>) => {
    const user = await authAPI.loginUser(credentials);
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: Omit<User, 'id'>) => {
    const user = await authAPI.registerUser(userData);
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }
);

export const fetchAllUsers = createAsyncThunk(
  'auth/fetchAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      return await authAPI.fetchUsers();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch users';
      return rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem('user');
    },
    setSteamUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.status = 'succeeded';
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Login failed';
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Registration failed';
      })
      .addCase(fetchAllUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.users = action.payload;
      });
  },
});

export const { logout, clearError, setSteamUser } = authSlice.actions;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;
export default authSlice.reducer;
