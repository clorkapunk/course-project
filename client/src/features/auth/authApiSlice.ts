import {apiSlice} from "@/app/api/apiSlice.ts";
import {logOut} from '@/features/auth/authSlice.ts'

export const authApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        login: builder.mutation({
            query: credentials => ({
                url: '/login',
                method: 'POST',
                body: { ...credentials }
            })
        }),
        register: builder.mutation({
            query: credentials => ({
                url: '/sign-up',
                method: 'POST',
                body: { ...credentials }
            })
        }),
        refresh: builder.mutation({
            query: () => ({
                url: '/refresh',
                method: 'GET'
            })
        }),
        logout: builder.mutation({
            query: () => ({
                url: '/logout',
                method: 'GET'
            }),
            async onQueryStarted() {
                logOut()
            },
        }),
        googleLogin: builder.mutation({
            query: () => ({
                url: '/oauth',
                method: 'POST'
            }),
        }),
        googleGetData: builder.mutation({
            query: ({code}) => ({
                url: `/oauth?code=${code}`,
                method: 'GET'
            }),
        }),
    })
})

export const {
    useLoginMutation,
    useRegisterMutation,
    useRefreshMutation,
    useLogoutMutation,
    useGoogleLoginMutation,
    useGoogleGetDataMutation
} = authApiSlice
