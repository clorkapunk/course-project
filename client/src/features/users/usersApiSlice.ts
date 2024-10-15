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
            {
                page: number;
                aSearchField: string;
                aSearch: string;
                uSearchField: string;
                uSearch: string;
                from: string;
                to: string;
            }
        >({
            query: ({page, aSearchField, aSearch, uSearchField, uSearch, from, to}) => {
                return `api/users/history?page=${page}&aSearchBy=${aSearchField}&aSearch=${aSearch}&uSearchBy=${uSearchField}&uSearch=${uSearch}&from=${from}&to=${to}`
            },

            serializeQueryArgs: ({endpointName}) => {
                return endpointName
            },
            merge: (currentCache, newItems, {arg}) => {
                if (arg.page === 1) {
                    currentCache.data = newItems.data;
                } else {

                    currentCache.data = Array.from(new Set([...currentCache.data, ...newItems.data]))
                }
                currentCache.page = newItems.page;
                currentCache.total = newItems.total;
                currentCache.pages = newItems.pages;
                currentCache.limit = newItems.limit;
                return currentCache
            },
            forceRefetch({currentArg, previousArg}) {
                let refetch = false
                if(currentArg?.page !== previousArg?.page) refetch = true
                if(currentArg?.uSearch !== previousArg?.uSearch) refetch = true
                if(currentArg?.aSearch !== previousArg?.aSearch) refetch = true
                if(currentArg?.aSearchField !== previousArg?.aSearchField) refetch = true
                if(currentArg?.uSearchField !== previousArg?.uSearchField) refetch = true
                if(currentArg?.from !== previousArg?.from) refetch = true
                if(currentArg?.to !== previousArg?.to) refetch = true

                return refetch
            }
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
