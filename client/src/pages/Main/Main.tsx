import {
    useGetPopularTagsQuery,
    useGetTagsQuery,
    useLazyGetLatestTemplatesQuery,
    useLazyGetPopularTemplatesQuery,
    useLazyGetTemplatesByTagsQuery
} from "@/features/templates/templatesApiSlice.ts";
import {useEffect, useRef, useState} from "react";
import {Badge} from "@/components/ui/badge.tsx";
import TemplatesGrid from "@/components/TemplatesGrid.tsx";
import {useTranslation} from "react-i18next";
import {Input} from "@/components/ui/input.tsx";
import {Command, CommandEmpty, CommandGroup, CommandItem, CommandList} from "@/components/ui/command.tsx";

const Main = () => {
    const {t} = useTranslation()

    const [fetchLatestTemplates, {data: latestTemplates, isLoading: isLatestLoading}] = useLazyGetLatestTemplatesQuery()
    const [fetchPopularTemplates, {
        data: popularTemplates,
        isLoading: isPopularLoading
    }] = useLazyGetPopularTemplatesQuery()


    const tagsInputRef = useRef<HTMLInputElement>(null)
    const [tagSearch, setTagSearch] = useState('')
    const [isTagsSuggestionsShow, setIsTagsSuggestionsShow] = useState(false)
    const [inputTags, setInputTags] = useState<{ id: number; name: string }[]>([])
    const [excludeTags, setExcludeTags] = useState(inputTags.map(i => i.id))
    const {data: tags, refetch: tagsRefetch} = useGetTagsQuery({
        page: 1,
        limit: 5,
        search: tagSearch,
        exclude: excludeTags
    }, {refetchOnMountOrArgChange: false})
    const {data: popularTags} = useGetPopularTagsQuery({
        limit: 10,
        type: 'popular'
    })

    const [fetchTemplatesByTags, {
        data: tagsTemplates,
        isLoading: isTagsTemplatesLoading
    }] = useLazyGetTemplatesByTagsQuery()


    const handleAddTag = (id: number, name: string) => {
        setTagSearch('')
        setInputTags(prev => {
            if (prev.find(i => i.id === id)) return prev
            return [...prev, {id, name}]
        })
    }

    const handleTagDelete = (id: number) => {
        setInputTags(prev => prev.filter(i => i.id !== id))
    }

    useEffect(() => {
        setIsTagsSuggestionsShow(tagSearch !== '')
        const timer = setTimeout(() => {
            tagsRefetch()
        }, 500);

        return () => {
            clearTimeout(timer);
        };
    }, [tagSearch])

    useEffect(() => {
        setExcludeTags(inputTags.map(i => i.id))

        fetchTemplatesByTags({
            page: 1,
            limit: 4,
            tags: inputTags.map(i => i.id)
        })


    }, [inputTags])

    return (
        <section className={'min-h-screen  flex flex-col gap-12 p-2 lg:p-4 2xl:p-8'}>

            <TemplatesGrid
                isLoading={isLatestLoading}
                data={latestTemplates}
                label={t('latest-templates')}
                handleLoadMore={(page: number) => {
                    fetchLatestTemplates({
                        page,
                        limit: 4
                    })
                }}
            />


            <TemplatesGrid
                isLoading={isPopularLoading}
                data={popularTemplates}
                label={t('popular-templates')}
                handleLoadMore={(page: number) => {
                    fetchPopularTemplates({
                        page,
                        limit: 4
                    })
                }}
            />


            <div className={'flex flex-col gap-4'}>
                <h3>{t('top-popular-tags', {amount: popularTags?.data?.length || 10})}</h3>
                <ul className={' bg-accent p-2 flex flex-wrap gap-2 rounded-md cursor-pointer'}>
                    {
                        popularTags?.data?.map(tag =>
                            <li key={tag.id}>
                                <Badge
                                    onClick={() => {
                                        handleAddTag(tag.id, tag.name)
                                    }}
                                    className={'rounded-md text-nowrap bg-card hover:cursor-pointer hover:bg-primary hover:text-primary-foreground'}
                                    variant={'secondary'}
                                >
                                    {`${tag.name} (${tag._count.templates})`}
                                </Badge>
                            </li>
                        )
                    }
                </ul>
            </div>

            <div
                className={' flex flex-col gap-4'}
                onClick={() => {
                    tagsInputRef.current?.focus()
                }}
            >
                <h3>{t('search-by-tags')}</h3>
                <Command className="rounded-lg border">
                    <div
                        className={`${isTagsSuggestionsShow && 'border-b'}   rounded-md flex flex-wrap items-center p-2`}>
                        <ul className={'flex gap-2 flex-wrap items-center'}>
                            {
                                inputTags.map(tag =>
                                    <Badge
                                        key={tag.id}
                                        onClick={() => handleTagDelete(tag.id)}
                                        className={'bg-accent text-primary cursor-pointer hover:bg-red-600 hover:text-primary-foreground'}
                                    >
                                        {tag.name}
                                    </Badge>
                                )
                            }
                            <Input
                                placeholder={inputTags.length === 0 ? `${t('enter-tag')}...` : ''}
                                ref={tagsInputRef}
                                onChange={(e) => setTagSearch(e.target.value)}
                                value={tagSearch}
                                className={'focus-visible:ring-0 focus-visible:ring-offset-0 border-none w-fit h-[24px] p-0'}
                            />
                        </ul>

                    </div>

                    <CommandList className={`${isTagsSuggestionsShow ? 'block' : 'hidden'}`}>
                        <CommandEmpty>{t('no-results')}</CommandEmpty>
                        <CommandGroup>
                            {
                                tags?.data && tags?.data?.map((tag) =>
                                    <CommandItem key={tag.id} value={tag.name} onSelect={() => {
                                        handleAddTag(tag.id, tag.name)
                                        setIsTagsSuggestionsShow(false)
                                    }}>
                                        <span>{tag.name}</span>
                                    </CommandItem>)

                            }

                        </CommandGroup>
                    </CommandList>
                </Command>
                <TemplatesGrid
                    isLoading={isTagsTemplatesLoading}
                    handleLoadMore={(page: number) => {
                        fetchTemplatesByTags({
                            page,
                            limit: 4,
                            tags: inputTags.map(i => i.id)
                        })
                    }}
                    data={tagsTemplates}
                />
            </div>


        </section>
    );
};

export default Main;
