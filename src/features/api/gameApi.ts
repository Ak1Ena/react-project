import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Game } from '../games/gamesAPI';
import type { ListEntry } from '../lists/listsAPI';

const ensureId = (g: Game): Game => ({
  ...g,
  id: g.id || g.appid?.toString(),
});

export const gameApi = createApi({
  reducerPath: 'gameApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_GAME_API_URL,
    headers: { 'Content-Type': 'application/json' },
  }),
  tagTypes: ['Game', 'ListEntry'],
  endpoints: (builder) => ({
    getGames: builder.query<Game[], void>({
      query: () => '/api/v1/games',
      transformResponse: (response: Game[]) => response.map(ensureId),
      providesTags: ['Game'],
    }),
    getGameById: builder.query<Game, string>({
      query: (id) => `/api/v1/games/${id}`,
      transformResponse: (response: Game) => ensureId(response),
      providesTags: (_result, _err, id) => [{ type: 'Game', id }],
    }),
    createGame: builder.mutation<Game, Omit<Game, 'id'>>({
      query: (game) => ({ url: '/api/v1/games', method: 'POST', body: game }),
      transformResponse: (response: Game) => ensureId(response),
      invalidatesTags: ['Game'],
    }),
    updateGame: builder.mutation<Game, { id: string; game: Partial<Game> }>({
      query: ({ id, game }) => ({ url: `/api/v1/games/${id}`, method: 'PUT', body: game }),
      transformResponse: (response: Game) => ensureId(response),
      invalidatesTags: ['Game'],
    }),
    deleteGame: builder.mutation<void, string>({
      query: (id) => ({ url: `/api/v1/games/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Game'],
    }),
    getListEntries: builder.query<ListEntry[], string>({
      query: (userId) => `/api/v1/lists/?userId=${userId}`,
      providesTags: ['ListEntry'],
    }),
    getGameReviews: builder.query<ListEntry[], string>({
      query: (gameId) => `/api/v1/lists/?gameId=${gameId}`,
      providesTags: ['ListEntry'],
    }),
    addToList: builder.mutation<ListEntry, Omit<ListEntry, 'id' | 'dateAdded'>>({
      query: (entry) => ({
        url: '/api/v1/lists',
        method: 'POST',
        body: { ...entry, dateAdded: new Date().toISOString() },
      }),
      invalidatesTags: ['ListEntry'],
    }),
    updateListEntry: builder.mutation<ListEntry, { id: string; entry: Partial<ListEntry> }>({
      query: ({ id, entry }) => ({ url: `/api/v1/lists/${id}`, method: 'PUT', body: entry }),
      invalidatesTags: ['ListEntry'],
    }),
    removeFromList: builder.mutation<void, string>({
      query: (id) => ({ url: `/api/v1/lists/${id}`, method: 'DELETE' }),
      invalidatesTags: ['ListEntry'],
    }),
  }),
});

export const {
  useGetGamesQuery,
  useGetGameByIdQuery,
  useCreateGameMutation,
  useUpdateGameMutation,
  useDeleteGameMutation,
  useGetListEntriesQuery,
  useGetGameReviewsQuery,
  useAddToListMutation,
  useUpdateListEntryMutation,
  useRemoveFromListMutation,
} = gameApi;
