import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../app/store';
import { trackSteamActivity, fetchSteamProfile } from '../features/steam/steamSlice';

export const useSteamTracking = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { steamId } = useSelector((state: RootState) => state.steam);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (steamId && user) {
      // Initial fetch
      dispatch(fetchSteamProfile(steamId));
      dispatch(trackSteamActivity());

      // Set up periodic tracking every 5 minutes
      const interval = setInterval(() => {
        dispatch(trackSteamActivity());
      }, 5 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [steamId, user, dispatch]);
};
