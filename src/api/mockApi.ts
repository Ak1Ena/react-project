import axios from 'axios';

const GAME_BASE_URL = import.meta.env.VITE_GAME_API_URL;
const USER_BASE_URL = import.meta.env.VITE_USER_API_URL;

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

export default gameMockApi;
