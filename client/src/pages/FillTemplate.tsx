import {Navigate, useNavigate, useParams} from "react-router-dom";
import {useGetTemplateByIdQuery} from "@/features/templates/templatesApiSlice.ts";
import {EDIT_FORM_ROUTE, HOME_ROUTE} from "@/utils/routes.ts";
import FillQuestionCard from "@/components/FillQuestionCard.tsx";
import {useCallback, useEffect, useState} from "react";
import {AnsweredQuestionData, ApiErrorResponse,TableFormData} from "@/types";
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
import Loading from "@/components/Loading.tsx";
import catchApiErrors from "@/utils/catch-api-errors.ts";

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
    const [fetchFormData, {data: formData, isLoading: isFormDataLoading}] = useLazyGetUserFormByTemplateQuery()

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
                }).unwrap().then((data: TableFormData) => {
                    navigate(EDIT_FORM_ROUTE + `/${data.id}`)
                }),
                {
                    loading: `${t('saving')}...`,
                    success: <>{t('action-successfully-completed')}</>,
                    error: <>{t("error-occurred")}</>,
                }
            )
        } catch (err) {
            catchApiErrors(err, t)
        }
    }

    useEffect(() => {
        if (!data && !isLoading) {
            const responseError = error as ApiErrorResponse
            if (responseError?.data.code === ResponseErrorCodes.AccessDenied) {
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

        if (formData?.id) navigate(EDIT_FORM_ROUTE + `/${formData.id}`)
    }, [formData]);


    return (
        <>

            <section className={'flex flex-col items-center'}>
                <div
                    className={'flex z-10  items-center bg-accent px-[60px] h-[72px] justify-between w-full sticky top-0 border-b'}>
                    {
                        (!isLoading && !isFormDataLoading) &&
                        <>
                            <div className={'flex flex-col sm:items-center gap-1 w-full'}>

                                    <p className={"text-sm md:text-base leading-none text-center"}>
                                        {
                                            data?.questions &&
                                            `${answeredAmount} / ${data?.questions.length || 0}`
                                        }
                                    </p>

                                <h1 className={"text-lg md:text-xl leading-none text-center truncate w-full"}>{data?.title}</h1>
                            </div>
                            {
                                authState?.token &&
                                <Button
                                    variant={'default'}
                                    className={'hidden md:block md:fixed top-50 mr-4 right-0 hover:bg-green-600'}
                                    disabled={answeredAmount !== answersData.length}
                                    onClick={handleSubmit}
                                >
                                    {t('finish')}
                                </Button>
                            }
                        </>
                    }
                </div>

                {
                    (isLoading || isFormDataLoading)
                        ? <Loading/>
                        : <>
                            <ul className={'w-full max-w-[800px] flex flex-col gap-2 md:gap-4 p-2 md:p-4 2xl:p-8'}>
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
                            {
                                authState?.token &&
                                <div className={'p-2 md:p-4 2xl:p-8 w-full'}>
                                    <Button
                                        variant={'default'}
                                        className={'md:hidden block w-full hover:bg-green-600'}
                                        disabled={answeredAmount !== answersData.length}
                                        onClick={handleSubmit}
                                    >
                                        {t('finish')}
                                    </Button>
                                </div>
                            }
                        </>
                }


            </section>

        </>

    );
};

export default FillTemplate;
