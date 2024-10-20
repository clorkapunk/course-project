import {apiSlice} from "@/app/api/apiSlice.ts";
import {TagData, TemplateData, TopicData} from "@/types";


export const templatesApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getLatestTemplates: builder.query<{
            data: TemplateData[]
            page: number;
            total: number;
            pages: number;
            limit: number;
        },{
            page: number;
            limit: number;
        }>({
            query: ({page, limit}) => {
                return `/api/templates?page=${page}&limit=${limit}&type=latest`
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
                if (currentArg?.page !== previousArg?.page) refetch = true
                return refetch
            }
        }),
        searchTemplates: builder.query<{
            data: TemplateData[]
            page: number;
            total: number;
            pages: number;
            limit: number;
        }, {search: string}>({
            query: ({search}) => {
                return `/api/templates?type=search&search=${search}`
            }
        }),
        getTemplateById: builder.query<TemplateData,{id: number}>({
            query: ({id}) => {
                return `/api/templates/${id}`
            }
        }),
        getTopics: builder.query<TopicData[],{}>({
            query: () => {
                return `/api/topics`
            }
        }),
        createTemplate: builder.mutation({
            query(body) {
                return {
                    url: `/api/templates`,
                    method: 'POST',
                    body,
                    formData: true,
                }
            },
        }),
        getTags: builder.query<{
            data: TagData[];
            page: number;
            limit: number;
            pages: number;
            total:  number;
        },{
            page: number;
            limit: number;
            search: string;
        }>({
            query: ({page, limit, search}) => {
                return `/api/tags?page=${page}&limit=${limit}&search=${search}`
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
                if (currentArg?.page !== previousArg?.page) refetch = true
                return refetch
            }
        }),

    })
})

export const {
    useGetLatestTemplatesQuery,
    useGetTopicsQuery,
    useCreateTemplateMutation,
    useGetTagsQuery,
    useGetTemplateByIdQuery,
    useLazySearchTemplatesQuery
} = templatesApiSlice
