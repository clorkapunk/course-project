import {Card, CardHeader, CardTitle, CardContent} from "@/components/ui/card.tsx";
import React, {useEffect, useState} from "react";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {FaTrash} from "react-icons/fa6";
import {QuestionDataWithId} from "@/components/TemplateForm.tsx";
import {useTranslation} from "react-i18next";

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
    const {t} = useTranslation()
    const [question, setQuestion] = useState(item.question)
    const [description, setDescription] = useState(item.description)
    const [errors, setErrors] = useState({
        question: false,
        description: false
    })

    useEffect(() => {
        handleChange(question, 'question', item.id)
    }, [question])

    useEffect(() => {
        handleChange(description, 'description', item.id)
    }, [description]);

    useEffect(() => {
        setErrors({
            question: question === '',
            description: description === ''
        })
    }, [question, description]);


    return (
        <Card {...otherProps} className={'bg-accent border-none mb-2 hover:cursor-move'}>
            <CardHeader className={'flex flex-row justify-between items-center py-1 md:py-2'}>
                <CardTitle className={'text-xl flex items-center gap-2 md:gap-4'}>
                    {index ? (index + 1) : 1}.
                    <div>
                        {item.type === "string" && t('single-line-string')}
                        {item.type === "int" && t('positive-integer')}
                        {item.type === "text" && t('multiple-line-text')}
                        {item.type === "bool" && t('checkbox')}
                    </div>
                </CardTitle>

                <Button
                    onClick={() => handleDelete(item.id)}
                    className={'hover:text-red-500 hover:bg-primary-foreground'}
                    variant={'secondary'}
                    size={'icon'}
                >
                    <FaTrash/>
                </Button>

            </CardHeader>
            <CardContent>
                <Input
                    placeholder={`${t('enter-question')}...`}
                    type={'text'}
                    value={question}
                    className={`mb-2 bg-primary-foreground ${errors.question && "border-red-600 border-x-0 border-t-0 border-b"}`}
                    onChange={(e) => setQuestion(e.target.value)}
                    name={'question'}/>
                <Textarea
                    placeholder={`${t('enter-question-description')}...`}
                    value={description}
                    className={`bg-primary-foreground ${errors.description && "border-red-600 border-x-0 border-t-0 border-b"}`}
                    onChange={(e) => setDescription(e.target.value)}
                    name={'description'}
                />
            </CardContent>
        </Card>
    );
};

export default CreateQuestionCard;
