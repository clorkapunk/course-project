import styles from "@/pages/AdminUsers/AdminUsers.module.scss";
import SortableTable from "@/components/SortableTable/SortableTable.tsx";
import {TableFormData, TemplateData} from "@/types";
import {useTranslation} from "react-i18next";
import {useEffect, useState} from "react";
import toast from "react-hot-toast";
import catchApiErrors from "@/utils/catch-api-errors.ts";
import {Button} from "@/components/ui/button.tsx";
import {FaTrash} from "react-icons/fa6";
import SelectableSearch from "@/components/SelectableSearch/SelectableSearch.tsx";
import {useDeleteTemplatesMutation, useLazyGetTemplatesQuery} from "@/features/templates/templatesApiSlice.ts";
import {Link} from "react-router-dom";
import {EDIT_FORM_ROUTE, EDIT_TEMPLATE_ROUTE} from "@/utils/routes.ts";
import {useLazyGetTemplateFormsQuery} from "@/features/forms/formsApiSlice.ts";

const AdminTemplates = () => {

    const {t} = useTranslation()

    const [fetchTemplates, {data, isFetching,}] = useLazyGetTemplatesQuery()
    const [deleteTemplates] = useDeleteTemplatesMutation()
    const [selectedRows, setSelectedRows] = useState<number[]>([])
    const [tableParams, setTableParams] = useState({
        page: 1,
        limit: 10,
        sort: 'desc',
        orderBy: 'createdAt',
        searchBy: 'title',
        search: ''
    })
    const [fetchForms, {data: templateForms, isFetching: isTemplateFormsFetching}] = useLazyGetTemplateFormsQuery()

    const [nestedTableParams, setNestedTableParams] = useState({
        templateId: 0,
        page: 1,
        limit: 10,
        sort: 'desc',
        orderBy: 'createdAt',
        searchBy: 'title',
        search: ''
    })

    const refetchTemplates = () => {
        fetchTemplates({
            ...tableParams
        })
    }

    const refetchForms = () => {
        console.log(nestedTableParams)
        fetchForms({
            ...nestedTableParams
        })
    }

    const handleDeleteTemplates = async () => {
        try {
            const ids = selectedRows
            if (ids.length === 0) {
                toast.error(t('no-selected-rows'))
                return;
            }

            await toast.promise(
                deleteTemplates({templatesIds: ids}).unwrap(),
                {
                    loading: `${t('saving')}...`,
                    success: <>{t('action-successfully-completed')}</>,
                    error: <>{t("error-occurred")}</>,
                }
            )
            refetchTemplates()
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

    const handleChangeNestedState = (id: number) => {
        setNestedTableParams({
            page: 1,
            limit: 10,
            sort: 'desc',
            orderBy: 'createdAt',
            searchBy: 'title',
            search: '',
            templateId: id,
        })
    }

    const handleChangeNestedSort = (field: string) => {
        setNestedTableParams(prev => {
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
        refetchTemplates()
    }, [tableParams.page, tableParams.limit, tableParams.orderBy, tableParams.sort, tableParams.searchBy]);

    useEffect(() => {
        const timer = setTimeout(() => {
            refetchTemplates()
        }, 500);

        return () => {
            clearTimeout(timer);
        };
    }, [tableParams.search]);

    useEffect(() => {
        refetchForms()
    }, [nestedTableParams.page, nestedTableParams.limit, nestedTableParams.orderBy, nestedTableParams.sort, nestedTableParams.searchBy, nestedTableParams.templateId]);

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


    return (
        <section className={styles.page}>
            <SortableTable
                header={tableHeader({
                    setSearchBy: (searchBy: string) => setTableParams(prev => ({...prev, searchBy})),
                    searchBy: tableParams.searchBy,
                    setSearch: (search: string) => setTableParams(prev => ({...prev, search})),
                    search: tableParams.search,
                    handleDelete: handleDeleteTemplates,
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
                            if (value) setSelectedRows(data?.data.map((template: TemplateData) => template.id))
                            else setSelectedRows([])
                        },
                    },
                    {
                        type: 'button',
                        name: "title",
                        onClick: () => handleChangeSort("title"),
                        cellComponent: (item: TemplateData) => <Link className={'hover:underline'}
                                                                     to={EDIT_TEMPLATE_ROUTE + `/${item.id}`}>
                            {item['title']}
                        </Link>,
                        text: t('title')
                    },
                    {
                        type: 'button',
                        onClick: () => handleChangeSort("title"),
                        name: 'userEmail',
                        text: t('author')
                    },
                    {
                        type: 'button',
                        onClick: () => handleChangeSort("title"),
                        name: 'userUsername',
                        text: t('author')
                    },
                    {
                        type: 'button',
                        onClick: () => handleChangeSort("title"),
                        name: 'createdAt',
                        text: t('published-at')
                    },
                    {
                        type: 'default',
                        name: 'mode',
                        text: t('mode')
                    },
                    {
                        type: 'default',
                        name: 'formsCount',
                        text: t('forms')
                    }
                ]}
                data={data?.data ? data?.data?.map(item => ({
                    ...item,
                    id: item.id,
                    title: item.title,
                    userEmail: item.user.email,
                    userUsername: item.user.username,
                    mode: t(item.mode),
                    formsCount: item?._count?.form || 0,
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
                nestedTableProps={{
                    fields: [
                        {
                            type: 'default',
                            text: t("email"),
                            name: "userEmail"
                        },
                        {
                            type: 'default',
                            text: t("username"),
                            name: "userUsername"
                        },
                        {
                            type: 'button',
                            onClick: () => handleChangeNestedSort('createdAt'),
                            text: t("filled-at"),
                            name: "createdAt"
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
                    ],
                    data: templateForms?.data && templateForms.data.map(item => ({
                        id: item.id,
                        userEmail: item.user.email,
                        userUsername: item.user.username,
                        createdAt: new Date(item.createdAt).toLocaleString(),
                        dataState: false
                    })) || [],
                    handleNestedChange: handleChangeNestedState,
                    isFetching: isTemplateFormsFetching,
                    pagination: {
                        limit: templateForms?.limit || 10,
                        page: templateForms?.page || 1,
                        pages: templateForms?.pages || 1,
                        total: templateForms?.total || 0,
                        setPage: (page: number) => {
                            setNestedTableParams(prev => ({
                                ...prev,
                                page,
                            }))
                        },
                        setLimit: (limit: number) => {
                            setNestedTableParams(prev => ({
                                ...prev,
                                limit,
                            }))
                        }
                    }
                }}
            />
        </section>
    );
};

export default AdminTemplates;
