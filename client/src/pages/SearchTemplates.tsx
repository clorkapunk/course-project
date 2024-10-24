import {useEffect} from "react";
import {Link} from "react-router-dom";
import {FILL_TEMPLATE_ROUTE} from "@/utils/routes.ts";
import {useLazySearchTemplatesQuery} from "@/features/templates/templatesApiSlice.ts";
import {useSelector} from "react-redux";
import {selectSearch} from "@/features/search/searchSlice.ts";
import Loading from "@/components/Loading.tsx";

const SearchTemplates = () => {
    const {search} = useSelector(selectSearch)
    const [triggerSearch, {data, isFetching}] = useLazySearchTemplatesQuery()


    useEffect(() => {
        const timer = setTimeout(() => {
            triggerSearch({search})
        }, 500);

        return () => {
            clearTimeout(timer);
        }
    }, [search])

    return (
        <section className={'h-screen  flex flex-col gap-4 p-8'}>
            {
                data?.data?.length
                    ? (<ul className={'flex flex-col pt-0 gap-2'}>
                        {
                            data?.data?.map(template =>
                                <Link to={`${FILL_TEMPLATE_ROUTE}/${template.id}`} key={template.id}>
                                    <li className={'bg-accent rounded-md p-2 px-4'}>
                                        <h3 className={'text-primary'}>{template.title}</h3>
                                        <p className={'text-primary/70'}>{template.description}</p>
                                    </li>
                                </Link>
                            )
                        }
                    </ul>)
                    : isFetching
                        ? <Loading/>
                        : <div className={'w-full text-center p-4'}>no results for query "{search}"</div>
            }

        </section>
    );
};

export default SearchTemplates;
