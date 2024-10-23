import {Button} from "@/components/ui/button.tsx";
import {
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

    const [fetchUsers, {data, isLoading,}] = useLazyGetUsersQuery()
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
            fetchUsers({
                ...tableParams
            })

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
            fetchUsers({
                ...tableParams
            })

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
                        className={styles.actionButton}
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
                    <DropdownMenuSeparator />
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
                    <DropdownMenuSeparator />
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
                isLoading={isLoading}
            />
        </section>
    )
};

export default UsersManagement;


