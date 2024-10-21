import {Tabs, TabsContent, TabsTrigger} from "@/components/ui/tabs";
import {TabsList} from "@/components/ui/tabs.tsx";
import SortableTable from "@/components/SortableTable/SortableTable.tsx";
import {ApiErrorResponse, TemplateData} from "@/types";
import {useEffect, useState} from "react";
import {useDeleteTemplatesMutation, useGetUserTemplatesQuery} from "@/features/templates/templatesApiSlice.ts";
import {useSelector} from "react-redux";
import {selectAuthState} from "@/features/auth/authSlice.ts";
import {useTranslation} from "react-i18next";
import SelectableSearch from "@/components/SelectableSearch/SelectableSearch.tsx";
import {FaTrash} from "react-icons/fa6";
import {Button} from "@/components/ui/button.tsx";
import toast from "react-hot-toast";
import {Link} from "react-router-dom";
import {EDIT_TEMPLATE_ROUTE} from "@/utils/routes.ts";

const Profile = () => {
    const {t} = useTranslation()
    const authState = useSelector(selectAuthState)

    const [templatesSelectedRows, setTemplatesSelectedRows] = useState<number[]>([]);
    const [templatesPage, setTemplatesPage] = useState(1)
    const [templatesLimit, setTemplatesLimit] = useState(10)
    const [templatesSearch, setTemplatesSearch] = useState('')
    const [templatesSort, setTemplatesSort] = useState('desc')
    const [templatesOrderBy, setTemplatesOrderBy] = useState('createdAt')
    const [templatesSearchBy, setTemplatesSearchBy] = useState('title')
    const {data: templatesData, refetch: templatesRefetch} = useGetUserTemplatesQuery({
        userId: authState.id!,
        page: templatesPage,
        limit: templatesLimit,
        search: templatesSearch,
        sort: templatesSort,
        orderBy: templatesOrderBy,
        searchBy: templatesSearchBy
    })
    const [deleteTemplates] = useDeleteTemplatesMutation()

    const handleTemplatesChangeSort = (field: string) => {
        if (templatesOrderBy === field) {
            setTemplatesSort(prev => {
                return prev === 'asc' ? "desc" : 'asc'
            })
        } else {
            setTemplatesOrderBy(field)
            setTemplatesSort('asc')
        }
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
            templatesRefetch()
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



    const templatesTableHeader = () => {
        return (<div className={'flex justify-between'}>
            <Button
                variant={'dark'}
                size={'icon'}
                onClick={handleDeleteTemplates}
            >
                <FaTrash/>
            </Button>
            <SelectableSearch
                setSearchField={setTemplatesSearchBy}
                searchField={templatesSearchBy}
                searchString={templatesSearch}
                setSearchString={setTemplatesSearch}
                fields={[
                    {label: t('title'), value: 'title'},
                    {label: t('description'), value: 'description'},
                ]}
            />
        </div>)
    }


    useEffect(() => {
        const timer = setTimeout(() => {
            templatesRefetch()
        }, 500);

        return () => {
            clearTimeout(timer);
        };
    }, [templatesSearch]);

    return (
        <section className={'p-4'}>

            <Tabs defaultValue="account" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                </TabsList>
                <TabsContent value="account">
                    <SortableTable
                        header={templatesTableHeader()}
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
                            enabled: true,
                            limit: templatesData?.limit || 10,
                            page: templatesData?.page || 1,
                            pages: templatesData?.pages || 1,
                            total: templatesData?.total || 0,
                            setLimit: setTemplatesLimit,
                            setPage: setTemplatesPage
                        }}
                    />
                </TabsContent>
                <TabsContent value="password">

                </TabsContent>
            </Tabs>

        </section>
    );
};

export default Profile;
