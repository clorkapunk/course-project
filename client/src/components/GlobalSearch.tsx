import {selectSearch, setSearch} from "@/features/search/searchSlice.ts";
import {Input} from "@/components/ui/input.tsx";
import {useLocation, useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {useEffect, useRef, useState} from "react";
import {HOME_ROUTE, PROFILE_ROUTE, SEARCH_TEMPLATES_ROUTE} from "@/utils/routes.ts";
import {useTranslation} from "react-i18next";

const GlobalSearch = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {search} = useSelector(selectSearch)
    const inputRef = useRef<HTMLInputElement>(null)
    const [routes, _setRoutes] = useState([
        HOME_ROUTE,
        SEARCH_TEMPLATES_ROUTE,
        PROFILE_ROUTE
    ])
    const {t} = useTranslation()

    useEffect(() => {
        if(search === ''){
            if (document.activeElement === inputRef.current) {
                navigate(-1)
            }
        }
        else{
            if(location.pathname !== SEARCH_TEMPLATES_ROUTE){
                navigate(SEARCH_TEMPLATES_ROUTE)
            }
        }
    }, [search]);

    if(!routes.includes(location.pathname)){
        return <></>
    }

    return (
        <div className={'h-[72px] p-4 bg-accent border-b sticky top-0 z-40 pl-[60px] md:pl-4'}>
            <Input
                placeholder={`${t('search-for-anything')}...`}
                ref={inputRef}
                value={search}
                onChange={(e) => dispatch(setSearch({search: e.target.value}))}
                className={'bg-primary-foreground'}
            />
        </div>
    );
};

export default GlobalSearch;
