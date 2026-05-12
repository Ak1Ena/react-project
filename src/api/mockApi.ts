import axios from 'axios';

const GAME_BASE_URL = import.meta.env.REACT_APP_GAME_API_URL 
const USER_BASE_URL = import.meta.env.REACT_APP_USER_API_URL

export const usermockApi = axios.create({
  baseURL: USER_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const gameMockApi = axios.create({
  baseURL: GAME_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default {gameMockApi, usermockApi};
