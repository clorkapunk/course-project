import {Navigate, useNavigate, useParams} from "react-router-dom";
import {useGetTemplateByIdQuery} from "@/features/templates/templatesApiSlice.ts";
import {EDIT_FORM_ROUTE, HOME_ROUTE} from "@/utils/routes.ts";
import FillQuestionCard from "@/components/FillQuestionCard.tsx";
import {useCallback, useEffect, useState} from "react";
import {AnsweredQuestionData, ApiErrorResponse} from "@/types";
import {v4 as uuidv4} from 'uuid'
import {Button} from "@/components/ui/button.tsx";
import {
    useLazyGetUserFormByTemplateQuery,
    useSubmitFormMutation
} from "@/features/forms/formsApiSlice.ts";
import {useSelector} from "react-redux";
import {selectAuthState} from "@/features/auth/authSlice.ts";
import ViewQuestionCard from "@/components/ViewQuestionCard.tsx";
import toast from "react-hot-toast";
import {useTranslation} from "react-i18next";
import ResponseErrorCodes from "@/utils/response-error-codes.ts";

export interface AnsweredQuestionDataWithId extends AnsweredQuestionData {
    id: string;
}

const FillTemplate = () => {
    const {id} = useParams()
    const {t} = useTranslation()
    const navigate = useNavigate()

    if (!id || isNaN(parseInt(id))) {
        return <Navigate to={HOME_ROUTE} replace/>
    }

    const {data, isLoading, error} = useGetTemplateByIdQuery({id: parseInt(id)})


    const authState = useSelector(selectAuthState)
    const [fetchFormData, {data: formData}] = useLazyGetUserFormByTemplateQuery()

    const [submitForm] = useSubmitFormMutation()
    const [answersData, setAnswersData] = useState<AnsweredQuestionDataWithId[]>([])
    const [answeredAmount, setAnsweredAmount] = useState(0)

    const handleChangeAnswer = useCallback((id: string, answer: string | number | boolean) => {
        setAnswersData(prevState => {
            const index = prevState.findIndex(item => item.id === id)
            if (index === -1) return prevState
            prevState[index].answer = answer
            setAnsweredAmount(prevState.filter(a => a.answer !== '').length)
            return prevState
        })
    }, [])

    const handleSubmit = async () => {
        try {
            await toast.promise(
                submitForm({
                    templateId: parseInt(id),
                    answers: answersData.map(data => {
                        let answer = data.answer
                        if (data.answer !== null && data.type === 'int') answer = parseInt(data.answer.toString())
                        return {
                            type: data.type,
                            answer
                        }
                    })
                }).unwrap(),
                {
                    loading: 'Saving...',
                    success: <>Form accepted!</>,
                    error: <>Error when accepting form</>,
                }
            )
        } catch (err) {
            const error = err as ApiErrorResponse
            if (!error?.data) {
                toast.error(t("no-server-response"))
            } else if (error?.status === 400) {
                toast.error(t('invalid-entry'))
            } else if (error?.status === 401) {
                toast.error("Unauthorized")
            } else {
                toast.error("Unexpected end")
            }
        }
    }

    useEffect(() => {
        if(!data && !isLoading) {
            const responseError = error as ApiErrorResponse
            if(responseError?.data.code === ResponseErrorCodes.AccessDenied){
                toast.error(t('private-template-toast'))
            }
            navigate(HOME_ROUTE)
        }
    }, [data, isLoading]);

    useEffect(() => {
        if (!data?.questions) return
        setAnswersData(data?.questions.map(q => {
            let answer: string | number | boolean = '';
            if (q.type === 'bool') answer = false;
            return {
                id: uuidv4(),
                ...q,
                answer
            }
        }))
    }, [data?.questions]);

    useEffect(() => {
        if (authState?.id && data?.id) {
            try {
                fetchFormData({
                    templateId: data?.id,
                    userId: authState?.id
                })
            } catch (err) {
                console.log(err)
            }
        }
    }, [authState?.id, data?.id]);

    useEffect(() => {
        if(formData?.id) navigate(EDIT_FORM_ROUTE + `/${formData.id}`)
    }, [formData]);

    return (
        <section className={'min-h-screen flex flex-col items-center gap-4 pb-4'}>
            <div
                className={'flex flex-col items-center gap-2 bg-zinc-800 h-[72px] justify-center w-full sticky top-0 border-b border-zinc-600'}>
                {
                    authState?.token &&
                    <p className={'text-zinc-300'}>{answeredAmount} / {data?.questions.length}</p>
                }
                <h1 className={"text-xl text-zinc-100"}>{data?.title}</h1>

                <Button
                    className={'fixed right-0 top-50 mr-4 bg-zinc-600 hover:bg-green-600'}
                    disabled={answeredAmount !== answersData.length}
                    onClick={handleSubmit}
                >
                    Finish
                </Button>
            </div>

            <ul className={'w-full max-w-[800px] flex flex-col gap-4'}>
                {
                    answersData.map((question) => {
                        return authState?.token ?
                            <FillQuestionCard
                                handleChange={handleChangeAnswer}
                                item={question}
                                key={question.id}
                            />
                            :
                            <ViewQuestionCard
                                item={question}
                                key={question.id}
                            />
                    })
                }
            </ul>
        </section>
    );
};

export default FillTemplate;
