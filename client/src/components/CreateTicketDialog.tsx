import {Button} from "@/components/ui/button.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog.tsx";
import {Input} from "@/components/ui/input.tsx";
import {useDispatch, useSelector} from "react-redux";
import {selectTicketState, setIsDialogOpened} from "@/features/jira/ticketSlice.ts";
import {useEffect} from "react";
import {useTranslation} from "react-i18next";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel} from "@/components/ui/form.tsx";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select.tsx";
import averageIcon from '@/assets/icons/jira-priority-average.svg'
import highIcon from '@/assets/icons/jira-priority-high.svg'
import lowIcon from '@/assets/icons/jira-priority-low.svg'
import {useLocation} from "react-router-dom";
import {useCreateTicketMutation} from "@/features/jira/jiraApiSlice.ts";
import catchApiErrors from "@/utils/catch-api-errors.ts";
import toast from "react-hot-toast";
import {ReloadIcon} from "@radix-ui/react-icons";
import {Textarea} from "@/components/ui/textarea.tsx";


const ticketSchema = z.object({
    summary: z.string().min(1),
    template: z.string().optional().readonly(),
    priority: z.string().min(1),
})

const CreateTicketDialog = () => {
    const {isOpen, templateTitle} = useSelector(selectTicketState)
    const dispatch = useDispatch()
    const {t} = useTranslation()
    const location = useLocation()

    const [createTicket, {isLoading}] = useCreateTicketMutation()

    const form = useForm<z.infer<typeof ticketSchema>>({
        resolver: zodResolver(ticketSchema),
        defaultValues: {
            summary: '',
            template: '',
            priority: ''
        },
        values: {
            summary: '',
            template: templateTitle,
            priority: ''
        }
    })

    const handleOpenChange = (open: boolean) => {
        dispatch(setIsDialogOpened(open))
    }

    const onSubmit = async (values: z.infer<typeof ticketSchema>) => {
        try {
            await toast.promise(
                createTicket({
                    ...values,
                    link: window.location.href
                }),
                {
                    loading: `${t('saving')}...`,
                    success: <>{t('action-successfully-completed')}</>,
                    error: <>{t("error-occurred")}</>,
                }
            )
            form.reset()
            handleOpenChange(false)
        } catch (err) {
            catchApiErrors(err, t)
        }
    }
    useEffect(() => {

    }, [location.pathname]);


    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            {/*<DialogTrigger asChild>*/}
            {/*    <Button variant="outline">Edit Profile</Button>*/}
            {/*</DialogTrigger>*/}
            <DialogContent className="sm:max-w-[425px] rounded-md">
                <DialogHeader>
                    <DialogTitle>{t('create-jira-ticket')}</DialogTitle>
                    <DialogDescription>
                        {t('create-ticket-dialog-description')}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 ">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}
                              className={'flex flex-col gap-4'}>
                            {
                                !!templateTitle &&
                                <FormField
                                    control={form.control}
                                    name="template"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>{t('template-title')}</FormLabel>
                                            <FormControl>
                                                <Input readOnly={true} {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            }
                            <FormField
                                control={form.control}
                                name="summary"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>{t('summary')}</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} className={'resize-none'} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="priority"
                                render={({field}) => {
                                    const {ref, ...fields} = field
                                    return (
                                        <FormItem>
                                            <FormLabel>{t('priority')}</FormLabel>
                                            <FormControl>
                                                <Select {...fields} onValueChange={fields.onChange}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t('select-priority')}/>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            <SelectItem value="High">
                                                                <div className={'flex items-center gap-2'}>
                                                                    <img
                                                                        className={'w-[18px]'}
                                                                        src={highIcon}
                                                                        alt={'high-icon'}
                                                                    />
                                                                    <p>{t('high')}</p>
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="Average">
                                                                <div className={'flex items-center gap-2'}>
                                                                    <img
                                                                        className={'w-[18px]'}
                                                                        src={averageIcon}
                                                                        alt={'average-icon'}
                                                                    />
                                                                    <p>{t('average')}</p>
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="Low">
                                                                <div className={'flex items-center gap-2'}>
                                                                    <img
                                                                        className={'w-[18px]'}
                                                                        src={lowIcon}
                                                                        alt={'low-icon'}
                                                                    />
                                                                    <p>{t('low')}</p>
                                                                </div>
                                                            </SelectItem>
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                        </FormItem>
                                    )
                                }}
                            />


                            <div className={'flex justify-end'}>
                                <Button
                                    type="submit"
                                    className={'mt-4'}
                                    disabled={isLoading}
                                >
                                    {
                                        isLoading
                                            ? (<><ReloadIcon
                                                className="mr-2 h-4 w-4 animate-spin"/>{t("processing")}</>)
                                            : t("create")
                                    }
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CreateTicketDialog;
