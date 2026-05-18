import { configureStore } from '@reduxjs/toolkit';
import filtersReducer from '../features/filters/filtersSlice';
import authReducer from '../features/auth/authSlice';
import { gameApi } from '../features/api/gameApi';
import { userApi } from '../features/api/userApi';

export const store = configureStore({
  reducer: {
    // Local UI / auth state
    filters: filtersReducer,
    auth: authReducer,
    // RTK Query API caches (games + lists, users)
    [gameApi.reducerPath]: gameApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(gameApi.middleware, userApi.middleware),
});

// The shape of the entire Redux state — use this in useSelector.
//   useSelector((state: RootState) => state.auth.user)
export type RootState = ReturnType<typeof store.getState>;

// The dispatch function — use this with useDispatch so async thunks and
// RTK Query mutations are typed.
//   const dispatch = useDispatch<AppDispatch>();
export type AppDispatch = typeof store.dispatch;
