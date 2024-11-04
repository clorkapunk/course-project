import {Input} from "@/components/ui/input.tsx";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import {useTranslation} from "react-i18next";
import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {selectAuthState, setCredentials} from "@/features/auth/authSlice.ts";
import {FaPenToSquare, FaTrash, FaXmark} from "react-icons/fa6";
import toast from "react-hot-toast";
import catchApiErrors from "@/utils/catch-api-errors.ts";
import {
    useAdminEditUserMutation,
    useEditUserMutation,
    useGetUserQuery,
} from "@/features/users/usersApiSlice.ts";
import {
    useCreateSalesforceMutation,
    useEditSalesforceMutation,
    useGetSalesforceDataQuery,
} from "@/features/salesforce/salesforceApiSlice.ts";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {isValidPhoneNumber} from "react-phone-number-input/min";
import {Form, FormControl, FormField, FormItem, FormLabel} from "@/components/ui/form.tsx";
import {PhoneInput} from "@/components/ui/phone-input.tsx";
import {ReloadIcon} from "@radix-ui/react-icons";
import {format} from 'date-fns';
import {LoadingSpinner} from "@/components/LoadingSpinner.tsx";
import {Link, useLocation, useNavigate, useParams} from "react-router-dom";
import {HOME_ROUTE} from "@/utils/routes.ts";
import SortableTable from "@/components/SortableTable/SortableTable.tsx";
import {TicketData} from "@/types";
import {
    useDeleteTicketsMutation,
    useLazyGetUserTicketsQuery
} from "@/features/jira/jiraApiSlice.ts";
import {Badge} from "@/components/ui/badge.tsx";
import {selectIsDialogOpen} from "@/features/jira/ticketSlice.ts";


const salesforceSchema = z.object({
    firstname: z.string().min(1),
    lastname: z.string().min(1),
    email: z.string().email(),
    dob: z.string().min(1),
    phone: z
        .string()
        .refine(isValidPhoneNumber, {message: "Invalid phone number"}),
})


const Profile = () => {
    const {t} = useTranslation()

    const {id} = useParams()
    const navigate = useNavigate()
    const authState = useSelector(selectAuthState)
    const dispatch = useDispatch()
    const location = useLocation()
    const isDialogOpen = useSelector(selectIsDialogOpen)

    if (id && isNaN(parseInt(id))) {
        navigate(HOME_ROUTE)
    }


    const [userId, setUserId] = useState<number>(id ? parseInt(id) : authState.id!)
    const [isOtherProfile, setIsOtherProfile] = useState(id ? parseInt(id) !== authState.id : false)
    const {data: accountData, isLoading: isAccountDataLoading, refetch: refetchAccountData} = useGetUserQuery({userId})
    const {
        data: salesforceData,
        isLoading: isSalesforceLoading,
        refetch: refetchSalesforceData
    } = useGetSalesforceDataQuery({userId})
    const [editSalesforce, {isLoading: isEditSalesforceLoading}] = useEditSalesforceMutation()
    const [createSalesforce, {isLoading: isCreateSalesforceLoading}] = useCreateSalesforceMutation()
    const [editAccount, {isLoading: isEditAccountLoading}] = useEditUserMutation()
    const [adminEditAccount, {isLoading: isAdminEditAccountLoading}] = useAdminEditUserMutation()

    const [tab, setTab] = useState('account')

    const [isUsernameEdit, setIsUsernameEdit] = useState(false)
    const [isPasswordEdit, setIsPasswordEdit] = useState(false)
    const accountSchema = z.object({
        username: z.string().optional(),
        newPassword: z.string().optional(),
        repeatPassword: z.string().optional(),
        oldPassword: z.string().optional(),
    })
        .refine((data) => {
            if (isUsernameEdit) {
                return data.username && data.username.trim().length > 0;
            }
            return true;
        }, {path: ['username']})
        .refine((data) => {
            if (isPasswordEdit) {
                return data.newPassword && data.newPassword.trim().length > 0;
            }
            return true;
        }, {path: ['newPassword']})
        .refine((data) => {
            if (isPasswordEdit) {
                return data.repeatPassword && data.repeatPassword === data.newPassword;
            }
            return true;
        }, {path: ['repeatPassword']})
        .refine((data) => {
            if (isPasswordEdit) {
                return data.oldPassword && data.oldPassword.trim().length > 0;
            }
            return true;
        }, {path: ['oldPassword']});

    const accountForm = useForm<z.infer<typeof accountSchema>>({
        resolver: zodResolver(accountSchema),
        defaultValues: {
            username: '',
            newPassword: '',
            repeatPassword: '',
            oldPassword: ''
        },
        values: {
            username: accountData?.username || '',
            newPassword: '',
            repeatPassword: '',
            oldPassword: ''
        }
    })

    const salesforceForm = useForm<z.infer<typeof salesforceSchema>>({
        resolver: zodResolver(salesforceSchema),
        defaultValues: {
            firstname: "",
            lastname: '',
            email: accountData?.email || '',
            dob: '',
            phone: ''
        },
        values: {
            firstname: salesforceData?.firstname || '',
            lastname: salesforceData?.lastname || '',
            email: salesforceData?.email || accountData?.email || '',
            dob: salesforceData?.dob ? format(new Date(salesforceData.dob), 'yyyy-MM-dd') : '',
            phone: salesforceData?.phone || ''
        }
    })

    const [ticketsSelectedRows, setTicketsSelectedRows] = useState<string[]>([])
    const [ticketsTableParams, setTicketsTableParams] = useState({
        page: 1,
        limit: 10
    })
    const [fetchTickets, {data: ticketsData, isFetching: isTicketsFetching}] = useLazyGetUserTicketsQuery()
    const [deleteTickets, {isLoading: isDeleteTicketsLoading}] = useDeleteTicketsMutation()

    const refetchTickets = () => {
        fetchTickets({
            userId,
            ...ticketsTableParams
        })
    }

    const handleDeleteTickets = async () => {
        try {
            const ids = ticketsSelectedRows
            if (ids.length === 0) {
                toast.error(t('no-selected-rows'))
                return;
            }

            await toast.promise(
                deleteTickets(ids),
                {
                    loading: `${t('saving')}...`,
                    success: <>{t('action-successfully-completed')}</>,
                    error: <>{t("error-occurred")}</>,
                }
            )

            refetchTickets()
            setTicketsSelectedRows([])
        } catch (err) {
            catchApiErrors(err, t)
        }
    }

    const toggleUsernameEdit = (value?: boolean) => {
        if (value !== undefined) {
            if (!value) accountForm.setValue("username", accountData?.username)
            setIsUsernameEdit(value)
        } else {
            if (isUsernameEdit) accountForm.setValue("username", accountData?.username)
            setIsUsernameEdit(prev => !prev)
        }
    }

    const togglePasswordEdit = (value?: boolean) => {
        if (value !== undefined) {
            if (!value) {
                accountForm.setValue("newPassword", '')
                accountForm.setValue("oldPassword", '')
                accountForm.setValue("repeatPassword", '')
            }
            setIsPasswordEdit(value)
        } else {
            if (isPasswordEdit) {
                accountForm.setValue("newPassword", '')
                accountForm.setValue("oldPassword", '')
                accountForm.setValue("repeatPassword", '')
            }
            setIsPasswordEdit(prev => !prev)
        }
    }

    const onSubmitAccount = async (values: z.infer<typeof accountSchema>) => {
        try {

            if (!isUsernameEdit && !isPasswordEdit) return

            let promise;
            if (isOtherProfile) {
                promise = adminEditAccount({id: userId, ...values}).unwrap()
            } else {
                promise = editAccount({...values}).unwrap()
            }

            await toast.promise(
                promise,
                {
                    loading: `${t('saving')}...`,
                    success: (response) => {
                        if (!isOtherProfile) {
                            dispatch(setCredentials({accessToken: response.accessToken}))
                        }
                        refetchAccountData().then(() => {
                            toggleUsernameEdit(false)
                            togglePasswordEdit(false)
                        })
                        return <>{t('action-successfully-completed')}</>
                    },
                    error: <>{t("error-occurred")}</>,
                }
            )
        } catch (err) {
            catchApiErrors(err, t)
        }
    }

    const onSubmitSalesforce = async (values: z.infer<typeof salesforceSchema>) => {
        try {
            let promise
            if (salesforceData) {
                promise = editSalesforce({
                    id: isOtherProfile ? userId : undefined,
                    accountId: salesforceData.accountId,
                    contactId: salesforceData.id,
                    ...values
                }).unwrap()
            } else {
                promise = createSalesforce({
                    id: isOtherProfile ? userId : undefined,
                    ...values
                }).unwrap()
            }

            await toast.promise(
                promise,
                {
                    loading: `${t('saving')}...`,
                    success: () => {
                        refetchSalesforceData()
                        return <>{t('action-successfully-completed')}</>
                    },
                    error: <>{t("error-occurred")}</>,
                }
            )
        } catch (err) {
            catchApiErrors(err, t)
        }

    }

    useEffect(() => {
        if (tab === 'jira-tickets' && !ticketsData?.data) {
            refetchTickets()
        }
    }, [tab]);

    useEffect(() => {
        refetchTickets()
    }, [ticketsTableParams.page, ticketsTableParams.limit, userId])

    useEffect(() => {
        if(!isDialogOpen) refetchTickets()
    }, [isDialogOpen]);

    useEffect(() => {
        setUserId(id ? parseInt(id) : authState.id!)
        setIsOtherProfile(id ? parseInt(id) !== authState.id : false)
    }, [location.pathname])

    return (
        <section className={'flex p-2 lg:p-4 2xl:p-8'}>
            <Tabs defaultValue="account" value={tab} onValueChange={(value) => setTab(value)}
                  className="flex flex-col lg:flex-row w-full items-start gap-4">
                <TabsList className="grid grid-cols-1 max-w-full lg:max-w-[250px] w-full h-fit">
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="salesforce">Salesforce</TabsTrigger>
                    <TabsTrigger value="jira-tickets">Jira Tickets</TabsTrigger>
                </TabsList>
                <TabsContent value="account" className={'w-full mt-0'}>
                    <Card className={'relative overflow-hidden'}>
                        {
                            isAccountDataLoading &&
                            <div className={'absolute w-full h-full bg-primary/10 flex items-center justify-center'}>
                                <LoadingSpinner/>
                            </div>
                        }
                        <CardHeader>
                            <CardTitle>{t('account')}</CardTitle>
                            <CardDescription>
                                {t('account-profile-description')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Form {...accountForm}>
                                <form onSubmit={accountForm.handleSubmit(onSubmitAccount)}
                                      className={'flex flex-col gap-4'}>
                                    <FormField
                                        control={accountForm.control}
                                        name="username"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>{t('username')}</FormLabel>
                                                <div className={'flex gap-2'}>
                                                    <FormControl>
                                                        <Input id={'username'} disabled={!isUsernameEdit}  {...field} />
                                                    </FormControl>
                                                    <FormControl>
                                                        <Button
                                                            type={'button'}
                                                            onClick={() => toggleUsernameEdit()}
                                                            className={'flex-shrink-0'} size={'icon'}
                                                            variant={'ghost'}
                                                        >
                                                            {
                                                                isUsernameEdit
                                                                    ? <FaXmark/>
                                                                    : <FaPenToSquare/>
                                                            }
                                                        </Button>
                                                    </FormControl>
                                                </div>

                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={accountForm.control}
                                        name="newPassword"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>{t('new-password')}</FormLabel>
                                                <div className={'flex gap-2'}>
                                                    <FormControl>
                                                        <Input id={'new-password'} type={'password'}
                                                               disabled={!isPasswordEdit}  {...field} />
                                                    </FormControl>
                                                    <FormControl>
                                                        <Button
                                                            type={'button'}
                                                            onClick={() => togglePasswordEdit()}
                                                            className={'flex-shrink-0'} size={'icon'}
                                                            variant={'ghost'}
                                                        >
                                                            {
                                                                isPasswordEdit
                                                                    ? <FaXmark/>
                                                                    : <FaPenToSquare/>
                                                            }
                                                        </Button>
                                                    </FormControl>
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    {
                                        isPasswordEdit &&
                                        <>
                                            <FormField
                                                control={accountForm.control}
                                                name="repeatPassword"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>{t('new-password-repeat')}</FormLabel>
                                                        <FormControl>
                                                            <Input type={'password'} {...field} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={accountForm.control}
                                                name="oldPassword"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel>{t('old-password')}</FormLabel>
                                                        <FormControl>
                                                            <Input type={'password'} {...field} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </>
                                    }


                                    <div>
                                        <Button
                                            type="submit"
                                            className={'mt-4'}
                                            disabled={isEditAccountLoading || isAdminEditAccountLoading || (!isUsernameEdit && !isPasswordEdit)}
                                        >
                                            {
                                                (isEditAccountLoading || isAdminEditAccountLoading)
                                                    ? (<>
                                                        <ReloadIcon className="mr-2 h-4 w-4 animate-spin"/>
                                                        {t("processing")}
                                                    </>)
                                                    :
                                                    t('save-changes')

                                            }
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="salesforce" className={'w-full mt-0'}>
                    <Card className={'relative overflow-hidden'}>
                        {
                            isSalesforceLoading &&
                            <div className={'absolute w-full h-full bg-primary/10 flex items-center justify-center'}>
                                <LoadingSpinner/>
                            </div>
                        }
                        <CardHeader>
                            <CardTitle>{t('salesforce-account')}</CardTitle>
                            <CardDescription>
                                {
                                    salesforceData
                                        ? t('profile-salesforce-description-edit')
                                        : t('profile-salesforce-description-create')
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...salesforceForm}>
                                <form onSubmit={salesforceForm.handleSubmit(onSubmitSalesforce)}
                                      className={'flex flex-col gap-4'}>
                                    <div className={'flex gap-2 w-full'}>
                                        <FormField
                                            control={salesforceForm.control}
                                            name="firstname"
                                            render={({field}) => (
                                                <FormItem className={'w-full'}>
                                                    <FormLabel>{t('firstname')}</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={salesforceForm.control}
                                            name="lastname"
                                            render={({field}) => (
                                                <FormItem className={'w-full'}>
                                                    <FormLabel>{t('lastname')}</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={salesforceForm.control}
                                        name="email"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>{t('email')}</FormLabel>
                                                <FormControl>
                                                    <Input readOnly={field.value !== ''} {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={salesforceForm.control}
                                        name="dob"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>{t('date-of-birth')}</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type={'date'}
                                                        {...field}
                                                        // value={undefined}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={salesforceForm.control}
                                        name="phone"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>{t('mobile-phone')}</FormLabel>
                                                <FormControl>

                                                    <PhoneInput
                                                        defaultCountry={'US'}
                                                        international={true}
                                                        {...field}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <div>
                                        <Button
                                            type="submit"
                                            className={'mt-4'}
                                            disabled={isCreateSalesforceLoading || isEditSalesforceLoading}
                                        >
                                            {
                                                (isCreateSalesforceLoading || isEditSalesforceLoading)
                                                    ? (<>
                                                        <ReloadIcon className="mr-2 h-4 w-4 animate-spin"/>
                                                        {t("processing")}
                                                    </>)
                                                    :
                                                    salesforceData
                                                        ? t('edit')
                                                        : t("create")
                                            }
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="jira-tickets" className={'w-full mt-0'}>
                    <Card className={'relative overflow-hidden '}>
                        <CardHeader>
                            <CardTitle>{t('your-jira-tickets')}</CardTitle>
                            <CardDescription>
                                {t('profile-jira-tickets-description')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className={'p-0'}>
                            <SortableTable
                                header={<div className={'flex gap-2'}>
                                    <Button variant={'secondary'} size={'icon'} onClick={handleDeleteTickets}>
                                        {
                                            isDeleteTicketsLoading
                                                ? <ReloadIcon className="mr-2 h-4 w-4 animate-spin"/>
                                                : <FaTrash/>
                                        }
                                    </Button>

                                    {/*<Button*/}
                                    {/*    variant={'secondary'}*/}
                                    {/*    onClick={() => handleOpenDialog()}*/}
                                    {/*>*/}
                                    {/*    Open*/}
                                    {/*</Button>*/}
                                </div>
                                }
                                containerClassName={'p-4 border-none'}
                                fields={[
                                    {
                                        type: "select",
                                        name: "select",
                                        checked: ticketsSelectedRows.length === ticketsData?.data?.length && ticketsData?.data?.length !== 0,
                                        partiallyChecked: ticketsSelectedRows.length > 0,
                                        onCheckedChange: (value) => {
                                            if (!ticketsData?.data) return
                                            if (value) setTicketsSelectedRows(ticketsData?.data.map((template: TicketData) => template.id))
                                            else setTicketsSelectedRows([])
                                        },
                                    },
                                    {
                                        type: 'default',
                                        name: "templateTitle",
                                        cellComponent: (item: TicketData) => {
                                            return (<p
                                                title={item.fields.summary}
                                                className={'line-clamp-2'}
                                            >
                                                {item.fields.templateTitle}
                                            </p>)
                                        },
                                        text: t("template")
                                    },
                                    {
                                        type: 'default',
                                        name: "summary",
                                        cellComponent: (item: TicketData) => {
                                            return (<p
                                                title={item.fields.summary}
                                                className={'line-clamp-2'}
                                            >
                                                {item.fields.summary}
                                            </p>)
                                        },
                                        text: t("summary")
                                    },
                                    {
                                        type: 'default',
                                        name: "priority",
                                        cellComponent: (item: TicketData) => {
                                            return (<Badge
                                                variant={'outline'}
                                                className={`rounded-md flex justify-center gap-1 h-[24px] `}
                                            >
                                                <img
                                                    className={'w-[18px]'}
                                                    src={item.fields.priority.iconUrl}
                                                    alt={''}
                                                />
                                                <p>
                                                    {item.fields.priority.name}
                                                </p>
                                            </Badge>)
                                        },
                                        text: t("priority")
                                    },
                                    {
                                        type: 'default',
                                        name: "status",
                                        cellComponent: (item: TicketData) => {
                                            let style = ''
                                            if (item.fields.status.key === 'done') style = 'dark:bg-green-800 dark:hover:bg-green-800/80 bg-green-600 hover:bg-green-600/80'
                                            if (item.fields.status.key === 'indeterminate') style = 'dark:bg-blue-800 dark:hover:bg-blue-800/80 bg-blue-600 hover:bg-blue-600/80'

                                            return (<Badge
                                                variant={'secondary'}
                                                className={`rounded-md flex justify-center gap-2 h-[24px] text-nowrap ${style}`}
                                            >

                                                {t(`status-${item.fields.status.key}`)}

                                            </Badge>)
                                        },
                                        text: t("status")
                                    },
                                    // {
                                    //     type: 'default',
                                    //     name: "statusUpdatedAt",
                                    //     text: t("updated-at")
                                    // },
                                    {
                                        type: 'default',
                                        name: "createdAt",
                                        text: t("created-at")
                                    },
                                    {
                                        type: 'default',
                                        name: "ticketLink",
                                        cellComponent: (item: TicketData) =>
                                            (<Link
                                                className={'hover:underline w-fit lg:pr-2'}
                                                to={`${item.url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {t("link")}
                                            </Link>),
                                        text: ''
                                    },
                                ]}
                                data={ticketsData?.data ? ticketsData?.data?.map(item => ({
                                    ...item,
                                    id: item.id,
                                    templateTitle: item.fields.templateTitle,
                                    summary: item.fields.summary,
                                    priority: item.fields.priority.name,
                                    status: item.fields.status.key,
                                    statusUpdatedAt: new Date(item.fields.status.updatedAt).toLocaleString(),
                                    createdAt: new Date(item.createdAt).toLocaleString(),
                                    dataState: !!ticketsSelectedRows.find(id => id === item.id),
                                    onCheckedChange: (value) => {
                                        if (value) setTicketsSelectedRows(prev => ([...prev, item.id]))
                                        else setTicketsSelectedRows(prev => (prev.filter(id => id !== item.id)))
                                    },
                                    checked: !!ticketsSelectedRows.find(id => id === item.id)
                                })) : []}
                                pagination={{
                                    limit: ticketsData?.limit || 10,
                                    page: ticketsData?.page || 1,
                                    pages: ticketsData?.pages || 1,
                                    total: ticketsData?.total || 0,
                                    setPage: (page: number) => {
                                        setTicketsTableParams(prev => ({
                                            ...prev,
                                            page,
                                        }))
                                    },
                                    setLimit: (limit: number) => {
                                        setTicketsTableParams(prev => ({
                                            ...prev,
                                            limit,
                                        }))
                                    }
                                }}
                                isFetching={isTicketsFetching}
                            />

                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </section>
    );
};

export default Profile;
