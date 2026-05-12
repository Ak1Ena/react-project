import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://67bc8202ed715aa51d0f507b.mockapi.io/api/v1';

const mockApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default mockApi;
