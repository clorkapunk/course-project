import {apiSlice} from "@/app/api/apiSlice.ts";
import {AnsweredQuestionData, TableFormData, FormData} from '@/types/index.ts'

export const formsApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getUserFilledForm: builder.query<FormData, {formId: number}>({
            query: ({formId}) => {
                return `/api/forms/${formId}`
            }
        }),
        submitForm: builder.mutation({
            query(body) {
                return {
                    url: `/api/forms`,
                    method: 'POST',
                    body
                }
            },
        }),
        getFormAnswers: builder.query<AnsweredQuestionData[],{templateId: number, userId: number;}>({
            query: ({templateId, userId}) => {
                return `/api/form-answers?tid=${templateId}&uid=${userId}`
            }
        }),
        getUserForms: builder.query<{data: TableFormData[], page: number; pages: number; total: number; limit: number;},
            {userId: number; page: number; limit: number; orderBy: string; sort: string; searchBy: string; search: string; }>({
            query: ({userId, page, limit, search,sort,searchBy,orderBy}) => {
                return `/api/forms/user/${userId}?page=${page}&limit=${limit}&orderBy=${orderBy}&sort=${sort}&searchBy=${searchBy}&search=${search}`
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
        deleteForms: builder.mutation({
            query({ids}) {
                return {
                    url: `/api/forms`,
                    method: 'DELETE',
                    body: {
                        ids
                    }
                }
            },
        }),
        updateForm: builder.mutation({
            query({formId, answers}) {
                return {
                    url: `/api/forms/${formId}`,
                    method: 'PATCH',
                    body: {
                        answers
                    }
                }
            },
        }),
        getUserFormByTemplate: builder.query<{id: number},
            {userId: number; templateId: number}>({
            query: ({userId, templateId}) => {
                return `/api/forms?uid=${userId}&tid=${templateId}`
            }
        }),
        getUserTemplatesForms: builder.query<{data: TableFormData[], page: number; pages: number; total: number; limit: number;},
            {userId: number; page: number; limit: number; orderBy: string; sort: string; searchBy: string; search: string; }>({
            query: ({userId, page, limit, search,sort,searchBy,orderBy}) => {
                return `/api/forms/user-templates/${userId}?page=${page}&limit=${limit}&orderBy=${orderBy}&sort=${sort}&searchBy=${searchBy}&search=${search}`
            }
        }),
        getTemplateForms: builder.query<{data: TableFormData[], page: number; pages: number; total: number; limit: number;},
            {templateId: number; page: number; limit: number; orderBy: string; sort: string; searchBy: string; search: string; }>({
            query: ({templateId, page, limit, search,sort,searchBy,orderBy}) => {
                return `/api/forms/template/${templateId}?page=${page}&limit=${limit}&orderBy=${orderBy}&sort=${sort}&searchBy=${searchBy}&search=${search}`
            }
        }),
        getForms: builder.query<{data: TableFormData[], page: number; pages: number; total: number; limit: number;},
            { page: number; limit: number; orderBy: string; sort: string; searchBy: string; search: string; }>({
            query: ({page, limit, search,sort,searchBy,orderBy}) => {
                return `/api/admin/forms?page=${page}&limit=${limit}&orderBy=${orderBy}&sort=${sort}&searchBy=${searchBy}&search=${search}`
            }
        }),
    })
})

export const {
    useSubmitFormMutation,
    useGetUserFilledFormQuery,
    useLazyGetUserFormsQuery,
    useDeleteFormsMutation,
    useUpdateFormMutation,
    useLazyGetUserFormByTemplateQuery,
    useLazyGetUserTemplatesFormsQuery,
    useLazyGetTemplateFormsQuery,
    useLazyGetFormsQuery
} = formsApiSlice
