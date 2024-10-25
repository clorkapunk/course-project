import {Button} from "@/components/ui/button.tsx";
import {
    useDeleteUsersMutation,
    useLazyGetUsersQuery,
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
import {UserData} from "@/types";
import styles from './AdminUsers.module.scss'
import {FaChevronDown} from "react-icons/fa6";
import SortableTable from "@/components/SortableTable/SortableTable.tsx";
import SelectableSearch from "@/components/SelectableSearch/SelectableSearch.tsx";
import catchApiErrors from "@/utils/catch-api-errors.ts";


export function getRoleName(value: number) {
    return Object.keys(Roles).find(key => Roles[key] === value);
}

const AdminUsers = () => {
    const [updateUsersStatus] = useUpdateUsersStatusMutation()
    const [updateUsersRole] = useUpdateUsersRoleMutation()
    const [deleteUsers] = useDeleteUsersMutation()
    const {t} = useTranslation()

    const [fetchUsers, {data, isFetching,}] = useLazyGetUsersQuery()
    const [selectedRows, setSelectedRows] = useState<number[]>([])
    const [tableParams, setTableParams] = useState({
        page: 1,
        limit: 10,
        sort: 'desc',
        orderBy: 'id',
        searchBy: 'email',
        search: ''
    })

    const handleRoleChange = async (role: number) => {
        try {
            const ids = selectedRows
            if (ids.length === 0) {
                toast.error(t('no-selected-rows'))
                return;
            }

            await toast.promise(
                updateUsersRole({ids, role}).unwrap(),
                {
                    loading: `${t('saving')}...`,
                    success: <>{t('action-successfully-completed')}</>,
                    error: <>{t("error-occurred")}</>,
                }
            )
            fetchUsers({
                ...tableParams
            })

        } catch (err) {
            catchApiErrors(err, t)
        }
    }

    const handleStatusChange = async (status: boolean) => {
        try {
            const ids = selectedRows

            if (ids.length === 0) {
                toast.error(t('no-selected-rows'))
                return;
            }

            await toast.promise(
                updateUsersStatus({ids, status}).unwrap(),
                {
                    loading: `${t('saving')}...`,
                    success: <>{t('action-successfully-completed')}</>,
                    error: <>{t("error-occurred")}</>,
                }
            )
            fetchUsers({
                ...tableParams
            })

        } catch (err) {
            catchApiErrors(err, t)
        }
    }

    const handleDeleteUsers = async () => {
        try {
            const ids = selectedRows
            if (ids.length === 0) {
                toast.error(t('no-selected-rows'))
                return;
            }

            await toast.promise(
                deleteUsers({ids}).unwrap().then(() => {
                    fetchUsers({
                        ...tableParams
                    })
                }),
                {
                    loading: `${t('saving')}...`,
                    success: <>{t('action-successfully-completed')}</>,
                    error: <>{t("error-occurred")}</>,
                }
            )
        } catch (err) {
            catchApiErrors(err, t)
        }
    }

    const handleChangeSort = (field: string) => {
        setTableParams(prev => {
            if (prev.orderBy === field) {
                return {
                    ...prev,
                    sort: prev.sort === 'asc' ? 'desc' : 'asc'
                }
            }

            return {
                ...prev,
                orderBy: field,
                sort: prev.sort === 'asc' ? 'desc' : 'asc'
            }
        })
    }

    useEffect(() => {
        console.log(tableParams)
    }, [tableParams])

    useEffect(() => {
        fetchUsers({
            ...tableParams
        })
    }, [tableParams.page, tableParams.limit, tableParams.orderBy, tableParams.sort, tableParams.searchBy]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers({
                ...tableParams
            })
        }, 500);

        return () => {
            clearTimeout(timer);
        };
    }, [tableParams.search]);

    const tableHeader = () => {
        return (<div className={styles.topContainer}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        className={`${styles.actionButton}`}
                        variant="secondary"
                    >
                        {t("actions")}
                        <FaChevronDown/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align={'start'}
                    className={'bg-primary-foreground'}
                >
                    <DropdownMenuLabel className={''}>{t('edit-users-details')}</DropdownMenuLabel>
                    <DropdownMenuSeparator/>
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            onClick={() => handleStatusChange(true)}>
                            {t('activate')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => handleStatusChange(false)}>
                            {t('ban')}
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator/>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger
                        >
                            {t('update-role')}
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent className={'bg-primary-foreground'}>
                                {
                                    Object.keys(Roles).map((role) => (
                                        <DropdownMenuItem

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
                    <DropdownMenuSeparator/>
                    <DropdownMenuItem
                        onClick={() => handleDeleteUsers()}>
                        {t('delete')}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <SelectableSearch
                setSearchBy={(searchBy: string) => setTableParams(prev => ({...prev, searchBy}))}
                searchBy={tableParams.searchBy}
                setSearch={(search: string) => setTableParams(prev => ({...prev, search}))}
                search={tableParams.search}
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
                    limit: data?.limit || 10,
                    page: data?.page || 1,
                    pages: data?.pages || 1,
                    total: data?.total || 0,
                    setPage: (page: number) => {
                        setTableParams(prev => ({
                            ...prev,
                            page,
                        }))
                    },
                    setLimit: (limit: number) => {
                        setTableParams(prev => ({
                            ...prev,
                            limit,
                        }))
                    }
                }}
                isFetching={isFetching}
            />
        </section>
    )
};

export default AdminUsers;


