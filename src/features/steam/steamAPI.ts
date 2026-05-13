import axios from 'axios';

const STEAM_KEY = import.meta.env.VITE_STEAM_API_KEY;

// Use relative paths that match our Vite proxy configuration
const API_BASE = '/steam-api';
const STORE_BASE = '/steam-store';

export interface SteamGame {
  appid: number;
  name: string;
  playtime_forever: number;
  img_icon_url: string;
  has_community_visible_stats?: boolean;
}

export interface SteamAppDetails {
  type: string;
  name: string;
  steam_appid: number;
  required_age: number;
  is_free: boolean;
  detailed_description: string;
  about_the_game: string;
  short_description: string;
  header_image: string;
  developers: string[];
  publishers: string[];
  platforms: {
    windows: boolean;
    mac: boolean;
    linux: boolean;
  };
  genres: Array<{ id: string; description: string }>;
  release_date: {
    coming_soon: boolean;
    date: string;
  };
}

export const resolveVanityURL = async (vanityUrl: string) => {
  if (!STEAM_KEY) throw new Error('Steam API Key missing');
  
  const response = await axios.get(`${API_BASE}/ISteamUser/ResolveVanityURL/v0001/`, {
    params: {
      key: STEAM_KEY,
      vanityurl: vanityUrl,
    },
  });

  if (response.data.response.success === 1) {
    return response.data.response.steamid;
  }
  throw new Error('Vanity URL not found');
};

export const getOwnedGames = async (steamId: string) => {
  if (!STEAM_KEY) throw new Error('Steam API Key missing');

  const response = await axios.get(`${API_BASE}/IPlayerService/GetOwnedGames/v0001/`, {
    params: {
      key: STEAM_KEY,
      steamid: steamId,
      format: 'json',
      include_appinfo: 1,
      include_played_free_games: 1,
    },
  });

  return response.data.response.games as SteamGame[];
};

export const getGameDetails = async (appId: number) => {
  const response = await axios.get(`${STORE_BASE}/api/appdetails`, {
    params: {
      appids: appId,
    },
  });

  const data = response.data[appId.toString()];
  if (data.success) {
    return data.data as SteamAppDetails;
  }
  throw new Error('Failed to fetch game details from Steam Store');
};
