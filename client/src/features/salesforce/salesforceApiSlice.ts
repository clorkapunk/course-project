import {apiSlice} from "@/app/api/apiSlice.ts";
import {SalesforceData} from "@/types";

export const salesforceApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        createSalesforce: builder.mutation({
            query(body) {
                return {
                    url: `/api/salesforce`,
                    method: 'POST',
                    body
                }
            },
        }),
        getSalesforceData: builder.query<SalesforceData, {userId: number}>({
            query: ({userId}) => {
                return `/api/salesforce/user/${userId}`
            }
        }),

        editSalesforce: builder.mutation({
            query(body) {
                return {
                    url: `/api/salesforce`,
                    method: 'PUT',
                    body
                }
            },
        }),

    })
})

export const {
    useGetSalesforceDataQuery,
    useCreateSalesforceMutation,
    useEditSalesforceMutation

} = salesforceApiSlice
