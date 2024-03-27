import { BaseQueryFn, FetchArgs, FetchBaseQueryError, createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ISignInResult } from '../types/auth';
import { fetchLogoutAction, setAuthSliceData } from './authSlice';

//https://redux-toolkit.js.org/rtk-query/usage/customizing-queries#automatic-re-authorization-by-extending-fetchbasequery
const baseQuery = fetchBaseQuery({ baseUrl: import.meta.env.VITE_BACKEND_URL, credentials: "include" })
const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions)
    if (result.error && result.error.status === 401) {
        // try to get a new token
        const refreshResult = await baseQuery({ url: '/auth/refresh-token', method: 'POST' }, api, extraOptions)
        if (refreshResult.data) {
            // store the new token
            // api.dispatch(tokenReceived(refreshResult.data))
            // retry the initial query
            result = await baseQuery(args, api, extraOptions)
        } else {
            api.dispatch(fetchLogoutAction());
        }
    }
    return result
}

export const chronosApi = createApi({
    reducerPath: 'chronosAPI',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['userInfo', 'calendarsList', 'calendarWithEvents'],
    endpoints: (builder) => ({
        getUserInfo: builder.query<ISignInResult, void>({
            query: () => '/auth/data-user',
            providesTags: ['userInfo'],
            async onCacheEntryAdded(
                arg, { dispatch, cacheDataLoaded, getCacheEntry }
            ) {
                try {
                    await cacheDataLoaded;
                    const { data, error } = getCacheEntry();
                    if (error) {
                        dispatch(setAuthSliceData({ user: null, status: 'rejected', error }));
                        return;
                    }
                    if (data) {
                        dispatch(setAuthSliceData({ user: data.data, status: 'fulfilled', error: null }));
                        return;
                    }
                } catch (error) {
                    console.error(error);

                }
            }
        }),
        //TODO - add types
        updateUserInfo: builder.mutation<object, object>({
            query: (arg) => ({
                url: '/auth/data-user',
                method: 'PATCH',
                body: arg
            }),
            invalidatesTags: ['userInfo'],

        }),

        // getCalendarsList: builder.query<ICalendar[], void>({
        //     query: () => '/calendars',
        //     providesTags: ['calendarsList'],
        //     //TODO - probably add transform
        //     async onCacheEntryAdded(
        //         arg, { dispatch, cacheDataLoaded, getCacheEntry }
        //     ) {
        //         try {
        //             await cacheDataLoaded;
        //             const { data, error } = getCacheEntry();
        //             if (error) {
        //                 dispatch(setCalendars([]));
        //                 return;
        //             }
        //             if (data) {
        //                 dispatch(setCalendars(data));
        //                 return;
        //             }
        //         } catch (error) {
        //             console.error(error);

        //         }
        //     }
        // }),
        // // redundant, as getting events is usually done with arbitrary number of calendars
        // getCalendarByURL: builder.query<ICalendar, { url: string, title: string, _id: string }>({
        //     query: ({ url }) => ({
        //         url: import.meta.env.VITE_CORS_PROXY_URL + encodeURIComponent(url),
        //         credentials: 'omit',
        //         responseHandler: 'text'
        //     }),
        //     transformResponse: (response: string, meta, arg) => {
        //         const cal: ICalendar = {
        //             _id: arg._id,
        //             title: arg.title,
        //             sourceUrl: arg.url,
        //             selected: true,
        //             events: parseICalStr(response)
        //         }
        //         return cal;
        //     },
        //     providesTags: (result, error, arg) => [{ type: 'calendarWithEvents', id: result?.sourceUrl }]
        // }),

        // deleteCalendar: builder.mutation<string, void>({
        //     query: (id) => ({
        //         url: `/calendars/${id}`,
        //         method: 'DELETE'
        //     }),
        //     invalidatesTags: ['calendarsList']
        // })

    }),
});

export default chronosApi;

export const { useGetUserInfoQuery, /*useGetCalendarsListQuery, useDeleteCalendarMutation, useGetCalendarByURLQuery */} = chronosApi;
