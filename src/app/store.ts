import { configureStore } from '@reduxjs/toolkit';
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

// The shape of the entire Redux state — use this in useSelector.
//   useSelector((state: RootState) => state.games.items)
export type RootState = ReturnType<typeof store.getState>;

// The dispatch function — use this with useDispatch so async thunks are typed.
//   const dispatch = useDispatch<AppDispatch>();
export type AppDispatch = typeof store.dispatch;
