import axios from 'axios';

const BACKEND_BASE = 'http://localhost:3001/api/steam';

export interface SteamGame {
  appid: number;
  name: string;
  playtime_forever: number;
  img_icon_url: string;
}

export interface SteamPlayerSummary {
  steamid: string;
  personaname: string;
  profileurl: string;
  avatarfull: string;
  personastate: number;
  gameextrainfo?: string;
  gameid?: string;
}

export interface SteamAchievement {
  apiname: string;
  achieved: number;
  unlocktime: number;
}

export const resolveVanityURL = async (vanityUrl: string) => {
  const response = await axios.get(`${BACKEND_BASE}/resolve-vanity/${vanityUrl}`);
  return response.data.steamid;
};

export const getOwnedGames = async (steamId: string) => {
  const response = await axios.get(`${BACKEND_BASE}/owned-games/${steamId}`);
  return response.data.games as SteamGame[];
};

export const getGameDetails = async (appId: number) => {
  const response = await axios.get(`${BACKEND_BASE}/game-details/${appId}`);
  return response.data;
};

export const getAchievements = async (steamId: string, appId: string) => {
  const response = await axios.get(`${BACKEND_BASE}/achievements/${steamId}/${appId}`);
  return response.data.achievements as SteamAchievement[];
};

export const getPlayerSummary = async (steamId: string) => {
  const response = await axios.get(`${BACKEND_BASE}/player-summary/${steamId}`);
  return response.data as SteamPlayerSummary;
};
