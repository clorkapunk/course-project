import {Navigate, useParams} from "react-router-dom";
import {useGetTemplateByIdQuery} from "@/features/templates/templatesApiSlice.ts";
import {HOME_ROUTE} from "@/utils/routes.ts";
import FillQuestionCard from "@/components/FillQuestionCard.tsx";
import {useCallback, useEffect, useState} from "react";
import {AnsweredQuestionData} from "@/types";
import {v4 as uuidv4} from 'uuid'
import {Button} from "@/components/ui/button.tsx";
import {
    useLazyGetUserFilledFormQuery,
    useSubmitFormMutation
} from "@/features/forms/formsApiSlice.ts";
import {useSelector} from "react-redux";
import {selectAuthState} from "@/features/auth/authSlice.ts";
import ViewQuestionCard from "@/components/ViewQuestionCard.tsx";
import useLocalStorage from "@/hooks/useLocalStorage.ts";

export interface AnsweredQuestionDataWithId extends AnsweredQuestionData {
    id: string;
}

const FillTemplate = () => {
    const {id} = useParams()

    if (!id || isNaN(parseInt(id))) {
        return <Navigate to={HOME_ROUTE} replace/>
    }

    const {data, isLoading} = useGetTemplateByIdQuery({id: parseInt(id)})

    if (!data && !isLoading) {
        return <Navigate to={HOME_ROUTE} replace/>
    }

    const authState = useSelector(selectAuthState)
    const [fetchData, { data: formAnswers }] = useLazyGetUserFilledFormQuery()

    useEffect(() => {
        if(authState?.token){
            try{
                fetchData({
                    templateId: parseInt(id),
                    userId: authState?.id || 0
                })
            } catch(err){
                console.log(err)
            }
        }
    }, [authState?.token]);



    useEffect(() => {
        console.log(formAnswers)
    }, [formAnswers])


    const [submitForm] = useSubmitFormMutation()

    const [answersData, setAnswersData] = useLocalStorage<AnsweredQuestionDataWithId[]>("questions", [])
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
            const response = await submitForm({
                templateId: parseInt(id),
                answers: answersData.map(data => {
                    let answer = data.answer
                    if (data.answer !== null && data.type === 'int') answer = parseInt(data.answer.toString())
                    return {
                        type: data.type,
                        answer
                    }
                })
            }).unwrap()
            console.log(response)
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        if(!formAnswers){
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
        }
        else{
            setAnswersData(formAnswers.map(q => {
                return {
                    id: uuidv4(),
                    ...q,
                }
            }))
        }

    }, [data?.questions, formAnswers]);


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
                    variant={'dark'}
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
