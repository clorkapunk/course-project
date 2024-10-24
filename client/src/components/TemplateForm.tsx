import {Input} from "@/components/ui/input.tsx";
import {
    Select,
    SelectContent,
    SelectGroup, SelectItem,
    SelectLabel,
    SelectSeparator,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select.tsx";
import styles from "@/pages/AdminHistory/AdminHistory.module.scss";
import {Textarea} from "@/components/ui/textarea.tsx";
import ImageInput from "@/components/ImageInput.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Switch} from "@/components/ui/switch.tsx";
import {Label} from "@/components/ui/label.tsx";
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {FaPlus} from "react-icons/fa6";
import {
    Dialog,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog.tsx";
import {arrayMove, List} from "react-movable";
import CreateQuestionCard from "@/components/CreateQuestionCard.tsx";
import {useCallback, useEffect, useState} from "react";
import {QuestionData, TemplateData, UserData} from "@/types";
import {v4 as uuidv4} from "uuid";
import {useTranslation} from "react-i18next";
import {useGetTagsQuery, useGetTopicsQuery} from "@/features/templates/templatesApiSlice.ts";
import {useGetUsersQuery} from "@/features/users/usersApiSlice.ts";
import toast from "react-hot-toast";
export interface QuestionDataWithId extends QuestionData {
    id: string;
}

type Props = {
    handleSubmit: (body: FormData) => void;
    existingData?: TemplateData;
    submitButtonText: string;
}

const TemplateForm = ({handleSubmit, existingData, submitButtonText}: Props) => {
    const [userSearch, setUserSearch] = useState('')
    const [tagSearch, setTagSearch] = useState('')
    const {t} = useTranslation();
    const {data: tags, refetch: tagsRefetch} = useGetTagsQuery({
        page: 1,
        limit: 5,
        search: tagSearch
    })
    const {data: topics} = useGetTopicsQuery({})
    const {data: users, refetch: usersRefetch} = useGetUsersQuery({
        page: 1,
        limit: 5,
        orderBy: "email",
        sort: "desc",
        searchBy: "email",
        search: userSearch
    })
    const [questionsAmount, setQuestionsAmount] = useState({
        string: 0,
        text: 0,
        int: 0,
        bool: 0
    })

    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [image, setImage] = useState<File | null>(null)
    const [title, setTitle] = useState(existingData?.title || '')
    const [description, setDescription] = useState(existingData?.description || "")
    const [topicId, setTopicId] = useState<string | null>(existingData?.topic.id.toString() || null)
    const [isPublicMode, setIsPublicMode] = useState<boolean>(
        existingData ? (existingData?.mode === 'public') : true
    )
    const [allowedUsers, setAllowedUsers] = useState<UserData[]>([])
    const [inputTags, setInputTags] = useState<string[]>(existingData?.tags.map(i => i.name) || [])
    const [questions, setQuestions] = useState<QuestionDataWithId[]>(
        existingData?.questions?.map(q => ({...q, id: uuidv4()}))
        || [{id: uuidv4(), type: "string", question: "", description: ""}]
    )

    const handleDeleteQuestion = useCallback((id: string) => {
        setQuestions(prevState => prevState.filter(item => item.id !== id))
    }, [])

    const handleAddQuestion = (type: string) => {
        setQuestions(prev => [...prev, {id: uuidv4(), type, question: "", description: ""}])
    }

    const handleFileChange = (file: File) => {
        console.log(file.type)
        if (file && file.type === "image/png" || file.type === 'image/jpeg') {
            setImage(file);
        } else {
            toast.error('Please select a PNG or JPG file');
        }
    };

    const handleChangeQuestion = useCallback((value: string, name: string, id: string) => {

        setQuestions(prevState => {
            const index = prevState.findIndex(item => item.id === id)

            if (index === -1) return prevState
            if (name === 'question') {
                prevState[index].question = value;
            } else if (name === 'description') {
                prevState[index].description = value;
            }
            return prevState
        })
    }, [])

    const handleAddAllowedUser = (user: UserData) => {
        setAllowedUsers(prev => (Array.from(new Set([...prev, user]))))
    }

    const handleDeleteAllowedUser = (user: UserData) => {
        setAllowedUsers(prev => prev.filter(i => i.id !== user.id))
    }

    const handleAddTag = (name: string) => {
        setInputTags(prev => (Array.from(new Set([...prev, name]))))
    }

    const handleDeleteTag = (name: string) => {
        setInputTags(prev => prev.filter(tag => tag !== name))
    }

    useEffect(() => {
        setQuestionsAmount({
            string: questions.filter(i => i.type === 'string').length,
            text: questions.filter(i => i.type === 'text').length,
            int: questions.filter(i => i.type === 'int').length,
            bool: questions.filter(i => i.type === 'bool').length,
        })
    }, [questions])

    useEffect(() => {
        const timer = setTimeout(() => {
            tagsRefetch()
        }, 1000);

        return () => {
            clearTimeout(timer);
        };
    }, [tagSearch])

    useEffect(() => {
        const timer = setTimeout(() => {
            usersRefetch()
        }, 2000);

        return () => {
            clearTimeout(timer);
        };
    }, [userSearch]);

    const onSubmit = () => {
        const body = new FormData()

        if (!topicId) return
        if (image) {
            body.append('file', image)
        }
        body.append("title", title)
        body.append("description", description)
        body.append("topicId", topicId)
        body.append("mode", isPublicMode ? "public" : 'private')
        body.append("questions", JSON.stringify(questions))
        body.append('tags', JSON.stringify(inputTags))
        body.append('allowedUsers', JSON.stringify(allowedUsers.map(user => user.id)))

        handleSubmit(body)
    }

    return (
        <section className={'min-h-screen p-4 flex flex-col gap-4 pt-[72px]'}>
            <div className={'flex gap-4'}>
                <Input
                    className={'w-[200%]'}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={'Enter title, for example, "Biology. First lesson"'}
                />
                <Select
                    value={topicId || ''}
                    onValueChange={(value) => setTopicId(value)}>
                    <SelectTrigger
                        className={`${styles.select} w-full border-none bg-zinc-800 text-zinc-100 hover:bg-zinc-600`}>
                        <SelectValue placeholder={'Pick topic'}/>
                    </SelectTrigger>
                    <SelectContent className={'bg-zinc-800 border-zinc-600 text-zinc-100 '}>
                        <SelectGroup>
                            <SelectLabel>{t("select-topic")}</SelectLabel>
                            <SelectSeparator className={'bg-zinc-600'}/>
                            {
                                topics?.map(topic =>
                                    <SelectItem
                                        key={topic.id}
                                        className={'text-zinc-200 focus:bg-zinc-600 focus:text-zinc-100'}
                                        value={topic.id.toString()}
                                        defaultChecked
                                    >
                                        {topic.name}
                                    </SelectItem>
                                )
                            }
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
            <div className={'flex items-stretch gap-4'}>
                <Textarea
                    className={'resize-none'}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={'Add description...'}
                />
                <ImageInput
                    existingImage={existingData?.image}
                    handleChange={handleFileChange}
                    handleDelete={() => setImage(null)}
                />
            </div>

            <div className={'bg-zinc-800 rounded-md p-2 text-zinc-200 flex flex-col gap-2'}>
                <p className={'text-md'}>Tags</p>
                <div className={'flex flex-wrap gap-1 '}>
                    {
                        inputTags.map((tag) =>
                            <Button
                                onClick={() => handleDeleteTag(tag)}
                                size={'sm'}
                                className={'bg-zinc-600 py-2 px-4 hover:bg-red-600'}
                                key={tag}
                            >
                                {tag}
                            </Button>
                        )
                    }

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                    size={'sm'}
                            >
                                +
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align={'start'} className="w-[200px] p-0 bg-zinc-800 border-none">
                            <Input
                                value={tagSearch}
                                onChange={(e) => setTagSearch(e.target.value)}
                                placeholder="Search tag..."
                                className={'bg-zinc-600 placeholder:text-zinc-400'}
                            />
                            <div className={'flex flex-col py-2 px-1'}>
                                {tags?.data?.map((tag) => (
                                    <Button
                                        onClick={() => handleAddTag(tag.name)}

                                        className={'justify-between'}
                                        key={tag.id}
                                    >
                                        {tag.name}
                                    </Button>
                                ))}
                                {
                                    tagSearch &&
                                    <Button
                                        onClick={() => handleAddTag(tagSearch)}

                                        className={'justify-between'}
                                    >
                                        {tagSearch}
                                    </Button>
                                }
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className={'flex flex-col gap-4'}>

                <div className={'flex items-center gap-2'}>
                    <Switch
                        className={"data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"}
                        checked={isPublicMode}
                        id="airplane-mode"
                        onCheckedChange={(value) => setIsPublicMode(value)}
                    />
                    <Label htmlFor="airplane-mode" className={'text-zinc-100'}>Public mode</Label>
                </div>


                {
                    !isPublicMode &&
                    <div className={'bg-zinc-800 rounded-md p-2 text-zinc-200 flex flex-col gap-2'}>
                        <p className={'text-md'}>Allowed users</p>
                        <div className={'flex flex-wrap gap-1 '}>
                            {
                                allowedUsers.map((user) =>
                                    <Button
                                        onClick={() => handleDeleteAllowedUser(user)}
                                        size={'sm'}
                                        className={'bg-zinc-600 py-2 px-4 hover:bg-red-600'}
                                        key={user.id}>
                                        {user.email}
                                    </Button>
                                )
                            }

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button  size={'sm'}>
                                        +
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align={'start'} className="w-[200px] p-0 bg-zinc-800 border-none">
                                    <Input
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        placeholder="Search user..."
                                        className={'bg-zinc-600 placeholder:text-zinc-400'}
                                    />
                                    <div className={'flex flex-col py-2 px-1'}>
                                        {users?.data?.map((user) => (
                                            <Button
                                                onClick={() => handleAddAllowedUser(user)}

                                                className={'justify-between'}
                                                key={user.id}
                                                value={user.id.toString()}
                                            >
                                                {user.email}
                                            </Button>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                }

            </div>


            <div className={'flex flex-col gap-2'}>
                <div className={'flex justify-end gap-2'}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button >
                                <FaPlus/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                            <DropdownMenuLabel>Question type</DropdownMenuLabel>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem
                                disabled={questionsAmount.string >= 4}
                                className={'justify-between'}
                                onClick={() => handleAddQuestion("string")}
                            >
                                Single-line string
                                <span>{questionsAmount.string} / 4</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                disabled={questionsAmount.text >= 4}
                                className={'justify-between'}
                                onClick={() => handleAddQuestion("text")}
                            >
                                Multiple-line text
                                <span>{questionsAmount.text} / 4</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                disabled={questionsAmount.int >= 4}
                                className={'justify-between'}
                                onClick={() => handleAddQuestion("int")}
                            >
                                Positive integer
                                <span>{questionsAmount.int} / 4</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                disabled={questionsAmount.bool >= 4}
                                className={'justify-between'}
                                onClick={() => handleAddQuestion("bool")}
                            >
                                Checkbox
                                <span>{questionsAmount.bool} / 4</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Dialog open={isConfirmOpen} onOpenChange={(value) => setIsConfirmOpen(value)}>
                        <DialogTrigger asChild>
                            <Button >{submitButtonText}</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-none text-zinc-100">
                            <DialogHeader>
                                <DialogTitle className={'text-zinc-100'}>Confirmation</DialogTitle>
                                <DialogDescription className={'text-zinc-400'}>
                                    Are you sure you want to publish this template?
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button

                                    className={'hover:bg-red-600'}
                                    onClick={() => setIsConfirmOpen(false)}
                                >
                                    No
                                </Button>
                                <Button

                                    className={'hover:bg-green-600'}
                                    onClick={() => {
                                        onSubmit()
                                        setIsConfirmOpen(false)
                                    }}
                                >
                                    Yes
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <List
                    values={questions}
                    onChange={({oldIndex, newIndex}) =>
                        setQuestions(arrayMove(questions, oldIndex, newIndex))
                    }
                    renderList={({children, props}) => {
                        return <ul className={'flex flex-col'} {...props}>
                            {children}
                        </ul>
                    }}
                    renderItem={({value, index, props}) => {
                        const {key, ...otherProps} = props;
                        return <CreateQuestionCard
                            key={value.id}
                            otherProps={otherProps}
                            index={index}
                            item={value}
                            handleChange={handleChangeQuestion}
                            handleDelete={handleDeleteQuestion}
                        />;
                    }}
                />
            </div>


        </section>
    );
};

export default TemplateForm;
