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
  } catch {
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

// 6. Get Large Catalog of Games (Combined Featured Categories)
router.get('/featured', async (_req, res) => {
  try {
    const response = await axios.get(`${STORE_BASE}/featuredcategories`);
    const categories = response.data;
    
    // Combine multiple categories for a larger catalog
    const allItems = [
      ...(categories.top_sellers?.items || []),
      ...(categories.new_releases?.items || []),
      ...(categories.specials?.items || []),
      ...(categories.coming_soon?.items || [])
    ];

    // Filter duplicates by app ID
    const uniqueIds = new Set();
    const uniqueItems = allItems.filter(item => {
      if (uniqueIds.has(item.id)) return false;
      uniqueIds.add(item.id);
      return true;
    });

    // Transform to our Game interface
    const games = uniqueItems.map((item: any) => ({
      id: item.id.toString(),
      appid: item.id,
      name: item.name,
      genre: ['Featured'], // Detailed genres require separate appdetails calls, we use placeholder
      platforms: [
        item.windows_available ? 'Windows' : '',
        item.mac_available ? 'Mac' : '',
        item.linux_available ? 'Linux' : ''
      ].filter(Boolean),
      releaseYear: 0,
      rating: 0,
      image: item.large_capsule_image || item.header_image,
      description: item.headline || 'Featured on Steam.'
    }));

    res.json(games);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message });
  }
});

// 7. Search Steam Store
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    // Steam doesn't have a clean JSON search API for the store, 
    // so we use the search suggestion API which is cleaner for small results
    const response = await axios.get(`https://store.steampowered.com/api/storesearch`, {
      params: {
        term: q,
        l: 'english',
        cc: 'US'
      }
    });

    const games = response.data.items.map((item: any) => ({
      id: item.id.toString(),
      appid: item.id,
      name: item.name,
      genre: item.genres || [],
      platforms: [item.platforms?.windows ? 'Windows' : 'Other'],
      releaseYear: 0,
      rating: 0,
      image: item.tiny_image.replace('capsule_184x69', 'header'),
      description: `Steam search result for ${item.name}`
    }));

    res.json(games);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message });
  }
});

export default router;
