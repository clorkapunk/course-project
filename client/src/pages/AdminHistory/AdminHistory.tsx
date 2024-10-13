import styles from './AdminHistory.module.scss'
import {useGetHistoryQuery} from "@/features/users/usersApiSlice.ts";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card.tsx";
import HistoryActionTypes from "@/utils/admin-history-action-types.ts";
import {getRoleName} from "@/pages/UsersManagement/UsersManagement.tsx";
import {useCallback, useEffect, useRef, useState} from "react";
import {ScrollArea} from "@/components/ui/scroll-area.tsx";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel, SelectSeparator,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select.tsx";
import {useTranslation} from "react-i18next";
import {Input} from "@/components/ui/input.tsx";

const actionTypeToString = (value: string) => {
    switch (value) {
        case HistoryActionTypes.ChangeStatus:
            return "status"
        case HistoryActionTypes.ChangeRole:
            return "role"
    }
}

const newValueToString = (actionType: string, value: string) => {
    if (actionType === HistoryActionTypes.ChangeStatus) {
        const isActive = value === 'true';
        return isActive ? 'Active' : "Banned";
    } else if (actionType === HistoryActionTypes.ChangeRole) {
        return getRoleName(parseInt(value))
    }
}

const AdminHistory = () => {
    const [page, setPage] = useState(1)
    const {data, isLoading} = useGetHistoryQuery({page})
    const elementRef = useRef(null)
    const {t} = useTranslation()
    const [initiatorField, setInitiatorField] = useState('username')
    const [victimField, setVictimField] = useState('username')


    const handleObserver = useCallback((entries: any) => {
        console.log(page)
        if (entries[0].isIntersecting) {
            if(isLoading || !data) return;
            if(data?.pages > data?.page){
                setPage(data?.page + 1)
            }
        }
    }, [isLoading, page, data]);

    useEffect(() => {
        const observer = new IntersectionObserver(handleObserver)
        if (observer && elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => {
            if (observer) observer.disconnect();
        }
    }, [handleObserver])

    return (
        <section className={styles.page}>
            <div className={'flex gap-4 items-end'}>
                <div className={'flex flex-col gap-1'}>
                    <p className={'text-zinc-200'}>Show admin's:</p>
                    <Select value={initiatorField} onValueChange={(value) => setInitiatorField(value)}>
                        <SelectTrigger
                            className={`${styles.select} w-full border-none bg-zinc-800 text-zinc-100 hover:bg-zinc-600`}>
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent className={'bg-zinc-800 border-zinc-600 text-zinc-100 '}>
                            <SelectGroup>
                                <SelectLabel>{t("search-by")}</SelectLabel>
                                <SelectSeparator className={'bg-zinc-600'}/>
                                <SelectItem
                                    className={'text-zinc-200 focus:bg-zinc-600 focus:text-zinc-100'}
                                    value="email"
                                    defaultChecked>{t("email")}</SelectItem>
                                <SelectItem
                                    className={'text-zinc-200 focus:bg-zinc-600 focus:text-zinc-100'}
                                    value="username" defaultChecked>{t("username")}</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Input
                        // className={styles.input}
                        // type={'text'}
                        // value={searchString}
                        // onChange={(e) => setSearchString(e.target.value)}
                        // placeholder={t(`search-by-${searchField}`)}
                    />
                </div>
                <div className={'flex flex-col gap-1'}>
                    <p className={'text-zinc-200'}>Show user's:</p>
                    <Select value={victimField} onValueChange={(value) => setVictimField(value)}>
                        <SelectTrigger
                            className={`${styles.select} w-full border-none bg-zinc-800 text-zinc-100 hover:bg-zinc-600`}>
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent className={'bg-zinc-800 border-zinc-600 text-zinc-100 '}>
                            <SelectGroup>
                                <SelectLabel>{t("search-by")}</SelectLabel>
                                <SelectSeparator className={'bg-zinc-600'}/>
                                <SelectItem
                                    className={'text-zinc-200 focus:bg-zinc-600 focus:text-zinc-100'}
                                    value="email"
                                    defaultChecked>{t("email")}</SelectItem>
                                <SelectItem
                                    className={'text-zinc-200 focus:bg-zinc-600 focus:text-zinc-100'}
                                    value="username" defaultChecked>{t("username")}</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Input
                        // className={styles.input}
                        // type={'text'}
                        // value={searchString}
                        // onChange={(e) => setSearchString(e.target.value)}
                        // placeholder={t(`search-by-${searchField}`)}
                    />
                </div>
            </div>
            <div className={styles.container}>
                <ScrollArea>
                    {
                        data?.data.map(i => {
                            return (<div className={styles.line} key={i.id}>
                                <p className={styles.date}>
                                    {`[${new Date(i.createdAt).toLocaleString()}]:`}
                                </p>
                                <HoverCard>
                                    <HoverCardTrigger asChild>
                                        <button
                                            className={styles.username}
                                        >
                                            {initiatorField === 'username' && i.initiator.username}
                                            {initiatorField === 'email' && i.initiator.email}
                                        </button>
                                    </HoverCardTrigger>
                                    <HoverCardContent
                                        className={styles.hoverCard}
                                        align={'center'}>
                                        <div className={styles.cardLine}>
                                            <p className={styles.key}>Email:</p>
                                            <p className={styles.value}>{i.initiator.email}</p>
                                        </div>
                                        <div className={styles.cardLine}>
                                            <p className={styles.key}>Role:</p>
                                            <p className={styles.value}>{getRoleName(i.initiator.role)}</p>
                                        </div>
                                            <div className={styles.cardLine}>
                                                <p className={styles.key}>Username:</p>
                                                <p className={styles.value}>{i.initiator.username}</p>
                                            </div>
                                            <div className={styles.cardLine}>
                                                <p className={styles.key}>Status:</p>
                                                <p className={styles.value}>{i.initiator.isActive ? "Active" : "Banned"}</p>
                                            </div>
                                        </HoverCardContent>
                                    </HoverCard>
                                    <p className={styles.action}>
                                        {`updated ${actionTypeToString(i.action_type)} of`}
                                    </p>
                                    <HoverCard>
                                        <HoverCardTrigger asChild>
                                            <button
                                                className={styles.username}
                                            >
                                                {victimField === 'username' && i.victim.username}
                                                {victimField === 'email' && i.victim.email}
                                            </button>
                                        </HoverCardTrigger>
                                        <HoverCardContent className={styles.hoverCard} align={'center'}>
                                            <div className={styles.cardLine}>
                                                <p className={styles.key}>Email:</p>
                                                <p className={styles.value}>{i.victim.email}</p>
                                            </div>
                                            <div className={styles.cardLine}>
                                                <p className={styles.key}>Role:</p>
                                                <p className={styles.value}>{getRoleName(i.victim.role)}</p>
                                            </div>
                                            <div className={styles.cardLine}>
                                                <p className={styles.key}>Username:</p>
                                                <p className={styles.value}>{i.victim.username}</p>
                                            </div>
                                            <div className={styles.cardLine}>
                                                <p className={styles.key}>Status:</p>
                                                <p className={styles.value}>{i.victim.isActive ? "Active" : "Banned"}</p>
                                            </div>
                                        </HoverCardContent>
                                    </HoverCard>
                                    <p className={styles.newValue}>
                                        {`to ${newValueToString(i.action_type, i.new_value)}`}
                                    </p>
                                </div>)
                            }
                        )
                    }
                    <div ref={elementRef}/>
                </ScrollArea>
            </div>
        </section>
    );
};

export default AdminHistory;
