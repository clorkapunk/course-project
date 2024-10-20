import {Input} from "@/components/ui/input.tsx";
import {useEffect, useRef, useState} from "react";
import {Link, useNavigate, useSearchParams} from "react-router-dom";
import {FILL_TEMPLATE_ROUTE, HOME_ROUTE} from "@/utils/routes.ts";
import {useLazySearchTemplatesQuery} from "@/features/templates/templatesApiSlice.ts";

const SearchTemplates = () => {
    let [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate()
    const [search, setSearch] = useState(searchParams.get('s') || '')
    const inputRef = useRef<HTMLInputElement>(null)
    const [triggerSearch, {data}] = useLazySearchTemplatesQuery()

    useEffect(() => {
        console.log(searchParams)
        inputRef.current?.focus()
    }, []);

    useEffect(() => {
        console.log(`[useEffect]: ${search}`)
        let timer: NodeJS.Timeout;
        if (search === '') {
            navigate(HOME_ROUTE)
        } else {
            console.log(`[useEffect] [else]: ${search}`)
            setSearchParams({s: search})
            timer = setTimeout(() => {
                console.log(`[useEffect] [timer]: ${search}`)
                triggerSearch({search})
            }, 2000);
        }

        return () => {
            console.log(`[useEffect] [return]: ${search}`)
            if (timer) clearTimeout(timer);
        }
    }, [search])
    return (
        <section className={'h-screen  flex flex-col gap-4'}>
            <div className={'h-[72px] p-4 bg-zinc-800 border-b border-zinc-600'}>
                <Input
                    ref={inputRef}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={'Search for anything...'}
                    className={"bg-zinc-600 placeholder:text-zinc-400"}
                />
            </div>

            <ul className={'flex flex-col p-4 pt-0 gap-2'}>
                {
                    data?.data?.map(template =>

                        <Link to={`${FILL_TEMPLATE_ROUTE}/${template.id}`} key={template.id} >
                            <li className={'bg-zinc-800 rounded-md p-2 px-4'}>
                                <h3 className={'text-zinc-100'}>{template.title}</h3>
                                <p className={'text-zinc-400'}>{template.description}</p>
                            </li>
                        </Link>
                    )
                }

            </ul>
        </section>
    );
};

export default SearchTemplates;
