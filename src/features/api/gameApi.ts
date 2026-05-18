import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Game } from '../games/gamesAPI';
import type { ListEntry } from '../lists/listsAPI';

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
      providesTags: ['Game'],
    }),
    getGameById: builder.query<Game | undefined, string>({
      query: (id) => `/api/v1/games?id=${id}`,
      transformResponse: (rows: Game[], _meta, arg) =>
        // MockAPI does substring filtering on string columns, so narrow to
        // an exact id match before returning a single record.
        rows.find((r) => String(r.id) === arg),
      providesTags: (_result, _err, id) => [{ type: 'Game', id: id }],
    }),
    createGame: builder.mutation<Game, Omit<Game, 'id'>>({
      query: (game) => ({ url: '/api/v1/games', method: 'POST', body: game }),
      invalidatesTags: ['Game'],
    }),
    updateGame: builder.mutation<Game, { id: string; game: Partial<Game> }>({
      query: ({ id, game }) => ({ url: `/api/v1/games/${id}`, method: 'PUT', body: game }),
      invalidatesTags: ['Game'],
    }),
    deleteGame: builder.mutation<void, string>({
      query: (id) => ({ url: `/api/v1/games/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Game'],
    }),
    getListEntries: builder.query<ListEntry[], string>({
      // MockAPI returns HTTP 404 for filter URLs that match zero rows
      // instead of an empty array. Map that to [] so consumers can rely
      // on `data` being defined.
      queryFn: async (userId, _api, _extra, baseQuery) => {
        const result = await baseQuery(`/api/v1/lists?userId=${userId}`);
        if (result.error && result.error.status === 404) return { data: [] };
        if (result.error) return { error: result.error };
        return { data: result.data as ListEntry[] };
      },
      providesTags: ['ListEntry'],
    }),
    getGameReviews: builder.query<ListEntry[], string>({
      queryFn: async (gameId, _api, _extra, baseQuery) => {
        const result = await baseQuery(`/api/v1/lists?gameId=${gameId}`);
        if (result.error && result.error.status === 404) return { data: [] };
        if (result.error) return { error: result.error };
        return { data: result.data as ListEntry[] };
      },
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
