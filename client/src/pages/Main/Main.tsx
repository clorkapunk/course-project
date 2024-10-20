import {
    useGetLatestTemplatesQuery,
    useGetTagsQuery
} from "@/features/templates/templatesApiSlice.ts";
import {Input} from "@/components/ui/input.tsx";
import {AspectRatio} from "@/components/ui/aspect-ratio.tsx";
import LinesEllipsis from 'react-lines-ellipsis'
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useEffect, useState} from "react";
import {Badge} from "@/components/ui/badge.tsx";
import {Link, useNavigate} from "react-router-dom";
import {FILL_TEMPLATE_ROUTE, SEARCH_TEMPLATES_ROUTE} from "@/utils/routes.ts";

const Main = () => {
    const [latestPage, setLatestPage] = useState(1);
    const {data: latestTemplates} = useGetLatestTemplatesQuery({page: latestPage, limit: 4})
    const [tagsPage, setTagsPage] = useState(1)
    const {data: tags} = useGetTagsQuery({
        page: tagsPage,
        limit: 10,
        search: ''
    })
    const [search, setSearch] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        if(search !== '') navigate(`${SEARCH_TEMPLATES_ROUTE}?s=${search}`)
    }, [search]);

    return (
        <section className={'h-screen  flex flex-col gap-4'}>
            <div className={'h-[72px] p-4 bg-zinc-800 border-b border-zinc-600'}>
                <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={'Search for anything...'}
                    className={"bg-zinc-600 placeholder:text-zinc-400"}
                />
            </div>

            <div className={'flex flex-col gap-4 p-4'}>
                <h1 className={'text-zinc-100 text-xl'}>Latest templates</h1>
                <ul className={'w-full flex flex-wrap m-0 p-0 gap-4'}>
                    <TooltipProvider>
                        {
                            latestTemplates?.data?.map(template =>
                                <li
                                    key={template.id}
                                    className={'w-[24%]'}
                                >
                                    <Link to={`${FILL_TEMPLATE_ROUTE}/${template.id}`}>
                                        <AspectRatio
                                            ratio={16 / 9}
                                            className="p-2 bg-zinc-800 relative overflow-hidden cursor-pointer flex flex-col items-center justify-center rounded-md hover:brightness-125 hover:scale-105"
                                            onClick={() => {
                                            }}
                                        >
                                            {
                                                template.image &&
                                                <img
                                                    className={'w-full h-full object-cover absolute top-0 right-0'}
                                                    alt={'image'}
                                                    src={`https://drive.google.com/thumbnail?id=${template.image}&sz=w1000`}
                                                />
                                            }

                                            <Tooltip>
                                                <TooltipTrigger asChild className={'z-10'}>
                                                    <div>
                                                        <LinesEllipsis
                                                            text={template.title}
                                                            maxLine='3'
                                                            ellipsis='...'
                                                            trimRight
                                                            className={'text-zinc-200 text-center bg-zinc-900 bg-opacity-95 p-2 rounded-md'}
                                                        />
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{template.title}</p>
                                                </TooltipContent>
                                            </Tooltip>

                                            <p className={'bg-zinc-900 text-zinc-100 p-2 rounded-md mt-2 z-10'}>
                                                {`by: ${template.user.username}`}
                                            </p>

                                        </AspectRatio>
                                    </Link>
                                </li>
                            )
                        }
                    </TooltipProvider>

                    {

                    }
                </ul>

                {
                    latestTemplates && (latestTemplates.pages > latestTemplates.page) &&
                    <Button
                        className={'w-fit'}
                        variant={'dark'}
                        onClick={() => {
                            if (!latestTemplates) return
                            if (latestTemplates?.pages > latestTemplates?.page) {
                                setLatestPage(latestTemplates?.page + 1)
                            }
                        }}
                    >
                        See more...
                    </Button>
                }

            </div>

            <div className={'p-4'}>
                <ul className={'bg-zinc-800 p-2 flex gap-2 rounded-md'}>
                    {
                        tags?.data?.map(tag =>
                            <li key={tag.id}>
                                <Link to={""}>
                                    <Badge>
                                        {tag.name}
                                    </Badge>
                                </Link>
                            </li>
                        )
                    }
                </ul>
            </div>

        </section>
    );
};

export default Main;
