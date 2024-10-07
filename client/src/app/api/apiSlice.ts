import {BaseQueryApi, createApi, FetchArgs, fetchBaseQuery} from '@reduxjs/toolkit/query/react'
import { setCredentials, logOut } from '@/features/auth/authSlice.ts'
import {RootState} from "@/app/store.ts";
import {AuthResponse} from "@/types";

const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).auth.token
        if (token) {
            headers.set("authorization", `Bearer ${token}`)
        }
        return headers
    }
})

const baseQueryWithReauth = async (args: (string | FetchArgs), api: BaseQueryApi, extraOptions: {}) => {
    let result = await baseQuery(args, api, extraOptions)

    if (result?.error?.status === 403) {
        console.log('sending refresh token')
        // send refresh token to get new access token
        const refreshResult = await baseQuery('/refresh', api, extraOptions)

        if (refreshResult?.data) {
            api.dispatch(setCredentials({ accessToken: (refreshResult.data as AuthResponse).accessToken}))
            result = await baseQuery(args, api, extraOptions)
        } else {
            api.dispatch(logOut())
        }
    }

    return result
}

export const apiSlice = createApi({
    baseQuery: baseQueryWithReauth,
    // @ts-expect-error
    endpoints: builder => ({})
})
