import { useEffect, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { linkSteamAccount } from '../features/steam/steamSlice';
import { setSteamUser } from '../features/auth/authSlice';
import type { AppDispatch } from '../app/store';
import styles from './HomePage.module.css';

const SteamSuccessPage: FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const finalizeSteamLink = async () => {
      try {
        // 1. Fetch the profile from our backend
        const response = await axios.get('http://localhost:3001/api/auth/profile', {
          withCredentials: true
        });
        
        const steamProfile = response.data;
        const steamId = steamProfile.id || steamProfile.identifier?.split('/').pop();
        
        if (steamId) {
          // 2. Create a virtual user session in the frontend auth slice
          // This ensures ProtectedRoutes allow the user through
          dispatch(setSteamUser({
            id: `steam_${steamId}`,
            username: steamProfile.displayName || steamProfile.personaname || 'Steam User',
            email: '', // Steam doesn't provide email via OpenID
            password: ''
          }));

          // 3. Link the Steam account in the steam slice
          await dispatch(linkSteamAccount(steamId)).unwrap();
          
          navigate('/');
        } else {
          console.error('Steam ID not found in profile');
          navigate('/login?error=steam_id_missing');
        }
      } catch (error) {
        console.error('Failed to finalize Steam link', error);
        navigate('/login?error=steam_auth_failed');
      }
    };

    finalizeSteamLink();
  }, [dispatch, navigate]);

  return (
    <div className={styles.container} style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Connecting to Steam...</h1>
      <p>Please wait while we sync your profile.</p>
      <div className="loading-spinner"></div>
    </div>
  );
};

export default SteamSuccessPage;
