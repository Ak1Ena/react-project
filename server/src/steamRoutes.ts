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

// 3. Get Game Details (with review counts)
router.get('/game-details/:appId', async (req, res) => {
  try {
    const { appId } = req.params;
    const [detailsResponse, reviewsResponse] = await Promise.all([
      axios.get(`${STORE_BASE}/appdetails`, { params: { appids: appId } }),
      axios.get(`https://store.steampowered.com/appreviews/${appId}?json=1&language=all&purchase_type=all`)
    ]);

    const data = detailsResponse.data[appId];
    if (data.success) {
      const details = data.data;
      const reviewSummary = reviewsResponse.data.query_summary || {};
      
      return res.json({
        ...details,
        total_positive: reviewSummary.total_positive,
        total_negative: reviewSummary.total_negative
      });
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
router.get('/featured', async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 24;
  const offset = parseInt(req.query.offset as string) || 0;

  try {
    // 1. Fetch from Steam
    const steamResponse = await axios.get(`${STORE_BASE}/featuredcategories`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const categories = steamResponse.data;
    
    const allSteamItems = [
      ...(categories.top_sellers?.items || []),
      ...(categories.new_releases?.items || []),
      ...(categories.specials?.items || []),
      ...(categories.coming_soon?.items || [])
    ];

    const uniqueIds = new Set();
    const steamGames = allSteamItems
      .filter(item => {
        if (uniqueIds.has(item.id)) return false;
        uniqueIds.add(item.id);
        return true;
      })
      .map((item: any) => {
        const positive = (item.id % 5000) + 1000;
        const negative = (item.id % 1000) + 100;
        const rating = parseFloat(((positive / (positive + negative)) * 10).toFixed(1));
        
        return {
          id: item.id.toString(),
          appid: item.id,
          name: item.name,
          genre: ['Featured'],
          platforms: [
            item.windows_available ? 'Windows' : '',
            item.mac_available ? 'Mac' : '',
            item.linux_available ? 'Linux' : ''
          ].filter(Boolean),
          releaseYear: 0,
          rating,
          positive,
          negative,
          image: item.large_capsule_image || item.header_image,
          description: item.headline || 'Featured on Steam.',
          source: 'steam'
        };
      });

    // 2. Fetch from MockAPI to augment the catalog
    const MOCK_API_URL = process.env.VITE_GAME_API_URL || 'https://6a02c2270d92f63dd25402fc.mockapi.io';
    const mockResponse = await axios.get(`${MOCK_API_URL}/games`);
    const mockGames = mockResponse.data.map((g: any) => ({ ...g, source: 'mockapi' }));

    // 3. Combine both (prioritize Steam but ensure MockAPI games are added if not present)
    const combinedGames = [...steamGames];
    mockGames.forEach((mg: any) => {
      if (!uniqueIds.has(mg.appid)) {
        combinedGames.push(mg);
        uniqueIds.add(mg.appid);
      }
    });

    res.json({
      items: combinedGames.slice(offset, offset + limit),
      total: combinedGames.length,
      limit,
      offset
    });
  } catch (error) {
    console.error('Steam/MockAPI merge failed:', error instanceof Error ? error.message : 'Unknown error');
    try {
      const MOCK_API_URL = process.env.VITE_GAME_API_URL || 'https://6a02c2270d92f63dd25402fc.mockapi.io';
      const mockResponse = await axios.get(`${MOCK_API_URL}/games`);
      const games = mockResponse.data;
      res.json({
        items: games.slice(offset, offset + limit),
        total: games.length,
        limit,
        offset
      });
    } catch (fallbackError) {
      const message = fallbackError instanceof Error ? fallbackError.message : 'Unknown error';
      res.status(500).json({ message: `Failed to fetch game catalog: ${message}` });
    }
  }
});

// 7. Search Steam Store
router.get('/search', async (req, res) => {
  try {
    const { q, limit = '24' } = req.query;
    // Steam's storesearch API is limited but supports simple keyword matching.
    // We use cc=US and l=english for consistent metadata mapping.
    const response = await axios.get(`https://store.steampowered.com/api/storesearch`, {
      params: {
        term: q,
        l: 'english',
        cc: 'US',
        count: limit // Maximum 50 per Steam API docs
      }
    });

    const games = (response.data.items || []).map((item: any) => {
      // Stable mock reviews based on ID
      const positive = (item.id % 5000) + 1000;
      const negative = (item.id % 1000) + 100;
      const rating = parseFloat(((positive / (positive + negative)) * 10).toFixed(1));

      return {
        id: item.id.toString(),
        appid: item.id,
        name: item.name,
        genre: item.genres || [],
        platforms: [
          item.platforms?.windows ? 'Windows' : '',
          item.platforms?.mac ? 'Mac' : '',
          item.platforms?.linux ? 'Linux' : ''
        ].filter(Boolean),
        releaseYear: 0,
        rating,
        positive,
        negative,
        image: item.tiny_image ? item.tiny_image.replace('capsule_184x69', 'header') : '',
        description: `Steam search result for ${item.name}`,
        source: 'steam'
      };
    });

    res.json(games);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message });
  }
});

export default router;
