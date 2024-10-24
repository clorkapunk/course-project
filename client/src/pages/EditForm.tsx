import {Button} from "@/components/ui/button.tsx";
import FillQuestionCard from "@/components/FillQuestionCard.tsx";
import {Navigate, useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {HOME_ROUTE} from "@/utils/routes.ts";
import {useSelector} from "react-redux";
import {selectAuthState} from "@/features/auth/authSlice.ts";
import {
    useGetUserFilledFormQuery, useUpdateFormMutation,
} from "@/features/forms/formsApiSlice.ts";
import {useCallback, useEffect, useState} from "react";
import toast from "react-hot-toast";
import {ApiErrorResponse} from "@/types";
import {v4 as uuidv4} from "uuid";
import {AnsweredQuestionDataWithId} from "@/pages/FillTemplate.tsx";


const EditForm = () => {

    const {id} = useParams()
    const {t} = useTranslation()

    if (!id || isNaN(parseInt(id))) {
        return <Navigate to={HOME_ROUTE} replace/>
    }

    const {data, isLoading} = useGetUserFilledFormQuery({formId: parseInt(id)})

    if (!data && !isLoading) {
        return <Navigate to={HOME_ROUTE} replace/>
    }

    const authState = useSelector(selectAuthState)

    const [updateForm] = useUpdateFormMutation()
    const [isEditMode, setIsEditMode] = useState(false)
    const [answersData, setAnswersData] = useState<AnsweredQuestionDataWithId[]>(
        data?.questions ? data?.questions.map(q => ({id: uuidv4(), ...q})) : []
    )
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

    const handleUpdate = async () => {
        try {
            await toast.promise(
                updateForm({
                    formId: parseInt(id),
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
        if(data?.questions){
            setAnswersData(data?.questions.map(q => ({id: uuidv4(), ...q})))
        }
    }, [data?.questions]);



    return (
        <section className={'min-h-screen flex flex-col items-center gap-4 pb-4'}>
            <div
                className={'flex flex-col items-center gap-2 bg-zinc-800 h-[72px] justify-center w-full sticky top-0 border-b border-zinc-600'}>
                {
                    authState?.token &&
                    <p className={'text-zinc-300'}>{answeredAmount} / {data?.questions.length}</p>
                }
                <h1 className={"text-xl text-zinc-100"}>{data?.templateData.title}</h1>

                <div className={'fixed right-0 top-50'}>
                    <Button

                        className={'mr-4 bg-zinc-600 hover:bg-green-600'}
                        onClick={() => setIsEditMode(prev => !prev)}
                    >
                        {isEditMode ? "Cancel" : "Edit"}
                    </Button>

                    {
                        isEditMode &&
                        <Button

                            className={' mr-4 bg-zinc-600 hover:bg-green-600'}
                            disabled={answeredAmount !== answersData.length}
                            onClick={handleUpdate}
                        >
                            Save
                        </Button>
                    }
                </div>



            </div>

            <ul className={'w-full max-w-[800px] flex flex-col gap-4'}>
                {
                    answersData.map((question) => {
                        return <FillQuestionCard
                                disabled={!isEditMode}
                                handleChange={handleChangeAnswer}
                                item={question}
                                key={question.id}
                            />
                    })
                }
            </ul>


        </section>
    );
};

export default EditForm;
