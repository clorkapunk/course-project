import {Input} from "@/components/ui/input.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {useEffect, useState} from "react";
import {AnsweredQuestionDataWithId} from "@/pages/FillTemplate.tsx";
import {useTranslation} from "react-i18next";

const FillQuestionCard = ({item, handleChange, disabled = false}: {
    item: AnsweredQuestionDataWithId,
    handleChange: (id: string, answer: string | number | boolean) => void;
    disabled?: boolean;
}) => {
    const {t} = useTranslation()
    const [answer, setAnswer] = useState(item.answer)
    const [isCorrect, setIsCorrect] = useState(false)

    useEffect(() => {
        if (answer === null) return
        setIsCorrect(answer !== '')
        handleChange(item.id, answer)
    }, [answer]);

    return (
        <li className={`bg-accent rounded-md flex flex-col overflow-hidden gap-4`}>
            <div className={'flex flex-col gap-1 md:gap-2 p-4 2xl:p-8 pb-0'}>
                <h3 className={'text-xl text-wrap text-center md:text-left'}>{item.question}</h3>
                <p className={'text-md opacity-90 text-wrap text-center md:text-left'}>{item.description}</p>
            </div>

            <div className={'p-4 md:p-8 pt-2 md:pt-4 relative'}>
                {
                    item.type === "string" &&
                    <Input
                        readOnly={disabled}
                        type={'text'}
                        value={answer?.toString()}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder={`${t('enter-answer')}...`}
                        className={`bg-primary-foreground border-x-0 border-t-0 border-b ${isCorrect ? "border-green-600" : "border-red-600"}`}
                    />
                }
                {
                    item.type === "int" &&
                    <Input
                        readOnly={disabled}
                        type={'number'}
                        value={answer?.toString()}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder={`${t('enter-positive-number')}...`}
                        className={`bg-primary-foreground border-x-0 border-t-0 border-b ${isCorrect ? "border-green-600" : "border-red-600"}`}
                    />
                }
                {
                    item.type === 'text' &&
                    <Textarea
                        readOnly={disabled}
                        value={answer?.toString()}
                        onChange={(e) => setAnswer(e.target.value)}
                        className={`bg-primary-foreground resize-none border-x-0 border-t-0 border-b ${isCorrect ? "border-green-600" : "border-red-600"}`}
                        placeholder={`${t('enter-answer')}...`}
                    />
                }
                {
                    item.type === "bool" &&
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id={'answer'}
                            disabled={disabled}
                            onCheckedChange={(value) => setAnswer(value)}
                            checked={Boolean(answer)}
                        />
                        <label
                            htmlFor="answer"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            {t('check-if-you-agree')}
                        </label>
                    </div>

            }
        </div>

</li>
)
    ;
};

export default FillQuestionCard;
