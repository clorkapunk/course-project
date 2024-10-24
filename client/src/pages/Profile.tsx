import {Tabs, TabsContent, TabsTrigger} from "@/components/ui/tabs";
import {TabsList} from "@/components/ui/tabs.tsx";
import SortableTable from "@/components/SortableTable/SortableTable.tsx";
import {ApiErrorResponse, TableFormData, TemplateData} from "@/types";
import { useEffect, useState} from "react";
import {
    useDeleteTemplatesMutation,
    useLazyGetUserTemplatesQuery
} from "@/features/templates/templatesApiSlice.ts";
import {useSelector} from "react-redux";
import {selectAuthState} from "@/features/auth/authSlice.ts";
import {useTranslation} from "react-i18next";
import SelectableSearch from "@/components/SelectableSearch/SelectableSearch.tsx";
import {FaTrash} from "react-icons/fa6";
import {Button} from "@/components/ui/button.tsx";
import toast from "react-hot-toast";
import {Link} from "react-router-dom";
import {EDIT_FORM_ROUTE, EDIT_TEMPLATE_ROUTE} from "@/utils/routes.ts";
import {
    useDeleteFormsMutation,
    useLazyGetUserFormsQuery, useLazyGetUserTemplatesFormsQuery
} from "@/features/forms/formsApiSlice.ts";

const Profile = () => {
    const {t} = useTranslation()
    const authState = useSelector(selectAuthState)
    const [tab, setTab] = useState('templates')

    const [fetchTemplates, {data: templatesData, isFetching: isTemplatesLoading}] = useLazyGetUserTemplatesQuery()
    const [deleteTemplates] = useDeleteTemplatesMutation()
    const [templatesSelectedRows, setTemplatesSelectedRows] = useState<number[]>([]);
    const [templatesTableParams, setTemplatesTableParams] = useState({
        page: 1,
        limit: 10,
        sort: 'desc',
        orderBy: 'createdAt',
        searchBy: 'title',
        search: ''
    })
    const refetchTemplates = () => {
        fetchTemplates({
            userId: authState.id!,
            ...templatesTableParams
        })
    }
    const handleTemplatesChangeSort = (field: string) => {
        setTemplatesTableParams(prev => {
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
    const handleDeleteTemplates = async () => {
        try {
            const ids = templatesSelectedRows
            if (ids.length === 0) {
                toast.error("No templates selected")
                return;
            }

            await toast.promise(
                deleteTemplates({templatesIds: ids}).unwrap(),
                {
                    loading: 'Saving...',
                    success: <>Templates successfully deleted!</>,
                    error: <>Error when deleting templates</>,
                }
            )
            refetchTemplates()
            setTemplatesSelectedRows([])
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

    const [fetchUserForms, {data: userFormsData, isFetching: isUserFormsLoading}] = useLazyGetUserFormsQuery()
    const [deleteForms] = useDeleteFormsMutation()
    const [userFormsSelectedRows, setUserFormsSelectedRows] = useState<number[]>([]);
    const [userFormsTableParams, setUserFormsTableParams] = useState({
        page: 1,
        limit: 10,
        sort: 'desc',
        orderBy: 'createdAt',
        searchBy: 'title',
        search: ''
    })
    const refetchUserForms = () => {
        fetchUserForms({
            userId: authState.id!,
            ...userFormsTableParams
        })
    }
    const handleUserFormsChangeSort = (field: string) => {
        setUserFormsTableParams(prev => {
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
    const handleDeleteUserForms = async () => {
        try {
            const ids = userFormsSelectedRows
            if (ids.length === 0) {
                toast.error("No forms selected")
                return;
            }

            await toast.promise(
                deleteForms({ids}).unwrap(),
                {
                    loading: 'Saving...',
                    success: <>Forms successfully deleted!</>,
                    error: <>Error when deleting forms</>,
                }
            )
            refetchUserForms()
            setUserFormsSelectedRows([])
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

    const [fetchFilledTemplates, {data: filledTemplatesData, isFetching: isFilledTemplatesLoading}] = useLazyGetUserTemplatesFormsQuery()
    // const [deleteForms] = useDeleteFormsMutation()
    const [filledTemplatesSelectedRows, setFilledTemplatesSelectedRows] = useState<number[]>([]);
    const [filledTemplatesTableParams, setFilledTemplatesTableParams] = useState({
        page: 1,
        limit: 10,
        sort: 'desc',
        orderBy: 'createdAt',
        searchBy: 'title',
        search: ''
    })
    const refetchFilledTemplates = () => {
        fetchFilledTemplates({
            userId: authState.id!,
            ...filledTemplatesTableParams
        })
    }
    const handleFilledTemplatesChangeSort = (field: string) => {
        setFilledTemplatesTableParams(prev => {
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
    const handleDeleteFilledTemplates = async () => {
        try {
            const ids = filledTemplatesSelectedRows
            if (ids.length === 0) {
                toast.error("No forms selected")
                return;
            }

            await toast.promise(
                deleteForms({ids}).unwrap(),
                {
                    loading: 'Saving...',
                    success: <>Forms successfully deleted!</>,
                    error: <>Error when deleting forms</>,
                }
            )
            refetchFilledTemplates()
            setFilledTemplatesSelectedRows([])
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


    useEffect(() => {
        console.log(filledTemplatesTableParams)
    }, [filledTemplatesTableParams]);


    // templates table change listeners
    useEffect(() => {
        refetchTemplates()
    }, [templatesTableParams.page, templatesTableParams.limit, templatesTableParams.orderBy, templatesTableParams.sort, templatesTableParams.searchBy]);
    useEffect(() => {
        const timer = setTimeout(() => {
            refetchTemplates()
        }, 500);

        return () => {
            clearTimeout(timer);
        };
    }, [templatesTableParams.search]);

    // users forms table change listeners
    useEffect(() => {
        refetchUserForms()
    }, [userFormsTableParams.page, userFormsTableParams.limit, userFormsTableParams.orderBy, userFormsTableParams.sort, userFormsTableParams.searchBy]);
    useEffect(() => {
        const timer = setTimeout(() => {
            refetchUserForms()
        }, 500);

        return () => {
            clearTimeout(timer);
        };
    }, [userFormsTableParams.search]);

    // filled templates table change listeners
    useEffect(() => {
        refetchFilledTemplates()
    }, [filledTemplatesTableParams.page, filledTemplatesTableParams.limit, filledTemplatesTableParams.orderBy, filledTemplatesTableParams.sort, filledTemplatesTableParams.searchBy]);
    useEffect(() => {
        const timer = setTimeout(() => {
            refetchFilledTemplates()
        }, 500);

        return () => {
            clearTimeout(timer);
        };
    }, [filledTemplatesTableParams.search]);

    // update data when tab changed
    useEffect(() => {
        if(tab === 'templates') {
            refetchTemplates()
        }
        else if(tab === 'my-forms') {
            refetchUserForms()
        }
        else if(tab === 'filled-templates'){
            refetchFilledTemplates()
        }
    }, [tab]);


    const tableHeader = ({handleDelete, setSearchBy, searchBy, search, setSearch, fields}:
                             {
                                 handleDelete: () => void;
                                 setSearchBy:(value: string) => void;
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
        <section className={'p-4 pt-[72px] md:pt-4'}>

            <Tabs value={tab} className="w-full" orientation={'vertical'} onValueChange={(value) => setTab(value)}>
                <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-fit">
                    <TabsTrigger value="templates">{t('templates')}</TabsTrigger>
                    <TabsTrigger value="my-forms">{t('my-forms')}</TabsTrigger>
                    <TabsTrigger value="filled-templates">{t('filled-templates')}</TabsTrigger>
                </TabsList>
                <TabsContent value="templates">
                    <SortableTable
                        header={tableHeader({
                            handleDelete: handleDeleteTemplates,
                            setSearchBy: (searchBy) => setTemplatesTableParams(prev => ({...prev, searchBy})),
                            searchBy: templatesTableParams.searchBy,
                            search: templatesTableParams.search,
                            setSearch: (search) => setTemplatesTableParams(prev => ({...prev, search})),
                            fields: [
                                {label: t('title'), value: 'title'},
                                {label: t('description'), value: 'description'}
                            ]
                        })}
                        fields={[
                            {
                                type: "select",
                                name: "select",
                                checked: templatesSelectedRows.length === templatesData?.data?.length && templatesData?.data?.length !== 0,
                                partiallyChecked: templatesSelectedRows.length > 0,
                                onCheckedChange: (value) => {
                                    if (!templatesData?.data) return
                                    if (value) setTemplatesSelectedRows(templatesData?.data.map((item: TemplateData) => item.id))
                                    else setTemplatesSelectedRows([])
                                },
                            },
                            {
                                type: 'button',
                                name: "title",
                                onClick: () => handleTemplatesChangeSort("title"),
                                cellComponent:  (item: TemplateData) => <Link className={'hover:underline'} to={EDIT_TEMPLATE_ROUTE + `/${item.id}`}>
                                    {item['title']}
                                </Link>,
                                text: t('title')
                            },
                            {
                                type: 'button',
                                name: "createdAt",
                                onClick: () => handleTemplatesChangeSort("createdAt"),
                                text: t('published-at')
                            },
                            {
                                type: 'default',
                                name: "mode",
                                text: t('mode')
                            },
                            {
                                type: 'default',
                                name: "topic",
                                text: t('topic')
                            },
                            {
                                type: 'button',
                                name: 'formsCount',
                                onClick: () => handleTemplatesChangeSort('form'),
                                text: t('filled-forms'),
                                width: 100
                            }
                        ]}
                        data={templatesData?.data ? templatesData?.data?.map(item => ({
                            id: item.id,
                            title: item.title,
                            createdAt: new Date(item.createdAt).toLocaleString(),
                            mode: item.mode.toUpperCase(),
                            topic: item.topic.name,
                            formsCount: item._count!.form,
                            dataState: !!templatesSelectedRows.find(id => id === item.id),
                            onCheckedChange: (value) => {
                                if (value) setTemplatesSelectedRows(prev => ([...prev, item.id]))
                                else setTemplatesSelectedRows(prev => (prev.filter(email => email !== item.id)))
                            },
                            checked: !!templatesSelectedRows.find(id => id === item.id)
                        })) : []}
                        pagination={{
                            limit: templatesData?.limit || 10,
                            page: templatesData?.page || 1,
                            pages: templatesData?.pages || 1,
                            total: templatesData?.total || 0,
                            setLimit: (limit) => setTemplatesTableParams(prev => ({...prev, limit})),
                            setPage: (page) => setTemplatesTableParams(prev => ({...prev, page})),
                        }}
                        isFetching={isTemplatesLoading}
                    />
                </TabsContent>
                <TabsContent value="my-forms">
                    <SortableTable
                        header={tableHeader({
                            handleDelete: handleDeleteUserForms,
                            setSearchBy: (searchBy) => setUserFormsTableParams(prev => ({...prev, searchBy})),
                            searchBy: userFormsTableParams.searchBy,
                            search: userFormsTableParams.search,
                            setSearch: (search) => setUserFormsTableParams(prev => ({...prev, search})),
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
                                checked: userFormsSelectedRows.length === userFormsData?.data?.length && userFormsData?.data?.length !== 0,
                                partiallyChecked: userFormsSelectedRows.length > 0,
                                onCheckedChange: (value) => {
                                    if (!userFormsData?.data) return
                                    if (value) setUserFormsSelectedRows(userFormsData?.data.map((item: TableFormData) => item.id))
                                    else setUserFormsSelectedRows([])
                                },
                            },
                            {
                                type: 'button',
                                name: "title",
                                onClick: () => handleUserFormsChangeSort("title"),
                                cellComponent:  (item: TableFormData) => {
                                    return <Link className={'hover:underline'} to={EDIT_FORM_ROUTE + `/${item.id}`}>
                                        {item['template']['title']}
                                    </Link>
                                },
                                text: t('title')
                            },
                            {
                                type: 'button',
                                name: "createdAt",
                                onClick: () => handleUserFormsChangeSort("createdAt"),
                                text: t('filled-at')
                            },
                            {
                                type: 'button',
                                name: 'author',
                                onClick: () => handleUserFormsChangeSort("email"),
                                text: t('author')
                            },
                            {
                                type: 'default',
                                name: 'authorUsername',
                                text: t('author')
                            }
                        ]}
                        data={userFormsData?.data ? userFormsData?.data?.map(item => ({
                            ...item,
                            id: item.id,
                            title: item.template.title,
                            createdAt: new Date(item.createdAt).toLocaleString(),
                            author: item.template.user.email,
                            authorUsername: item.template.user.username,
                            dataState: !!userFormsSelectedRows.find(id => id === item.id),
                            onCheckedChange: (value) => {
                                if (value) setUserFormsSelectedRows(prev => ([...prev, item.id]))
                                else setUserFormsSelectedRows(prev => (prev.filter(id => id !== item.id)))
                            },
                            checked: !!userFormsSelectedRows.find(id => id === item.id)
                        })) : []}
                        pagination={{
                            limit: userFormsData?.limit || 10,
                            page: userFormsData?.page || 1,
                            pages: userFormsData?.pages || 1,
                            total: userFormsData?.total || 0,
                            setLimit: (limit) => setUserFormsTableParams(prev => ({...prev, limit})),
                            setPage: (page) => setUserFormsTableParams(prev => ({...prev, page})),
                        }}
                        isFetching={isUserFormsLoading}
                    />
                </TabsContent>
                <TabsContent value="filled-templates">
                    <SortableTable
                        header={tableHeader({
                            handleDelete: handleDeleteFilledTemplates,
                            setSearchBy: (searchBy) => setFilledTemplatesTableParams(prev => ({...prev, searchBy})),
                            searchBy: filledTemplatesTableParams.searchBy,
                            search: filledTemplatesTableParams.search,
                            setSearch: (search) => setFilledTemplatesTableParams(prev => ({...prev, search})),
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
                                checked: userFormsSelectedRows.length === userFormsData?.data?.length && userFormsData?.data?.length !== 0,
                                partiallyChecked: userFormsSelectedRows.length > 0,
                                onCheckedChange: (value) => {
                                    if (!userFormsData?.data) return
                                    if (value) setFilledTemplatesSelectedRows(userFormsData?.data.map((item: TableFormData) => item.id))
                                    else setFilledTemplatesSelectedRows([])
                                }
                            },

                            {
                                type: 'button',
                                onClick: () => handleFilledTemplatesChangeSort('email'),
                                name: "userEmail",
                                text: t('email'),
                            },
                            {
                                type: 'button',
                                onClick: () => handleFilledTemplatesChangeSort('username'),
                                name: "userUsername",
                                text: t('username'),
                            },
                            {
                                type: 'button',
                                onClick: () => handleFilledTemplatesChangeSort('createdAt'),
                                name: "createdAt",
                                text: t('date-and-time'),
                            },
                            {
                                type: 'button',
                                onClick: () => handleFilledTemplatesChangeSort('title'),
                                name: "title",
                                text: t('title'),
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
                        data={filledTemplatesData?.data ? filledTemplatesData?.data?.map(item => ({
                            ...item,
                            id: item.id,
                            userEmail: item.user.email,
                            userUsername: item.user.username,
                            title: item.template.title,
                            createdAt: new Date(item.createdAt).toLocaleString(),
                            dataState: !!filledTemplatesSelectedRows.find(id => id === item.id),
                            onCheckedChange: (value) => {
                                if (value) setFilledTemplatesSelectedRows(prev => ([...prev, item.id]))
                                else setFilledTemplatesSelectedRows(prev => (prev.filter(id => id !== item.id)))
                            },
                            checked: !!filledTemplatesSelectedRows.find(id => id === item.id)
                        })) : []}
                        pagination={{
                            limit: filledTemplatesData?.limit || 10,
                            page: filledTemplatesData?.page || 1,
                            pages: filledTemplatesData?.pages || 1,
                            total: filledTemplatesData?.total || 0,
                            setLimit: (limit) => setFilledTemplatesTableParams(prev => ({...prev, limit})),
                            setPage: (page) => setFilledTemplatesTableParams(prev => ({...prev, page})),
                        }}
                        isFetching={isFilledTemplatesLoading}
                    />
                </TabsContent>
            </Tabs>

        </section>
    );
};

export default Profile;
