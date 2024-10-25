import {useEffect, useState} from "react";
import {useDeleteFormsMutation, useLazyGetFormsQuery} from "@/features/forms/formsApiSlice.ts";
import {Button} from "@/components/ui/button.tsx";
import {FaTrash} from "react-icons/fa6";
import SelectableSearch from "@/components/SelectableSearch/SelectableSearch.tsx";
import styles from "@/pages/AdminUsers/AdminUsers.module.scss";
import SortableTable from "@/components/SortableTable/SortableTable.tsx";
import {TableFormData} from "@/types";
import {Link} from "react-router-dom";
import {EDIT_FORM_ROUTE, EDIT_TEMPLATE_ROUTE} from "@/utils/routes.ts";
import toast from "react-hot-toast";
import catchApiErrors from "@/utils/catch-api-errors.ts";
import {useTranslation} from "react-i18next";

const AdminForms = () => {
    const {t} = useTranslation()
    const [fetchForms, {data, isFetching,}] = useLazyGetFormsQuery()
    const [deleteForms] = useDeleteFormsMutation()
    const [selectedRows, setSelectedRows] = useState<number[]>([])
    const [tableParams, setTableParams] = useState({
        page: 1,
        limit: 10,
        sort: 'desc',
        orderBy: 'createdAt',
        searchBy: 'title',
        search: ''
    })

    const refetchForms = () => {
        fetchForms({
            ...tableParams
        })
    }

    const handleDeleteForms = async () => {
        try {
            const ids = selectedRows
            if (ids.length === 0) {
                toast.error(t('no-selected-rows'))
                return;
            }

            await toast.promise(
                deleteForms({ ids}).unwrap(),
                {
                    loading: `${t('saving')}...`,
                    success: <>{t('action-successfully-completed')}</>,
                    error: <>{t("error-occurred")}</>,
                }
            )
            refetchForms()
            setSelectedRows([])
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

    const tableHeader = ({handleDelete, setSearchBy, searchBy, search, setSearch, fields}:
                             {
                                 handleDelete: () => void;
                                 setSearchBy: (value: string) => void;
                                 setSearch: (value: string) => void;
                                 searchBy: string;
                                 search: string;
                                 fields: { label: string; value: string }[]
                             }) => {
        return (<div className={'flex justify-between gap-2'}>
            <Button
                className={'flex-shrink-0'}
                variant={'secondary'}
                size={'icon'}
                onClick={handleDelete}
            >
                <FaTrash/>
            </Button>
            <SelectableSearch
                setSearchBy={setSearchBy}
                searchBy={searchBy}
                setSearch={setSearch}
                search={search}
                fields={fields}
            />
        </div>)
    }

    useEffect(() => {
        refetchForms()
    }, [tableParams.page, tableParams.limit, tableParams.orderBy, tableParams.sort, tableParams.searchBy]);

    useEffect(() => {
        const timer = setTimeout(() => {
            refetchForms()
        }, 500);

        return () => {
            clearTimeout(timer);
        };
    }, [tableParams.search]);


    return (
        <section className={styles.page}>
            <SortableTable
                header={tableHeader({
                    setSearchBy: (searchBy: string) => setTableParams(prev => ({...prev, searchBy})),
                    searchBy: tableParams.searchBy,
                    setSearch: (search: string) => setTableParams(prev => ({...prev, search})),
                    search: tableParams.search,
                    handleDelete: handleDeleteForms,
                    fields: [
                        {label: t('title'), value: 'title'},
                        {label: t('email'), value: 'email'},
                        {label: t('username'), value: 'username'},
                    ]
                })}
                fields={[
                    {
                        type: "select",
                        name: "select",
                        checked: selectedRows.length === data?.data?.length && data?.data?.length !== 0,
                        partiallyChecked: selectedRows.length > 0,
                        onCheckedChange: (value) => {
                            if (!data?.data) return
                            if (value) setSelectedRows(data?.data.map((template: TableFormData) => template.id))
                            else setSelectedRows([])
                        },
                    },
                    {
                        type: 'button',
                        name: "title",
                        onClick: () => handleChangeSort("title"),
                        cellComponent: (item: TableFormData) => <Link className={'hover:underline'}
                                                                     to={EDIT_TEMPLATE_ROUTE + `/${item.template.id}`}>
                            {item['template']['title']}
                        </Link>,
                        text: t('title')
                    },
                    {
                        type: 'button',
                        onClick: () => handleChangeSort("email"),
                        name: 'userEmail',
                        text: t('email')
                    },
                    {
                        type: 'button',
                        onClick: () => handleChangeSort("username"),
                        name: 'userUsername',
                        text: t('username')
                    },
                    {
                        type: 'button',
                        onClick: () => handleChangeSort("createdAt"),
                        name: 'createdAt',
                        text: t('filled-at')
                    },
                    {
                        type: 'default',
                        name: 'edit',
                        cellComponent: (item: TableFormData) => {
                            return <Link to={EDIT_FORM_ROUTE + `/${item.id}`} className={'underline'}>
                                View
                            </Link>
                        },
                        text: ''
                    }
                ]}
                data={data?.data ? data?.data?.map(item => ({
                    ...item,
                    id: item.id,
                    userUsername: item.user.username,
                    userEmail: item.user.email,
                    createdAt: new Date(item.createdAt).toLocaleString(),
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
    );
};

export default AdminForms;
