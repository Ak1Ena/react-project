import { Router } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
const STEAM_KEY = process.env.STEAM_API_KEY;
const API_BASE = 'https://api.steampowered.com';
const STORE_BASE = 'https://store.steampowered.com/api';

// 1. Resolve Vanity URL
router.get('/resolve-vanity/:vanityUrl', async (req, res) => {
  try {
    const { vanityUrl } = req.params;
    const response = await axios.get(`${API_BASE}/ISteamUser/ResolveVanityURL/v0001/`, {
      params: {
        key: STEAM_KEY,
        vanityurl: vanityUrl,
      },
    });

    if (response.data.response.success === 1) {
      return res.json({ steamid: response.data.response.steamid });
    }
    return res.status(404).json({ message: 'Vanity URL not found' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message });
  }
});

// 2. Get Owned Games
router.get('/owned-games/:steamId', async (req, res) => {
  try {
    const { steamId } = req.params;
    const response = await axios.get(`${API_BASE}/IPlayerService/GetOwnedGames/v0001/`, {
      params: {
        key: STEAM_KEY,
        steamid: steamId,
        format: 'json',
        include_appinfo: 1,
        include_played_free_games: 1,
      },
    });

    res.json(response.data.response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message });
  }
});

// 3. Get Game Details
router.get('/game-details/:appId', async (req, res) => {
  try {
    const { appId } = req.params;
    const response = await axios.get(`${STORE_BASE}/appdetails`, {
      params: {
        appids: appId,
      },
    });

    const data = response.data[appId];
    if (data.success) {
      return res.json(data.data);
    }
    res.status(404).json({ message: 'Game details not found' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message });
  }
});

// 4. Get Player Achievements
router.get('/achievements/:steamId/:appId', async (req, res) => {
  try {
    const { steamId, appId } = req.params;
    const response = await axios.get(`${API_BASE}/ISteamUserStats/GetPlayerAchievements/v0001/`, {
      params: {
        key: STEAM_KEY,
        steamid: steamId,
        appid: appId,
      },
    });

    res.json(response.data.playerstats);
  } catch (_error) {
    // Achievements might not be public or game might not have them
    res.status(400).json({ message: 'Achievements not found or private' });
  }
});

// 5. Get Player Summary (to track "currently playing")
router.get('/player-summary/:steamId', async (req, res) => {
  try {
    const { steamId } = req.params;
    const response = await axios.get(`${API_BASE}/ISteamUser/GetPlayerSummaries/v0002/`, {
      params: {
        key: STEAM_KEY,
        steamids: steamId,
      },
    });

    const players = response.data.response.players;
    if (players && players.length > 0) {
      return res.json(players[0]);
    }
    res.status(404).json({ message: 'Player not found' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message });
  }
});

export default router;
