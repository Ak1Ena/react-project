import axios from 'axios';

const BACKEND_BASE = 'http://localhost:3001/api/steam';

export interface SteamPlayerSummary {
  steamid: string;
  communityvisibilitystate: number;
  profilestate: number;
  personaname: string;
  avatarfull: string;
  gameid: string;
}

export interface SteamGame {
  appid: number;
  name: string;
  playtime_forever: number;
  rtime_last_played: number;
}

export interface SteamAchievement {
  name: string;
  achieved: number;
  unlock_time: number;
}

export const resolveVanityURL = async (vanityUrl: string) => {
  const response = await axios.get<{ response: { success: number; steamid: string } }>(`${BACKEND_BASE}/resolve-vanity/${vanityUrl}`);
  if (response.data.steamid) return response.data.steamid;
  // The backend in steamRoutes.ts returns { steamid: ... } directly on success
  return response.data.steamid; 
};

export const getPlayerSummary = async (steamId: string) => {
  const response = await axios.get<SteamPlayerSummary>(`${BACKEND_BASE}/player-summary/${steamId}`);
  return response.data;
};

export const getOwnedGames = async (steamId: string) => {
  const response = await axios.get<{ response: SteamGame[] }>(`${BACKEND_BASE}/owned-games/${steamId}`);
  return response.data.response;
};

export const getAchievements = async (steamId: string, appId: string) => {
  const response = await axios.get<{ playerstats: SteamAchievement[] }>(`${BACKEND_BASE}/achievements/${steamId}/${appId}`);
  return response.data.playerstats;
};
