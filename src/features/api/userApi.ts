import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { User } from '../auth/authAPI';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_USER_API_URL,
    headers: { 'Content-Type': 'application/json' },
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => '/users',
      providesTags: ['User'],
    }),
    registerUser: builder.mutation<User, Omit<User, 'id'>>({
      query: (user) => ({ url: '/users', method: 'POST', body: user }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const { useGetUsersQuery, useLazyGetUsersQuery, useRegisterUserMutation } = userApi;
