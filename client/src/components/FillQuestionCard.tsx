import {Input} from "@/components/ui/input.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {useEffect, useState} from "react";
import {AnsweredQuestionDataWithId} from "@/pages/FillTemplate.tsx";

const FillQuestionCard = ({item, handleChange, disabled = false}: {
    item: AnsweredQuestionDataWithId,
    handleChange: (id: string, answer: string | number | boolean) => void;
    disabled?: boolean;
}) => {
    const [answer, setAnswer] = useState(item.answer)
    const [status, setStatus] = useState(false)

    useEffect(() => {
        if (answer === null) return
        setStatus(answer !== '')
        handleChange(item.id, answer)
    }, [answer]);

    return (
        <li className={`bg-zinc-800 rounded-md flex flex-col overflow-hidden gap-4 border-2 ${status ? "border-green-600" : "border-zinc-800"}`}>
            <div className={'flex flex-col gap-2 p-8 pb-0'}>
                <h3 className={'text-xl text-zinc-200 text-wrap'}>{item.question}</h3>
                <p className={'text-md text-zinc-400 text-wrap'}>{item.description}</p>
            </div>

            <div className={'p-8 pt-4 relative'}>
                {
                    item.type === "string" &&
                    <Input
                        readOnly={disabled}
                        type={'text'}
                        value={answer?.toString()}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder={'Answer here...'}
                        className={'bg-zinc-600 placeholder:text-zinc-300'}
                    />
                }
                {
                    item.type === "int" &&
                    <Input
                        readOnly={disabled}
                        type={'number'}
                        value={answer?.toString()}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder={'Answer here...'}
                        className={'bg-zinc-600 placeholder:text-zinc-300'}
                    />
                }
                {
                    item.type === 'text' &&
                    <Textarea
                        readOnly={disabled}
                        value={answer?.toString()}
                        onChange={(e) => setAnswer(e.target.value)}
                        className={'bg-zinc-600 placeholder:text-zinc-300 resize-none'}
                    />
                }
                {
                    item.type === "bool" &&
                    <Checkbox
                        disabled={disabled}
                        onCheckedChange={(value) => setAnswer(value)}
                        checked={Boolean(answer)}
                    />
                }
            </div>

        </li>
    );
};

export default FillQuestionCard;
