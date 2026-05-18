import { useEffect, useRef, type FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../app/store';
import { loginWithSteam } from '../../features/auth/authSlice';
import { showToast } from '../../features/ui/uiSlice';

const SteamCallbackHandler: FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const handled = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const steam = params.get('steam');
    if (!steam) return;
    if (handled.current) return;
    handled.current = true;

    params.delete('steam');
    const cleanSearch = params.toString();
    navigate(
      { pathname: location.pathname, search: cleanSearch ? `?${cleanSearch}` : '' },
      { replace: true }
    );

    if (steam === 'error') {
      dispatch(showToast({ message: 'Steam sign-in failed.', type: 'error' }));
      return;
    }

    if (steam === 'ok') {
      dispatch(loginWithSteam())
        .unwrap()
        .then((user) => {
          dispatch(
            showToast({
              message: `Signed in as ${user.displayName || user.username}.`,
              type: 'success',
            })
          );
        })
        .catch((msg: string) => {
          dispatch(
            showToast({
              message: typeof msg === 'string' ? msg : 'Steam login failed.',
              type: 'error',
            })
          );
        });
    }
  }, [location.search, location.pathname, dispatch, navigate]);

  return null;
};

export default SteamCallbackHandler;
