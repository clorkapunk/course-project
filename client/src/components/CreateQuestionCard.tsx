import {Card, CardHeader, CardTitle, CardContent} from "@/components/ui/card.tsx";
import React, {useEffect, useState} from "react";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {FaTrash} from "react-icons/fa6";
import {QuestionDataWithId} from "@/components/TemplateForm.tsx";

type Props = {
    index: number | undefined;
    item: QuestionDataWithId;
    handleChange: (value: string, name: string, id: string) => void;
    handleDelete: (id: string) => void;
    otherProps: {
        tabIndex?: number;
        "aria-roledescription"?: string;
        onKeyDown?: (e: React.KeyboardEvent) => void;
        onWheel?: (e: React.WheelEvent) => void;
        style?: React.CSSProperties;
        ref?: React.RefObject<any>;
    }
}

const CreateQuestionCard = ({otherProps, index, item, handleChange, handleDelete}: Props) => {

    const [question, setQuestion] = useState(item.question)
    const [description, setDescription] = useState(item.description)

    useEffect(() => {
        handleChange(question, 'question', item.id)
    }, [question])

    useEffect(() => {
        handleChange(description, 'description', item.id)
    }, [description]);



    return (
        <Card {...otherProps} className={'bg-zinc-800 border-none mb-2 hover:cursor-move'}>
            <CardHeader className={'flex flex-row justify-between items-center py-2'}>
                <CardTitle className={'text-zinc-200 text-xl flex items-center gap-4'}>
                    {index ? (index + 1) : 1}.
                    <div>
                        {item.type === "string" && "Single-line"}
                        {item.type === "int" && "Positive integer"}
                        {item.type === "text" && "Multiple-line"}
                        {item.type === "bool" && "Checkbox"}
                    </div>
                </CardTitle>

                <div className={'flex items-center justify-center gap-4'}>
                    <Button
                        className={'rounded-full'}
                        onClick={() => handleDelete(item.id)}
                        size={'icon'}
                    >
                        <FaTrash/>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Input
                    placeholder={'Enter question'}
                    type={'text'}
                    value={question}
                    className={'mb-2 bg-zinc-600 placeholder:text-zinc-300'}
                    onChange={(e) => setQuestion(e.target.value)}
                    name={'question'}/>
                <Textarea
                    placeholder={'Enter question description'}
                    value={description}
                    className={'bg-zinc-600 placeholder:text-zinc-300'}
                    onChange={(e) => setDescription(e.target.value)}
                    name={'description'}
                />
            </CardContent>
        </Card>
    );
};

export default CreateQuestionCard;
