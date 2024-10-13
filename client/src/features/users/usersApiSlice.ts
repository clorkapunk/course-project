import {apiSlice} from "@/app/api/apiSlice.ts";
import {AdminHistoryResponseData} from "@/types";


export const usersApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getUsers: builder.query({
            query: ({page, limit, orderBy, sort, searchBy, search}) => {
                return `/api/users?page=${page}&limit=${limit}&orderBy=${orderBy}&sort=${sort}&searchBy=${searchBy}&search=${search}`
            },
            keepUnusedDataFor: 5,
        }),
        getHistory: builder.query<
            AdminHistoryResponseData,
            { page: number; }
        >({
            query: ({page}) => {
                return `/history?page=${page}`
            },
            serializeQueryArgs: ({ endpointName }) => {
                return endpointName
            },
            merge: (currentCache, newItems) => {
                console.log('done merge')
                currentCache = {
                    ...newItems,
                    data: [...currentCache.data, ...newItems.data]
                }
                return currentCache
            },
            forceRefetch({ currentArg, previousArg }) {
                return currentArg?.page !== previousArg?.page
            },
        }),
        updateUsersStatus: builder.mutation({
            query: ({ids, status}) => ({
                url: `/api/users/update-status`,
                method: 'PUT',
                body: {ids, status}
            }),
        }),
        updateUsersRole: builder.mutation({
            query: ({ids, role}) => ({
                url: 'api/users/update-role',
                method: 'PUT',
                body: {ids, role}
            })
        })
    })
})

export const {
    useGetUsersQuery,
    useUpdateUsersRoleMutation,
    useUpdateUsersStatusMutation,
    useGetHistoryQuery
} = usersApiSlice
