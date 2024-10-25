import {Button} from "@/components/ui/button.tsx";
import FillQuestionCard from "@/components/FillQuestionCard.tsx";
import {Navigate, useNavigate, useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {HOME_ROUTE} from "@/utils/routes.ts";
import {
    useGetUserFilledFormQuery, useUpdateFormMutation,
} from "@/features/forms/formsApiSlice.ts";
import {useCallback, useEffect, useState} from "react";
import toast from "react-hot-toast";
import {v4 as uuidv4} from "uuid";
import {AnsweredQuestionDataWithId} from "@/pages/FillTemplate.tsx";
import Loading from "@/components/Loading.tsx";
import catchApiErrors from "@/utils/catch-api-errors.ts";


const EditForm = () => {

    const {id} = useParams()
    const {t} = useTranslation()
    const navigate = useNavigate()

    if (!id || isNaN(parseInt(id))) {
        return <Navigate to={HOME_ROUTE} replace/>
    }

    const {data, isLoading} = useGetUserFilledFormQuery({formId: parseInt(id)})

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
        if(!data && !isLoading) navigate(HOME_ROUTE)
    }, [data, isLoading]);

    useEffect(() => {
        if (data?.questions) {
            setAnswersData(data?.questions.map(q => ({id: uuidv4(), ...q})))
        }
    }, [data?.questions]);


    return (
        <section className={'min-h-screen flex flex-col items-center gap-4 pb-4'}>

            <div
                className={'flex z-10  items-center bg-accent px-[60px] h-[72px] justify-between w-full sticky top-0 border-b'}>

                {
                    !isLoading &&
                    <>
                        <div className={'flex flex-col sm:items-center gap-1 w-full'}>
                            {
                                data?.questions &&
                                <p className={"text-sm md:text-base leading-none text-center"}>{answeredAmount} / {data?.questions.length || 0}</p>
                            }
                            <h1 title={data?.templateData.title}
                                className={"text-lg md:text-xl leading-none text-center truncate w-full"}>{data?.templateData.title}</h1>
                        </div>

                        <div className={'hidden md:flex fixed right-0 top-50 mr-4 gap-2'}>
                            <Button
                                variant={'default'}
                                className={'hover:bg-green-600'}
                                onClick={() => setIsEditMode(prev => !prev)}
                            >
                                {isEditMode ? "Cancel" : "Edit"}
                            </Button>

                            {
                                isEditMode &&
                                <Button
                                    variant={'default'}
                                    className={'md:block hover:bg-green-600'}
                                    disabled={answeredAmount !== answersData.length}
                                    onClick={handleUpdate}
                                >
                                    Save
                                </Button>
                            }
                        </div>
                    </>
                }
            </div>


            {
                isLoading
                    ? <Loading/>
                    :
                    <>
                        <ul className={'w-full max-w-[800px] flex flex-col gap-2 md:gap-4 p-2 md:p-4 2xl:p-8'}>
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
                        <div className={' flex md:hidden w-full gap-2 md:gap-4 p-2 md:p-4 2xl:p-8'}>
                            <Button
                                variant={'default'}
                                className={'hover:bg-green-600 w-full'}
                                onClick={() => setIsEditMode(prev => !prev)}
                            >
                                {isEditMode ? "Cancel" : "Edit"}
                            </Button>

                            {
                                isEditMode &&
                                <Button
                                    variant={'default'}
                                    className={'md:block hover:bg-green-600 w-full'}
                                    disabled={answeredAmount !== answersData.length}
                                    onClick={handleUpdate}
                                >
                                    Save
                                </Button>
                            }
                        </div>
                    </>

            }


        </section>
    );
};

export default EditForm;
