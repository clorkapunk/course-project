import {Button} from "@/components/ui/button.tsx";
import {
    useGetUsersQuery,
    useUpdateUsersRoleMutation,
    useUpdateUsersStatusMutation
} from "@/features/users/usersApiSlice.ts";
import {useTranslation} from "react-i18next";
import Roles from "@/utils/roles.ts";
import {useEffect, useState} from "react";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub,
    DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import toast from "react-hot-toast";
import {ApiErrorResponse, UserData} from "@/types";
import styles from './UsersManagement.module.scss'
import {FaChevronDown} from "react-icons/fa6";
import SortableTable from "@/components/SortableTable/SortableTable.tsx";
import SelectableSearch from "@/components/SelectableSearch/SelectableSearch.tsx";


export function getRoleName(value: number) {
    return Object.keys(Roles).find(key => Roles[key] === value);
}

const UsersManagement = () => {
    const [updateUsersStatus] = useUpdateUsersStatusMutation()
    const [updateUsersRole] = useUpdateUsersRoleMutation()
    const {t} = useTranslation()

    const [selectedRows, setSelectedRows] = useState<number[]>([])
    const [searchField, setSearchField] = useState<string>('email')
    const [searchString, setSearchString] = useState<string>('')
    const [page, setPage] = useState<number>(1)
    const [limit, setLimit] = useState<number>(10)
    const [sort, setSort] = useState<string>('desc')
    const [orderField, setOrderField] = useState<string>('id')

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
        const timer = setTimeout(() => {
            refetch()
        }, 500);

        return () => {
            clearTimeout(timer);
        };
    }, [searchString]);


    const handleChangeSort = (field: string) => {
        setOrderField(field)
        setSort(prev => {
            return prev === 'asc' ? "desc" : 'asc'
        })
    }

    const tableHeader = () => {
        return (<div className={styles.topContainer}>
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
                            <DropdownMenuItem className={'text-zinc-200 focus:bg-zinc-600 focus:text-zinc-100'}
                                              onClick={() => handleStatusChange(true)}>
                                {t('activate')}
                            </DropdownMenuItem>
                            <DropdownMenuItem className={'text-zinc-200 focus:bg-zinc-600 focus:text-zinc-100'}
                                              onClick={() => handleStatusChange(false)}>
                                {t('ban')}
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator className={'bg-zinc-600'}/>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger
                                className={'text-zinc-200 data-[state=open]:bg-zinc-600 focus:bg-zinc-600 focus:text-zinc-100'}>
                                {t('update-role')}
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
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
                <SelectableSearch
                    setSearchField={setSearchField}
                    searchField={searchField}
                    searchString={searchString}
                    setSearchString={setSearchString}
                    fields={[
                        {label: t('email'), value: 'email'},
                        {label: t('username'), value: 'username'},
                    ]}
                />
            </div>)
    }


    return (
        <section className={styles.page}>
            <SortableTable
                header={tableHeader()}
                fields={[
                    {
                        type: "select",
                        name: "select",
                        checked: selectedRows.length === data?.data?.length && data?.data?.length !== 0,
                        partiallyChecked: selectedRows.length > 0,
                        onCheckedChange: (value) => {
                            if (!data?.data) return
                            if (value) setSelectedRows(data?.data.map((user: UserData) => user.id))
                            else setSelectedRows([])
                        },
                    },
                    {
                        type: 'button',
                        name: "username",
                        onClick: () => handleChangeSort("username"),
                        text: t('username')
                    },
                    {
                        type: 'button',
                        name: "email",
                        onClick: () => handleChangeSort("email"),
                        text: t('email')
                    },
                    {
                        type: 'button',
                        name: "role",
                        onClick: () => handleChangeSort("role"),
                        text: t('role')
                    },
                    {
                        type: 'button',
                        name: "status",
                        onClick: () => handleChangeSort("isActive"),
                        text: t('status')
                    }
                ]}
                data={data?.data ? data?.data?.map(item => ({
                    id: item.id,
                    username: item.username,
                    email: item.email,
                    role: getRoleName(item.role),
                    status: item.isActive ? "Active" : "Banned",
                    dataState: !!selectedRows.find(id => id === item.id),
                    onCheckedChange: (value) => {
                        if (value) setSelectedRows(prev => ([...prev, item.id]))
                        else setSelectedRows(prev => (prev.filter(email => email !== item.id)))
                    },
                    checked: !!selectedRows.find(id => id === item.id)
                })) : []}
                pagination={{
                    enabled: true,
                    limit: data?.limit || 10,
                    page: data?.page || 1,
                    pages: data?.pages || 1,
                    total: data?.total || 0,
                    setLimit,
                    setPage
                }}
            />
        </section>
    )
};

export default UsersManagement;


