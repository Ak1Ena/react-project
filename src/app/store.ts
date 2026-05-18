import { configureStore } from '@reduxjs/toolkit';
import type { ThunkAction, Action } from '@reduxjs/toolkit';
import gamesReducer from '../features/games/gamesSlice';
import listsReducer from '../features/lists/listsSlice';
import filtersReducer from '../features/filters/filtersSlice';
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
  reducer: {
    games: gamesReducer,
    lists: listsReducer,
    filters: filtersReducer,
    auth: authReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
