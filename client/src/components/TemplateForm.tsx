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
import Loading from "@/components/Loading.tsx";

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
    const {data: tags, refetch: tagsRefetch, isFetching: isTagsFetching} = useGetTagsQuery({
        page: 1,
        limit: 5,
        search: tagSearch
    })
    const {data: topics} = useGetTopicsQuery({})
    const {data: users, refetch: usersRefetch, isFetching: isUsersFetching} = useGetUsersQuery({
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
    const [inputTags, setInputTags] = useState<string[]>(existingData?.tags.map(i => i.name) || [])
    const [errors, setErrors] = useState({
        title: false,
        description: false,
        topicId: false,
        questions: false
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
            toast.error(t('wrong-image-type'));
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

            console.log('done')
            setErrors(prev => ({
                ...prev,
                questions: !!prevState.find(q => {
                    return q.question === '' || q.description === ''
                })
            }))

            return prevState
        })




    }, [])

    const handleAddAllowedUser = (user: UserData) => {
        setAllowedUsers(prev => (Array.from(new Set([...prev, user]))))
        setUserSearch('')
    }

    const handleDeleteAllowedUser = (user: UserData) => {
        setAllowedUsers(prev => prev.filter(i => i.id !== user.id))
    }

    const handleAddTag = (name: string) => {
        setInputTags(prev => (Array.from(new Set([...prev, name]))))
        setTagSearch('')
    }

    const handleDeleteTag = (name: string) => {
        setInputTags(prev => prev.filter(tag => tag !== name))
    }

    const onSubmit = () => {
        const body = new FormData()

        if (errors.title || errors.topicId || errors.description || errors.questions) {
            if(!errors.title && !errors.topicId && !errors.description && errors.questions && questions.length === 0 ){
                toast.error(t('template-should-contain-at-least-1-question'))
                return
            }
            toast.error(t('fill-all-required-fields'))
            return
        }

        if(questions.length === 0 ){
            toast.error(t('template-should-contain-at-least-1-question'))
            return
        }


        if (image) {
            body.append('file', image)
        }


        body.append("title", title)
        body.append("description", description)
        body.append("topicId", topicId!)
        body.append("mode", isPublicMode ? "public" : 'private')
        body.append("questions", JSON.stringify(questions))
        body.append('tags', JSON.stringify(inputTags))
        if(isPublicMode) {
            body.append('allowedUsers', JSON.stringify([]))
        }
        else{
            body.append('allowedUsers', JSON.stringify(allowedUsers.map(user => user.id)))
        }
        handleSubmit(body)
    }

    useEffect(() => {
        setQuestionsAmount({
            string: questions.filter(i => i.type === 'string').length,
            text: questions.filter(i => i.type === 'text').length,
            int: questions.filter(i => i.type === 'int').length,
            bool: questions.filter(i => i.type === 'bool').length,
        })
    }, [questions]);

    useEffect(() => {
        const timer = setTimeout(() => {
            tagsRefetch()
        }, 1000);

        return () => {
            clearTimeout(timer);
        };
    }, [tagSearch]);

    useEffect(() => {
        const timer = setTimeout(() => {
            usersRefetch()
        }, 500);

        return () => {
            clearTimeout(timer);
        };
    }, [userSearch]);

    useEffect(() => {
        setErrors(prev => ({
            title: title === '',
            description: description === '',
            topicId: topicId === null,
            questions: prev.questions
        }))
    }, [topicId, title, description]);

    return (
        <section className={'flex flex-col gap-4'}>
            <div className={'flex gap-4'}>
                <Input
                    className={`w-[200%] bg-accent ${errors.title && "border-red-600 border-x-0 border-t-0 border-b"}`}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t('create-template-title-placeholder')}
                />
                <Select
                    value={topicId || ''}
                    onValueChange={(value) => setTopicId(value)}>
                    <SelectTrigger
                        className={`${styles.select} w-full bg-accent hover:bg-primary-foreground h-full ${errors.topicId ? "border-red-600 border-x-0 border-t-0 border-b" : "border-none"}`}>
                        <SelectValue placeholder={t('pick-topic')}/>
                    </SelectTrigger>
                    <SelectContent className={'bg-primary-foreground'}>
                        <SelectGroup>
                            <SelectLabel>{t("select-topic")}</SelectLabel>
                            <SelectSeparator/>
                            {
                                topics?.map(topic =>
                                    <SelectItem
                                        key={topic.id}
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
                    className={`resize-none bg-accent ${errors.description && "border-red-600 border-x-0 border-t-0 border-b"}`}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={`${t('create-template-description-placeholder')}...`}
                />
                <ImageInput
                    existingImage={existingData?.image}
                    handleChange={handleFileChange}
                    handleDelete={() => setImage(null)}
                />
            </div>

            <div className={'bg-accent rounded-md p-2 flex flex-col gap-2'}>
                <p className={'text-md'}>{t('tags')}</p>
                <div className={'flex flex-wrap gap-1 '}>
                    {
                        inputTags.map((tag) =>
                            <Button
                                onClick={() => handleDeleteTag(tag)}
                                size={'sm'}
                                className={'hover:bg-red-600'}
                                variant={'outline'}
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
                                className={'hover:bg-primary-foreground'}
                                variant={'ghost'}
                            >
                                +
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent  align={'start'} className="w-[200px] p-0 bg-primary-foreground">
                            <Input
                                onKeyDown={(event) => {
                                    if(event.key === 'Enter' && !isTagsFetching) {
                                        let tag = tags?.data?.find(tag => tag.name === tagSearch)?.name
                                        if(!tag) tag = tagSearch
                                        handleAddTag(tag)

                                    }
                                }}
                                className={'border-x-0 border-t-0 bg-accent focus-visible:ring-offset-0 focus-visible:ring-0'}
                                value={tagSearch}
                                maxLength={20}
                                onChange={(e) => setTagSearch(e.target.value)}
                                placeholder={`${t("search-tag")}...`}
                            />
                            <div className={'flex flex-col py-1 px-1'}>
                                {
                                    !isTagsFetching ?
                                        <>
                                            {
                                                (tagSearch && !tags?.data?.find(t => t.name === tagSearch)) &&
                                                <Button
                                                    onClick={() => handleAddTag(tagSearch)}
                                                    variant={'outline'}
                                                    className={'text-start border-none truncate block'}
                                                >
                                                    {tagSearch}
                                                </Button>
                                            }
                                            {tags?.data?.map((tag) => (
                                                <Button
                                                    onClick={() => handleAddTag(tag.name)}
                                                    variant={'ghost'}
                                                    className={'justify-between border-none truncate'}
                                                    key={tag.id}
                                                >
                                                    {tag.name}
                                                </Button>
                                            ))}
                                        </>
                                        :
                                        <Loading isFullScreen={false}/>
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
                        id="public-mode"
                        onCheckedChange={(value) => setIsPublicMode(value)}
                    />
                    <Label htmlFor="public-mode">{t("public-mode")}</Label>
                </div>


                {
                    !isPublicMode &&
                    <div className={'bg-accent rounded-md p-2 flex flex-col gap-2'}>
                        <p className={'text-md'}>{t('allowed-users')}</p>
                        <div className={'flex flex-wrap gap-1 '}>
                            {
                                allowedUsers.map((user) =>
                                    <Button
                                        onClick={() => handleDeleteAllowedUser(user)}
                                        size={'sm'}
                                        variant={'outline'}
                                        className={'hover:bg-red-600'}
                                        key={user.id}>
                                        {user.email}
                                    </Button>
                                )
                            }

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        size={'sm'}
                                        className={'hover:bg-primary-foreground'}
                                        variant={'ghost'}
                                    >
                                        +
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent  align={'start'} className="w-fit min-w-[200px] max-w-full p-0 bg-primary-foreground">
                                    <Input
                                        onKeyDown={(event) => {
                                            if(event.key === 'Enter' && !isUsersFetching) {
                                                let user = users?.data?.[0]
                                                if(!user) return;
                                                handleAddAllowedUser(user)
                                            }
                                        }}
                                        className={'border-x-0 border-t-0 bg-accent focus-visible:ring-offset-0 focus-visible:ring-0'}
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        placeholder={`${t('search-user')}...`}
                                    />
                                    <div className={'flex flex-col py-1 px-1'}>
                                        {
                                            !isUsersFetching
                                            ?
                                            <>
                                                {users?.data?.map((user) => (
                                                    <Button
                                                        onClick={() => handleAddAllowedUser(user)}
                                                        variant={'ghost'}
                                                        className={'text-start border-none truncate block'}
                                                        key={user.id}
                                                        value={user.id.toString()}
                                                    >
                                                        {user.email}
                                                    </Button>
                                                ))}
                                            </>
                                            :
                                            <Loading isFullScreen={false}/>
                                        }

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
                            <Button
                                size={'icon'}
                                variant={'secondary'}
                            >
                                <FaPlus/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 bg-primary-foreground">
                            <DropdownMenuLabel>{t('answer-type')}</DropdownMenuLabel>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem
                                disabled={questionsAmount.string >= 4}
                                className={'justify-between'}
                                onClick={() => handleAddQuestion("string")}
                            >
                                {t('single-line-string')}
                                <span>{questionsAmount.string} / 4</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                disabled={questionsAmount.text >= 4}
                                className={'justify-between'}
                                onClick={() => handleAddQuestion("text")}
                            >
                                {t('multiple-line-text')}
                                <span>{questionsAmount.text} / 4</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                disabled={questionsAmount.int >= 4}
                                className={'justify-between'}
                                onClick={() => handleAddQuestion("int")}
                            >
                                {t('positive-integer')}
                                <span>{questionsAmount.int} / 4</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                disabled={questionsAmount.bool >= 4}
                                className={'justify-between'}
                                onClick={() => handleAddQuestion("bool")}
                            >
                                {t('checkbox')}
                                <span>{questionsAmount.bool} / 4</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Dialog open={isConfirmOpen} onOpenChange={(value) => setIsConfirmOpen(value)}>
                        <DialogTrigger asChild>
                            <Button
                                className={'hover:bg-green-600'}
                                variant={'secondary'}
                            >
                                {submitButtonText}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] rounded-md">
                            <DialogHeader>
                                <DialogTitle>{t('confirmation')}</DialogTitle>
                                <DialogDescription>
                                    {t('template-publish-confirmation-question')}
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className={'flex flex-row gap-2 sm:justify-end sm:gap-0'}>
                                <Button
                                    variant={'default'}
                                    className={'w-full sm:w-fit'}
                                    onClick={() => setIsConfirmOpen(false)}
                                >
                                    {t('no')}
                                </Button>
                                <Button
                                    variant={'default'}
                                    className={'w-full sm:w-fit'}
                                    onClick={() => {
                                        onSubmit()
                                        setIsConfirmOpen(false)
                                    }}
                                >
                                    {t('yes')}
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
