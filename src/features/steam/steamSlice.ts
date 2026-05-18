import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as steamAPI from './steamAPI';
import type { SteamPlayerSummary, SteamGame, SteamAchievement } from './steamAPI';
import type { RootState } from '../../app/store';
import { addToList, updateListEntry } from '../lists/listsSlice';

interface SteamState {
  steamId: string | null;
  summary: SteamPlayerSummary | null;
  ownedGames: SteamGame[];
  achievements: Record<string, { total: number; achieved: number; list: SteamAchievement[] }>;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: SteamState = {
  steamId: localStorage.getItem('steamId'),
  summary: null,
  ownedGames: [],
  achievements: {},
  status: 'idle',
  error: null,
};

export const linkSteamAccount = createAsyncThunk(
  'steam/linkSteamAccount',
  async (steamInput: string, { rejectWithValue }) => {
    try {
      let steamId = steamInput;
      if (!/^\d+$/.test(steamInput)) {
        steamId = await steamAPI.resolveVanityURL(steamInput);
      }
      localStorage.setItem('steamId', steamId);
      return steamId;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to resolve Steam account';
      return rejectWithValue(message);
    }
  }
);

export const fetchSteamProfile = createAsyncThunk(
  'steam/fetchSteamProfile',
  async (steamId: string) => {
    return await steamAPI.getPlayerSummary(steamId);
  }
);

export const fetchOwnedGames = createAsyncThunk(
  'steam/fetchOwnedGames',
  async (steamId: string) => {
    return await steamAPI.getOwnedGames(steamId);
  }
);

export const fetchGameAchievements = createAsyncThunk(
  'steam/fetchGameAchievements',
  async ({ steamId, appId }: { steamId: string; appId: string }) => {
    try {
      const list = await steamAPI.getAchievements(steamId, appId);
      const achieved = list.filter(a => a.achieved === 1).length;
      return { appId, list, achieved, total: list.length };
    } catch (error) {
      // Return empty achievements instead of failing if private or missing
      return { appId, list: [], achieved: 0, total: 0 };
    }
  }
);

export const syncSteamLibrary = createAsyncThunk(
  'steam/syncSteamLibrary',
  async (_, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState;
    const { steamId } = state.steam;
    const user = state.auth.user;

    if (!steamId || !user) return rejectWithValue('User or Steam ID missing');

    try {
      const ownedGames = await steamAPI.getOwnedGames(steamId);
      if (!ownedGames || ownedGames.length === 0) return [];
      
      const existingEntries = state.lists.entries;
      
      // Separate games into 'to add' and 'to update'
      const gamesToAdd: SteamGame[] = [];
      const entriesToUpdate: { id: string, data: any }[] = [];

      for (const steamGame of ownedGames) {
        const appIdStr = steamGame.appid.toString();
        // HL2 and other games might have IDs as numbers or strings, normalize to string
        const existing = existingEntries.find(e => e.gameId.toString() === appIdStr);

        const statsData = {
          playtime: steamGame.playtime_forever,
          lastPlayed: (steamGame as any).rtime_last_played || (steamGame as any).last_played,
        };

        if (existing) {
          // Force update stats even if it already exists
          entriesToUpdate.push({
            id: existing.id,
            data: statsData
          });
        } else {
          gamesToAdd.push(steamGame);
        }
      }

      // Process in batches (limit to 60 total operations)
      const addBatch = gamesToAdd.slice(0, 30);
      const updateBatch = entriesToUpdate.slice(0, 30);
      
      const operations = [
        ...addBatch.map(steamGame => dispatch(addToList({
          gameId: steamGame.appid.toString(),
          userId: user.id,
          status: 'backlog',
          notes: `Imported from Steam.`,
          review: '',
          personalRating: 0,
          playtime: steamGame.playtime_forever,
          lastPlayed: (steamGame as any).rtime_last_played || (steamGame as any).last_played,
        }))),
        ...updateBatch.map(op => dispatch(updateListEntry({
          id: op.id,
          entry: op.data
        })))
      ];

      await Promise.all(operations);
      return ownedGames;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sync library';
      return rejectWithValue(message);
    }
  }
);

// This thunk will check what the user is playing and sync it to their list
export const trackSteamActivity = createAsyncThunk(
  'steam/trackSteamActivity',
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;
    const { steamId } = state.steam;
    const user = state.auth.user;
    
    if (!steamId || !user) return;

    try {
      const summary = await steamAPI.getPlayerSummary(steamId);
      const currentGameId = summary.gameid;

      if (currentGameId) {
        const existingEntries = state.lists.entries;
        const existingEntry = existingEntries.find(e => e.gameId === currentGameId);

        if (existingEntry) {
          // If already in list but not marked as 'playing', update it
          const updateData: any = {};
          if (existingEntry.status !== 'playing') updateData.status = 'playing';
          
          // Always update playtime if it's a Steam game
          if (summary.gameid === existingEntry.gameId) {
             updateData.lastPlayed = Math.floor(Date.now() / 1000);
          }
          
          if (Object.keys(updateData).length > 0) {
            await dispatch(updateListEntry({ id: existingEntry.id, entry: updateData }));
          }
        } else {
          // If not in list, add it automatically
          await dispatch(addToList({
            gameId: currentGameId,
            userId: user.id,
            status: 'playing',
            notes: `Auto-synced: Started playing on Steam.`,
            review: '',
            personalRating: 0,
            playtime: 0, // Will be updated on next sync
            lastPlayed: Math.floor(Date.now() / 1000),
          }));
        }
      }
      return summary;
    } catch (error) {
      console.error('Failed to track Steam activity', error);
    }
  }
);

const steamSlice = createSlice({
  name: 'steam',
  initialState,
  reducers: {
    logoutSteam: (state) => {
      state.steamId = null;
      state.summary = null;
      state.ownedGames = [];
      state.achievements = {};
      localStorage.removeItem('steamId');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(linkSteamAccount.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(linkSteamAccount.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.steamId = action.payload;
      })
      .addCase(linkSteamAccount.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(fetchSteamProfile.fulfilled, (state, action) => {
        state.summary = action.payload;
      })
      .addCase(fetchOwnedGames.fulfilled, (state, action) => {
        state.ownedGames = action.payload;
      })
      .addCase(fetchGameAchievements.fulfilled, (state, action) => {
        const { appId, ...data } = action.payload;
        state.achievements[appId] = data;
      })
      .addCase(syncSteamLibrary.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(syncSteamLibrary.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.ownedGames = action.payload;
      })
      .addCase(syncSteamLibrary.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(trackSteamActivity.fulfilled, (state, action) => {
        if (action.payload) state.summary = action.payload;
      });
  },
});

export const { logoutSteam } = steamSlice.actions;
export default steamSlice.reducer;
