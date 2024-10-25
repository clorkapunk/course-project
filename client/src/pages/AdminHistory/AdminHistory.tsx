import styles from './AdminHistory.module.scss'
import {useGetHistoryQuery} from "@/features/users/usersApiSlice.ts";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card.tsx";
import HistoryActionTypes from "@/utils/admin-history-action-types.ts";
import {getRoleName} from "@/pages/AdminUsers/AdminUsers.tsx";
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
import moment from 'moment'
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Button} from "@/components/ui/button.tsx";
import {ru, enUS} from 'date-fns/locale';
import {CalendarIcon} from "@radix-ui/react-icons";
import {Calendar} from "@/components/ui/calendar.tsx";

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
    const elementRef = useRef(null)
    const {t, i18n} = useTranslation()
    const [initiatorField, setInitiatorField] = useState('email')
    const [victimField, setVictimField] = useState('email')
    const [victimSearch, setVictimSearch] = useState('')
    const [initiatorSearch, setInitiatorSearch] = useState('')
    const [fromDate, setFromDate] = useState<Date>(new Date('2024-01-01'))
    const [toDate, setToDate] = useState<Date>(new Date())

    const {data, isLoading} = useGetHistoryQuery({
        page,
        aSearchField: initiatorField,
        aSearch: initiatorSearch,
        uSearchField: victimField,
        uSearch: victimSearch,
        from: moment(fromDate).format('YYYY-MM-DD'),
        to: moment(toDate).format('YYYY-MM-DD')
    })

    const handleObserver = useCallback((entries: any) => {
        if (entries[0].isIntersecting) {
            if (isLoading || !data) return;
            if (data?.pages > data?.page) {
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
            <div className={styles.optionsContainer}>
                <div className={styles.searchContainer}>
                    <Select value={initiatorField} onValueChange={(value) => {
                        setInitiatorField(value)
                        setPage(1)
                    }}>
                        <SelectTrigger
                            className={`${styles.select} w-full border-none bg-zinc-800 text-zinc-100 hover:bg-zinc-600`}>
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent className={'bg-zinc-800 border-zinc-600 text-zinc-100 '}>
                            <SelectGroup>
                                <SelectLabel>{t("search-admin-by")}</SelectLabel>
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
                        placeholder={t(`search-by-admin-${initiatorField}`)}
                        className={styles.input}
                        type={'text'}
                        value={initiatorSearch}
                        onChange={(e) => {
                            setInitiatorSearch(e.target.value)
                            setPage(1)
                        }}
                    />
                </div>
                <div className={styles.searchContainer}>
                    <Select value={victimField} onValueChange={(value) => {
                        setVictimField(value)
                        setPage(1)
                    }}>
                        <SelectTrigger
                            className={`${styles.select} w-full border-none bg-zinc-800 text-zinc-100 hover:bg-zinc-600`}>
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent className={'bg-zinc-800 border-zinc-600 text-zinc-100 '}>
                            <SelectGroup>
                                <SelectLabel>{t("search-user-by")}</SelectLabel>
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
                        placeholder={t(`search-by-user-${victimField}`)}
                        className={styles.input}
                        type={'text'}
                        value={victimSearch}
                        onChange={(e) => {
                            setVictimSearch(e.target.value)
                            setPage(1)
                        }}
                    />
                </div>
                <div className={styles.dateContainer}>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                className={styles.button}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4"/>
                                {fromDate.toLocaleDateString(i18n.language, {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric"
                                })}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            className={`p-0 w-auto border-zinc-600 overflow-hidden`}
                            align="start"
                        >
                            <Calendar
                                locale={(() => {
                                    switch(i18n.language){
                                        case "ru":
                                            return ru;
                                        case 'en':
                                            return enUS;
                                        default:
                                            return enUS;
                                    }
                                })()}
                                mode="single"
                                selected={fromDate}
                                onSelect={(value) => {
                                    if (!value) return;
                                    if (value > toDate) setToDate(value)
                                    setFromDate(value)
                                    setPage(1)
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <p className={styles.dash}>-</p>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                className={styles.button}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4"/>
                                {/*{format(toDate, "PPP")}*/}
                                {toDate.toLocaleDateString(i18n.language, {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric"
                                })}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                locale={(() => {
                                    switch(i18n.language){
                                        case "ru":
                                            return ru;
                                        case 'en':
                                            return enUS;
                                        default:
                                            return enUS;
                                    }
                                })()}
                                fromDate={fromDate}
                                mode="single"
                                selected={toDate}
                                onSelect={(value) => {
                                    if (!value) return;
                                    setToDate(value)
                                    setPage(1)
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            <div className={styles.container}>
                {
                    data?.data && data?.data?.length > 0 ?
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
                                                        <p className={styles.key}>{t('email')}:</p>
                                                        <p className={styles.value}>{i.initiator.email}</p>
                                                    </div>
                                                    <div className={styles.cardLine}>
                                                        <p className={styles.key}>{t('role')}:</p>
                                                        <p className={styles.value}>{getRoleName(i.initiator.role)}</p>
                                                    </div>
                                                    <div className={styles.cardLine}>
                                                        <p className={styles.key}>{t('username')}:</p>
                                                        <p className={styles.value}>{i.initiator.username}</p>
                                                    </div>
                                                    <div className={styles.cardLine}>
                                                        <p className={styles.key}>{t('status')}:</p>
                                                        <p className={styles.value}>{i.initiator.isActive ? "Active" : "Banned"}</p>
                                                    </div>
                                                </HoverCardContent>
                                            </HoverCard>
                                            <p className={styles.action}>
                                                {t(`updated-${actionTypeToString(i.action_type)}-of`)}
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
                                                        <p className={styles.key}>{t('email')}:</p>
                                                        <p className={styles.value}>{i.victim.email}</p>
                                                    </div>
                                                    <div className={styles.cardLine}>
                                                        <p className={styles.key}>{t('role')}:</p>
                                                        <p className={styles.value}>{getRoleName(i.victim.role)}</p>
                                                    </div>
                                                    <div className={styles.cardLine}>
                                                        <p className={styles.key}>{t('username')}:</p>
                                                        <p className={styles.value}>{i.victim.username}</p>
                                                    </div>
                                                    <div className={styles.cardLine}>
                                                        <p className={styles.key}>{t('status')}:</p>
                                                        <p className={styles.value}>{i.victim.isActive ? "Active" : "Banned"}</p>
                                                    </div>
                                                </HoverCardContent>
                                            </HoverCard>
                                            <p className={styles.newValue}>
                                                {`${t('to')} ${newValueToString(i.action_type, i.new_value)}`}
                                            </p>
                                        </div>)
                                    }
                                )
                            }
                            <div ref={elementRef}/>
                        </ScrollArea>
                        :
                        <p className={'text-center py-5'}>
                            {t('no-result')}
                        </p>
                }

            </div>
        </section>
    );
};

export default AdminHistory;
