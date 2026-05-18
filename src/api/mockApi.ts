import axios from 'axios';

const GAME_BASE_URL = import.meta.env.VITE_GAME_API_URL;
const USER_BASE_URL = import.meta.env.VITE_USER_API_URL;
const STEAM_CATALOG_URL =
  import.meta.env.VITE_STEAM_CATALOG_URL || 'http://localhost:3001';

export const userMockApi = axios.create({
  baseURL: USER_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const gameMockApi = axios.create({
  baseURL: GAME_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const steamCatalogApi = axios.create({
  baseURL: STEAM_CATALOG_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const STEAM_CATALOG_BASE_URL = STEAM_CATALOG_URL;

export default gameMockApi;
