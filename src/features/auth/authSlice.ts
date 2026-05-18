import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import * as authAPI from './authAPI';
import type { User } from './authAPI';
import { fetchSteamMe, signOutSteam } from '../games/gamesAPI';
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

export const loginWithSteam = createAsyncThunk<User, void, { state: RootState }>(
  'auth/loginWithSteam',
  async (_, { getState, rejectWithValue }) => {
    const steamMe = await fetchSteamMe();
    if (!steamMe) {
      return rejectWithValue('Steam session not found. Please sign in again.');
    }
    const { steamid, displayName, avatar } = steamMe;

    let user = await authAPI.findUserBySteamId(steamid);
    const currentUser = getState().auth.user;

    if (!user && currentUser && !currentUser.steamid) {
      user = await authAPI.updateUser(currentUser.id, {
        steamid,
        displayName: currentUser.displayName || displayName,
        avatar: currentUser.avatar || avatar,
      });
    }

    if (!user) {
      const baseUsername = displayName || `steam_${steamid}`;
      const allUsers = await authAPI.fetchUsers();
      const collision = allUsers.some((u) => u.username === baseUsername);
      const username = collision
        ? `${baseUsername}_${steamid.slice(-4)}`
        : baseUsername;
      user = await authAPI.registerUser({
        username,
        email: `steam-${steamid}@gamelib.local`,
        password: '',
        steamid,
        displayName,
        avatar,
      });
    }

    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await signOutSteam();
  } catch {
    // Best effort — server session may already be gone.
  }
  localStorage.removeItem('user');
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
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
      .addCase(loginWithSteam.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginWithSteam.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(loginWithSteam.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          (action.payload as string) || action.error.message || 'Steam login failed';
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.status = 'idle';
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.users = action.payload;
      });
  },
});

export const { clearError } = authSlice.actions;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;
export default authSlice.reducer;
