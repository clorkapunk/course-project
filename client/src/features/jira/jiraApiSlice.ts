import {apiSlice} from "@/app/api/apiSlice.ts";
import {TicketData} from "@/types";


export const salesforceApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        createTicket: builder.mutation({
            query(body) {
                return {
                    url: `/api/jira`,
                    method: 'POST',
                    body
                }
            },
        }),
        getUserTickets: builder.query<{ data: TicketData[], page: number; pages: number; total: number; limit: number;},
            {userId: number, page: number; limit: number; orderBy: string; sort: string;}>({
            query: ({userId, page, limit, orderBy, sort}) => {
                return `/api/jira/${userId}?page=${page}&limit=${limit}&orderBy=${orderBy}&sort=${sort}`;
            }
        }),
        deleteTicket: builder.mutation({
            query({id}) {
                return {
                    url: `/api/jira/${id}`,
                    method: 'DELETE'
                }
            },
        }),
        deleteTickets: builder.mutation({
            query(ids) {
                return {
                    url: `/api/jira`,
                    method: 'DELETE',
                    body: {
                        ids
                    }
                }
            },
        }),

    })
})

export const {
    useCreateTicketMutation,
    useLazyGetUserTicketsQuery,
    useDeleteTicketMutation,
    useDeleteTicketsMutation
} = salesforceApiSlice
