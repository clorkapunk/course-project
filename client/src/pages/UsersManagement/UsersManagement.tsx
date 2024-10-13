import {Checkbox} from "@/components/ui/checkbox.tsx";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {Button} from "@/components/ui/button.tsx";
import {
    useGetUsersQuery,
    useUpdateUsersRoleMutation,
    useUpdateUsersStatusMutation
} from "@/features/users/usersApiSlice.ts";
import {useTranslation} from "react-i18next";
import Roles from "@/utils/roles.ts";
import {useEffect, useRef, useState} from "react";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub,
    DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import toast from "react-hot-toast";
import {ApiErrorResponse, UserData} from "@/types";
import {Input} from "@/components/ui/input.tsx";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel, SelectSeparator,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select.tsx";
import useLocalStorage from "@/hooks/useLocalStorage.ts";
import {CaretSortIcon} from "@radix-ui/react-icons";
import styles from './UsersManagement.module.scss'
import {FaChevronDown, FaChevronLeft, FaChevronRight} from "react-icons/fa6";




export function getRoleName(value: number) {
    return Object.keys(Roles).find(key => Roles[key] === value);
}

const UsersManagement = () => {
    const [updateUsersStatus] = useUpdateUsersStatusMutation()
    const [updateUsersRole] = useUpdateUsersRoleMutation()
    const {t} = useTranslation()

    const [selectedRows, setSelectedRows] = useState<number[]>([])

    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const [searchField, setSearchField] = useLocalStorage<string>('searchBy', 'email')
    const [searchString, setSearchString] = useLocalStorage<string>('search', '')
    const [page, setPage] = useLocalStorage<number>('page', 1)
    const [limit, setLimit] = useLocalStorage<number>('limit', 10)
    const [sort, setSort] = useLocalStorage<string>("sort", 'desc')
    const [orderField, setOrderField] = useLocalStorage<string>("orderBy", 'id')

    const {data, refetch} = useGetUsersQuery({
        page,
        limit,
        sort,
        orderBy: orderField,
        searchBy: searchField,
        search: searchString
    })

    const handleRoleChange = async (role: number) => {
        try {
            const ids = selectedRows
            if (ids.length === 0) {
                toast.error("No users selected")
                return;
            }

            await toast.promise(
                updateUsersRole({ids, role}).unwrap(),
                {
                    loading: 'Saving...',
                    success: <>Users roles successfully updated!</>,
                    error: <>Error when updating users role</>,
                }
            )
            refetch()
        } catch (err) {
            const error = err as ApiErrorResponse
            if (!error?.data) {
                toast.error(t("no-server-response"))
            } else if (error?.status === 400) {
                toast.error(t('invalid-entry'))
            } else if (error?.status === 401) {
                toast.error("Unauthorized")
            } else {
                toast.error("Unexpected end")
            }
        }
    }

    const handleStatusChange = async (status: boolean) => {
        try {
            const ids = selectedRows

            if (ids.length === 0) {
                toast.error("No users selected")
                return;
            }

            await toast.promise(
                updateUsersStatus({ids, status}).unwrap(),
                {
                    loading: 'Saving...',
                    success: <>Users status successfully updated!</>,
                    error: <>Error when updating users status</>,
                }
            )

            refetch()
        } catch (err) {
            const error = err as ApiErrorResponse
            if (!error?.data) {
                toast.error(t("no-server-response"))
            } else if (error?.status === 204) {

            } else if (error?.status === 400) {
                toast.error(t('invalid-data'))
            } else if (error?.status === 401) {
                toast.error("Unauthorized")
            } else {
                toast.error("Unexpected end")
            }
        }
    }

    useEffect(() => {
        setSelectedRows([])
        refetch()
    }, [page, limit, sort, orderField, searchField]);

    useEffect(() => {
        searchTimeoutRef.current && clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => {
            console.log('fetch')
            refetch()
        }, 2000)

        return () => {
            searchTimeoutRef.current && clearTimeout(searchTimeoutRef.current);
        }
    }, [searchString]);


    return (
        <section className={styles.page}>

            <div className={styles.container}>
                <div className={styles.topContainer}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                className={styles.actionButton}
                                variant="outline"
                            >
                                {t("actions")}
                                <FaChevronDown/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className={`bg-zinc-800 border-zinc-600 text-zinc-100`}
                            align={'start'}
                        >
                            <DropdownMenuLabel className={''}>{t('edit-users-details')}</DropdownMenuLabel>
                            <DropdownMenuSeparator className={'bg-zinc-600'}/>
                            <DropdownMenuGroup>
                                <DropdownMenuItem className={'text-zinc-200 focus:bg-zinc-600 focus:text-zinc-100'} onClick={() => handleStatusChange(true)}>
                                    {t('activate')}
                                </DropdownMenuItem>
                                <DropdownMenuItem className={'text-zinc-200 focus:bg-zinc-600 focus:text-zinc-100'} onClick={() => handleStatusChange(false)}>
                                    {t('ban')}
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator className={'bg-zinc-600'}/>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className={'text-zinc-200 data-[state=open]:bg-zinc-600 focus:bg-zinc-600 focus:text-zinc-100'}>
                                    {t('update-role')}
                                </DropdownMenuSubTrigger>
                                <DropdownMenuPortal >
                                    <DropdownMenuSubContent className={'border-zinc-600 bg-zinc-800 text-zinc-100'}>
                                        {
                                            Object.keys(Roles).map((role) => (
                                                <DropdownMenuItem
                                                    className={'text-zinc-200 focus:bg-zinc-600 focus:text-zinc-100'}
                                                    key={role}
                                                    onClick={() => handleRoleChange(Roles[role])}
                                                >
                                                    {role}
                                                </DropdownMenuItem>
                                            ))
                                        }
                                    </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                            </DropdownMenuSub>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <div className={styles.searchContainer}>
                        <Select value={searchField} onValueChange={(value) => setSearchField(value)}>
                            <SelectTrigger className={`${styles.select} w-[180px] border-none bg-zinc-800 text-zinc-100 hover:bg-zinc-600`}>
                                <SelectValue/>
                            </SelectTrigger>
                            <SelectContent className={'bg-zinc-800 border-zinc-600 text-zinc-100 '}>
                                <SelectGroup >
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
                            className={styles.input}
                            type={'text'}
                            value={searchString}
                            onChange={(e) => setSearchString(e.target.value)}
                            placeholder={t(`search-by-${searchField}`)}
                        />
                    </div>
                </div>

                <div className={styles.tableContainer}>
                    <Table>
                        <TableHeader>
                            <TableRow className={styles.tableRow}>
                                <TableHead className={`${styles.tableHead}`}>
                                    <Checkbox
                                        className={styles.checkbox}
                                        checked={
                                            selectedRows.length === data?.data?.length && data?.data?.length !== 0 ||
                                            (selectedRows.length > 0 && "indeterminate")
                                        }
                                        onCheckedChange={(value) => {
                                            if (!data?.data) return
                                            if (value) setSelectedRows(data?.data.map((user: UserData) => user.id))
                                            else setSelectedRows([])
                                        }}
                                        aria-label="Select all"
                                    />
                                </TableHead>
                                <TableHead className={styles.tableHead}>
                                    <Button
                                        className={styles.button}
                                        variant="ghost"
                                        onClick={() => {
                                            setOrderField('username')
                                            setSort(prev => {
                                                return prev === 'asc' ? "desc" : 'asc'
                                            })
                                        }}
                                    >
                                        {t('username')}
                                        <CaretSortIcon className="ml-2 h-4 w-4"/>
                                    </Button>
                                </TableHead>
                                <TableHead className={styles.tableHead}>
                                    <Button
                                        className={styles.button}
                                        variant="ghost"
                                        onClick={() => {
                                            setOrderField('email')
                                            setSort(prev => {
                                                return prev === 'asc' ? "desc" : 'asc'
                                            })
                                        }}
                                    >
                                        {t('email')}
                                        <CaretSortIcon className="ml-2 h-4 w-4"/>
                                    </Button>
                                </TableHead>
                                <TableHead className={styles.tableHead}>
                                    <Button
                                        className={styles.button}
                                        variant="ghost"
                                        onClick={() => {
                                            setOrderField('role')
                                            setSort(prev => {
                                                return prev === 'asc' ? "desc" : 'asc'
                                            })
                                        }}
                                    >
                                        {t('role')}
                                        <CaretSortIcon className="ml-2 h-4 w-4"/>
                                    </Button>
                                </TableHead>
                                <TableHead className={styles.tableHead}>
                                    <Button
                                        className={styles.button}
                                        variant="ghost"
                                        onClick={() => {
                                            setOrderField('isActive')
                                            setSort(prev => {
                                                return prev === 'asc' ? "desc" : 'asc'
                                            })
                                        }}
                                    >
                                        {t('status')}
                                        <CaretSortIcon className="ml-2 h-4 w-4"/>
                                    </Button>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data?.data?.length ? (
                                data.data.map((user: UserData) => (
                                    <TableRow
                                        className={styles.tableRow}
                                        key={user.id}
                                        data-state={selectedRows.find(email => email === user.id) && "selected"}
                                    >
                                        <TableCell className={styles.tableCell}>
                                            <Checkbox
                                                className={styles.checkbox}
                                                checked={!!selectedRows.find(email => email === user.id)}
                                                onCheckedChange={(value) => {
                                                    if (value) setSelectedRows(prev => ([...prev, user.id]))
                                                    else setSelectedRows(prev => (prev.filter(email => email !== user.id)))
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell className={styles.tableCell}>
                                            {user.username}
                                        </TableCell>
                                        <TableCell className={styles.tableCell}>
                                            {user.email}
                                        </TableCell>
                                        <TableCell className={styles.tableCell}>
                                            {getRoleName(user.role)}
                                        </TableCell>
                                        <TableCell className={styles.tableCell}>
                                            {user.isActive ? "Active" : "Banned"}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow className={styles.tableRow}>
                                    <TableCell
                                        colSpan={5}
                                        className={`${styles.tableCell} text-center py-10`}
                                    >
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className={styles.paginationContainer}>
                    <Select
                        value={limit.toString()}
                        onValueChange={(value) => {
                            setPage(1)
                            setLimit(parseInt(value))
                        }}
                    >
                        <SelectTrigger className={'w-[130px] border-none bg-zinc-800 text-zinc-100 hover:bg-zinc-600 '}>
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent className={'bg-zinc-800 border-zinc-600 text-zinc-100'}>
                            <SelectGroup>
                                <SelectLabel>{t("page-size")}</SelectLabel>
                                <SelectSeparator className={'bg-zinc-600'}/>
                                <SelectItem className={'text-zinc-200 focus:bg-zinc-600 focus:text-zinc-100'}
                                            value="10" defaultChecked>10 per page</SelectItem>
                                <SelectItem className={'text-zinc-200 focus:bg-zinc-600 focus:text-zinc-100'}
                                            value="20" defaultChecked>20 per page</SelectItem>
                                <SelectItem className={'text-zinc-200 focus:bg-zinc-600 focus:text-zinc-100'}
                                            value="30" defaultChecked>30 per page</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    <div className={'flex'}>
                        <div
                            className={styles.pageInfo}
                        >
                            <p>
                                {`${((data?.page - 1) * data?.limit) + 1} - ${data?.page === data?.pages ? data?.total : data?.page * data?.limit} of ${data?.total}`}
                            </p>
                        </div>

                        <Button
                            className={styles.prevButton}
                            variant="outline"
                            size={'icon'}
                            onClick={() => {
                                if (data?.page === 1) return;
                                setPage(data?.page - 1)
                            }}
                            disabled={data?.page === 1}
                        >
                            <FaChevronLeft/>
                        </Button>
                        <Button
                            className={styles.nextButton}
                            variant="outline"
                            size={'icon'}
                            onClick={() => {
                                if (data?.pages === data?.page) return;
                                setPage(data?.page + 1)
                            }}
                            disabled={data?.pages === data?.page}
                        >
                            <FaChevronRight/>
                        </Button>
                    </div>

                </div>
            </div>

        </section>
    )
};

export default UsersManagement;
