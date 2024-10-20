import {apiSlice} from "@/app/api/apiSlice.ts";
import {AnsweredQuestionData} from '@/types/index.ts'

export const formsApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        submitForm: builder.mutation({
            query(body) {
                return {
                    url: `/api/forms`,
                    method: 'POST',
                    body
                }
            },
        }),
        getUserFilledForm: builder.query<AnsweredQuestionData[],{templateId: number, userId: number;}>({
            query: ({templateId, userId}) => {
                return `/api/form-answers?tid=${templateId}&uid=${userId}`
            }
        }),


    })
})

export const {
    useSubmitFormMutation,
    useLazyGetUserFilledFormQuery
} = formsApiSlice
