import {apiSlice} from "@/app/api/apiSlice.ts";
import {TagData, TemplateData, TopicData} from "@/types";

export const templatesApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getLatestTemplates: builder.query<{
            data: TemplateData[];
            page: number;
            total: number;
            pages: number;
            limit: number;
        },
            { page: number; limit: number; }>({
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
        getPopularTemplates: builder.query<{
            data: TemplateData[];
            page: number;
            total: number;
            pages: number;
            limit: number;
        },
            { page: number; limit: number; }>({
            query: ({page, limit}) => {
                return `/api/templates?page=${page}&limit=${limit}&type=popular`
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
            data: TemplateData[];
            page: number;
            total: number;
            pages: number;
            limit: number;
        },
            { search: string }>({
            query: ({search = []}) => {
                return `/api/templates?type=search&search=${search}`
            }
        }),
        getTemplatesByTags: builder.query<{
            data: TemplateData[];
            page: number;
            total: number;
            pages: number;
            limit: number;
        },
            { page: number; limit: number; tags: number[] }>({
            query: ({tags = []}) => {
                return `/api/templates?type=tags&tags=${tags.join(',')}`
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
        getUserTemplates: builder.query<{
            data: TemplateData[];
            page: number;
            total: number;
            pages: number;
            limit: number;
        },
            {
                userId: number;
                page: number;
                limit: number;
                orderBy: string;
                sort: string;
                searchBy: string;
                search: string;
            }>({
            query: ({userId, page, limit, search, sort, searchBy, orderBy}) => {
                return `/api/templates/user/${userId}?page=${page}&limit=${limit}&orderBy=${orderBy}&sort=${sort}&searchBy=${searchBy}&search=${search}`
            },
            serializeQueryArgs: ({endpointName}) => {
                return endpointName
            },
            forceRefetch({currentArg, previousArg}) {
                if (currentArg?.page !== previousArg?.page) return true
                else if (currentArg?.limit !== previousArg?.limit) return true
                else if (currentArg?.orderBy !== previousArg?.orderBy) return true
                else if (currentArg?.sort !== previousArg?.sort) return true
                else if (currentArg?.searchBy !== previousArg?.searchBy) return true
                else if (currentArg?.userId !== previousArg?.userId) return true
                return false
            }
        }),
        getTemplateById: builder.query<TemplateData, { id: number }>({
            query: ({id}) => {
                return `/api/templates/${id}`
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
        deleteTemplates: builder.mutation({
            query({templatesIds}) {
                return {
                    url: `/api/templates`,
                    method: 'DELETE',
                    body: {
                        templatesIds
                    }
                }
            },
        }),
        updateTemplate: builder.mutation({
            query({body, templateId}) {
                return {
                    url: `/api/templates/${templateId}`,
                    method: 'PATCH',
                    body
                }
            },
        }),
        getTopics: builder.query<TopicData[], {}>({
            query: () => {
                return `/api/topics`
            }
        }),
        getTags: builder.query<{ data: TagData[]; page: number; limit: number; pages: number; total: number; },
            { page: number; limit: number; search: string; exclude?: number[] }>({
            query: ({page, limit, search, exclude = []}) => {
                return `/api/tags?page=${page}&limit=${limit}&search=${search}&exclude=${exclude.join(',')}`
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
        getPopularTags: builder.query<{ data: TagData[]; page: number; limit: number; pages: number; total: number; },
            { type: string; limit: number; }>({
            query: ({limit, type}) => {
                return `/api/tags?limit=${limit}&type=${type}`
            }
        }),
        getTemplates: builder.query<{
            data: TemplateData[];
            page: number;
            limit: number;
            pages: number;
            total: number;
        },
            { page: number; limit: number; orderBy: string; sort: string; searchBy: string; search: string; }>({
            query: ({page, limit, search, sort, searchBy, orderBy}) => {
                return `/api/admin/templates?page=${page}&limit=${limit}&orderBy=${orderBy}&sort=${sort}&searchBy=${searchBy}&search=${search}`
            }
        }),
        likeTemplate: builder.mutation({
            query({templateId}) {
                return {
                    url: `/api/like/template/${templateId}`,
                    method: 'POST',

                }
            },
        }),
        dislikeTemplate: builder.mutation({
            query({templateId}) {
                return {
                    url: `/api/like/template/${templateId}`,
                    method: 'DELETE',

                }
            },
        }),

    })
})

export const {
    useGetLatestTemplatesQuery,
    useLazyGetLatestTemplatesQuery,
    useLazyGetTemplatesByTagsQuery,
    useGetTopicsQuery,
    useCreateTemplateMutation,
    useGetTagsQuery,
    useGetTemplateByIdQuery,
    useLazySearchTemplatesQuery,
    useLazyGetUserTemplatesQuery,
    useDeleteTemplatesMutation,
    useUpdateTemplateMutation,
    useLazyGetPopularTemplatesQuery,
    useGetPopularTagsQuery,
    useLazyGetTemplatesQuery
} = templatesApiSlice
