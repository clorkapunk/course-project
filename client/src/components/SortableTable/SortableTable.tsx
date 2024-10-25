import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {Button} from "@/components/ui/button.tsx";
import {CaretSortIcon} from "@radix-ui/react-icons";
import {useTranslation} from "react-i18next";
import {FaChevronDown, FaChevronLeft, FaChevronRight} from "react-icons/fa6";

import {
    Select,
    SelectContent,
    SelectGroup, SelectItem,
    SelectLabel,
    SelectSeparator,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select.tsx";
import {ComponentProps, ReactNode, useState} from "react";
import styles from './SortableTable.module.scss'
import {Accordion, AccordionContent, AccordionItem} from "@/components/ui/accordion.tsx";
import React from "react";


type Field = |
    {
        type: "select";
        name: string;
        checked: boolean;
        partiallyChecked?: boolean;
        onCheckedChange: (value: boolean) => void;
        ariaLabel?: string;
        align?: "right" | 'left' | 'center';
        width?: number;
        cellComponent?: (item?: any) => ReactNode;
    } |
    {
        type: "button";
        name: string;
        text: string;
        onClick: () => void;
        align?: "right" | 'left' | 'center';
        width?: number;
        cellComponent?: (item?: any) => ReactNode;
    } |
    {
        type: 'default';
        name: string;
        text: string;
        align?: "right" | 'left' | 'center';
        width?: number;
        cellComponent?: (item?: any) => ReactNode;
    }

type RequiredData = {
    id: string | number;
    dataState: boolean;
    checked?: boolean;
    onCheckedChange?: (value: boolean) => void;
}

type DataType = RequiredData & {
    [key: string]: any
}

type Pagination = {
    limit: number;
    page: number;
    pages: number;
    total: number;
    setPage: (page: number) => void;
    setLimit: (limit: number) => void;
}

type Props = {
    fields: Field[],
    data: DataType[],
    nestedTableProps?: Props & { handleNestedChange: (id: number) => void };
    pagination?: Pagination,
    header?: ReactNode
    isFetching?: boolean;
    containerClassName?: ComponentProps<'div'>['className'];
}

const SortableTable = ({
                           fields,
                           data,
                           pagination,
                           header,
                           isFetching = false,
                           containerClassName = '',
                           nestedTableProps
                       }: Props) => {

    const {t} = useTranslation()
    const [openedNestedId, setOpenedNestedId] = useState<string | null>(null)

    const handleChangeNestedOpen = (id: string) => {
        if (openedNestedId === id) setOpenedNestedId(null)
        else {
            setOpenedNestedId(id)
            if (nestedTableProps) nestedTableProps.handleNestedChange(parseInt(id))
        }

    }


    const tableRow = (item: DataType, isNested = false) => {
        return (
            <TableRow
                className={`${styles.tableRow} ${!isNested ? "border-b-none border-t " : "border-none"}  transition-none`}
                key={item.id}
                data-state={item.dataState && "selected"}
            >
                {
                    fields.map(field => {
                        if (field.type === 'select') {
                            return (<TableCell key={field.name} className={styles.tableCell}>
                                <Checkbox
                                    className={styles.checkbox}
                                    checked={item.checked}
                                    onCheckedChange={item.onCheckedChange}
                                />
                            </TableCell>)
                        } else {
                            return (
                                <TableCell key={field.name} className={`${styles.tableCell} `}
                                           align={field.align ? field.align : "left"}>
                                    {field.cellComponent
                                        ? field.cellComponent(item)
                                        : item[field.name]
                                    }
                                </TableCell>)
                        }
                    })
                }
            </TableRow>
        )
    }

    return (

        <div className={`${styles.container} border border-border ${containerClassName}`}>
            {!!header && header}
            <div className={`${styles.tableContainer} border border-border  dark:border-zinc-600`}>
                <Table>
                    <TableHeader>
                        <TableRow className={styles.tableRow}>
                            {
                                fields.map(field => {
                                    if (field.type === 'select') {
                                        return (<TableHead
                                            key={field.name}
                                            className={`${styles.tableHead} w-[${field.width}px] min-w-fit bg-accent text-primary`}
                                        >
                                            <Checkbox
                                                className={styles.checkbox}
                                                checked={field.checked ? true : (field.partiallyChecked && "indeterminate")}
                                                onCheckedChange={field.onCheckedChange}
                                                aria-label={field?.ariaLabel || ""}
                                            />
                                        </TableHead>)
                                    } else if (field.type === 'button') {
                                        return (<TableHead key={field.name}
                                                           className={`${styles.tableHead} w-[${field.width?.toString()}px] min-w-fit bg-accent text-primary`}
                                        >
                                            <Button

                                                className={'hover:bg-primary-foreground'}
                                                variant="ghost"
                                                onClick={field.onClick}
                                            >
                                                {field.text}
                                                <CaretSortIcon className="ml-2 h-4 w-4"/>
                                            </Button>
                                        </TableHead>)
                                    } else {
                                        return (<TableHead
                                            key={field.name}
                                            className={`${styles.tableHead} w-[${field.width}px] bg-accent  min-w-fit text-primary`}
                                        >
                                            {field.text}
                                        </TableHead>)
                                    }
                                })
                            }
                            {
                                !!nestedTableProps &&
                                <TableHead className={`${styles.tableHead} bg-accent  text-primary w-fit`}/>
                            }
                        </TableRow>
                    </TableHeader>
                    <TableBody className={''}>
                        {
                            (!isFetching && data?.length)
                                ? (data.map((item) => (
                                    (nestedTableProps) ?
                                        <React.Fragment key={item.id}>
                                            <TableRow
                                                className={`${styles.tableRow} transition-none w-full border-b-0 border-t`}
                                                key={item.id}
                                                data-state={item.dataState && "selected"}
                                            >
                                                {
                                                    fields.map(field => {
                                                        if (field.type === 'select') {
                                                            return (<TableCell key={field.name}
                                                                               className={styles.tableCell}>
                                                                <Checkbox
                                                                    className={styles.checkbox}
                                                                    checked={item.checked}
                                                                    onCheckedChange={item.onCheckedChange}
                                                                />
                                                            </TableCell>)
                                                        } else {
                                                            return (
                                                                <TableCell key={field.name}
                                                                           className={`${styles.tableCell} `}
                                                                           align={field.align ? field.align : "left"}>
                                                                    {field.cellComponent
                                                                        ? field.cellComponent(item)
                                                                        : item[field.name]
                                                                    }
                                                                </TableCell>)
                                                        }
                                                    })
                                                }

                                                <TableCell className={`${styles.tableCell} w-[50px]`}>
                                                    <div
                                                        className={'cursor-pointer'}
                                                        onClick={() => handleChangeNestedOpen(item.id.toString())}
                                                    >
                                                        <FaChevronDown
                                                            className={`${openedNestedId === item.id.toString() && "rotate-180"} transition-transform`}/>
                                                    </div>
                                                </TableCell>
                                            </TableRow>

                                            <tr className={''}
                                                key={`${item.id}acc`}
                                            >
                                                <TableCell colSpan={fields.length + 1} className={'p-0 border-none'}>
                                                    <Accordion key={item.id} type="single" collapsible
                                                               className="w-full  border-none"
                                                               value={openedNestedId === item.id.toString() ? "open" : ""}>
                                                        <AccordionItem value={'open'} className={'border-none w-full '}>
                                                            <AccordionContent className={' border-none p-0'}>
                                                                <SortableTable
                                                                    containerClassName={'p-1 border-none rounded-none gap-1'}
                                                                    {...nestedTableProps}
                                                                />
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    </Accordion>
                                                </TableCell>
                                            </tr>
                                        </React.Fragment>
                                        :
                                        tableRow(item)
                                )))
                                : (<TableRow className={styles.tableRow}>
                                    <TableCell
                                        colSpan={fields.length}
                                        className={`${styles.tableCell} text-center py-10 `}
                                    >
                                        {isFetching ? `${t('loading')}...` : t('no-result')}
                                    </TableCell>
                                </TableRow>)
                        }
                    </TableBody>
                </Table>

            </div>
            {
                pagination &&
                <div className={styles.paginationContainer}>
                    <Select

                        value={pagination.limit.toString()}
                        onValueChange={(value) => {
                            pagination.setPage(1)
                            pagination.setLimit(parseInt(value))
                        }}
                    >
                        <SelectTrigger className={'w-[130px] border-none bg-accent hover:bg-primary-foreground'}>
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent className={'bg-primary-foreground'}>
                            <SelectGroup>
                                <SelectLabel>{t("page-size")}</SelectLabel>
                                <SelectSeparator/>
                                <SelectItem
                                    value="10" defaultChecked>10 {t('per-page')}</SelectItem>
                                <SelectItem
                                    value="20" defaultChecked>20 {t('per-page')}</SelectItem>
                                <SelectItem
                                    value="30" defaultChecked>30 {t('per-page')}</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>


                    <div className={'flex border rounded-md'}>
                        <div
                            className={`${styles.pageInfo} text-primary`}
                        >
                            <p>
                                {pagination.page &&
                                    `${((pagination.page - 1) * pagination.limit) + 1} - ${pagination.page === pagination.pages ? pagination.total : pagination.page * pagination.limit} ${t('of')} ${pagination.total}`}
                            </p>
                        </div>

                        <Button
                            className={styles.prevButton}
                            variant="secondary"
                            size={'icon'}
                            onClick={() => {
                                if (pagination.page === 1) return;
                                pagination.setPage(pagination.page ? pagination.page - 1 : 1)
                            }}
                            disabled={pagination.page === 1}
                        >
                            <FaChevronLeft/>
                        </Button>
                        <Button
                            className={styles.nextButton}
                            variant="secondary"
                            size={'icon'}
                            onClick={() => {
                                if (pagination.pages === pagination.page) return;
                                pagination.setPage(pagination.page ? pagination.page + 1 : 1)
                            }}
                            disabled={pagination.pages === pagination.page}
                        >
                            <FaChevronRight/>
                        </Button>
                    </div>
                </div>
            }

        </div>

    )
        ;
};

export default SortableTable;


{/*<Table>*/
}
{/*    <TableHeader>*/
}
{/*        <TableRow className={styles.tableRow}>*/
}
{/*            <TableHead className={`${styles.tableHead}`}>*/
}
{/*                <Checkbox*/
}
{/*                    className={styles.checkbox}*/
}
{/*                    checked={*/
}
{/*                        selectedRows.length === data?.data?.length && data?.data?.length !== 0 ||*/
}
{/*                        (selectedRows.length > 0 && "indeterminate")*/
}
{/*                    }*/
}
{/*                    onCheckedChange={(value) => {*/
}
{/*                        if (!data?.data) return*/
}
{/*                        if (value) setSelectedRows(data?.data.map((user: UserData) => user.id))*/
}
{/*                        else setSelectedRows([])*/
}
{/*                    }}*/
}
{/*                    aria-label="Select all"*/
}
{/*                />*/
}
{/*            </TableHead>*/
}
{/*            <TableHead className={styles.tableHead}>*/
}
{/*                <Button*/
}
{/*                    className={styles.button}*/
}
{/*                    variant="ghost"*/
}
{/*                    onClick={() => {*/
}
{/*                        setOrderField('username')*/
}
{/*                        setSort(prev => {*/
}
{/*                            return prev === 'asc' ? "desc" : 'asc'*/
}
{/*                        })*/
}
{/*                    }}*/
}
{/*                >*/
}
{/*                    {t('username')}*/
}
{/*                    <CaretSortIcon className="ml-2 h-4 w-4"/>*/
}
{/*                </Button>*/
}
{/*            </TableHead>*/
}
{/*            <TableHead className={styles.tableHead}>*/
}
{/*                <Button*/
}
{/*                    className={styles.button}*/
}
{/*                    variant="ghost"*/
}
{/*                    onClick={() => {*/
}
{/*                        setOrderField('email')*/
}
{/*                        setSort(prev => {*/
}
{/*                            return prev === 'asc' ? "desc" : 'asc'*/
}
{/*                        })*/
}
{/*                    }}*/
}
{/*                >*/
}
{/*                    {t('email')}*/
}
{/*                    <CaretSortIcon className="ml-2 h-4 w-4"/>*/
}
{/*                </Button>*/
}
{/*            </TableHead>*/
}
{/*            <TableHead className={styles.tableHead}>*/
}
{/*                <Button*/
}
{/*                    className={styles.button}*/
}
{/*                    variant="ghost"*/
}
{/*                    onClick={() => {*/
}
{/*                        setOrderField('role')*/
}
{/*                        setSort(prev => {*/
}
{/*                            return prev === 'asc' ? "desc" : 'asc'*/
}
{/*                        })*/
}
{/*                    }}*/
}
{/*                >*/
}
{/*                    {t('role')}*/
}
{/*                    <CaretSortIcon className="ml-2 h-4 w-4"/>*/
}
{/*                </Button>*/
}
{/*            </TableHead>*/
}
{/*            <TableHead className={styles.tableHead}>*/
}
{/*                <Button*/
}
{/*                    className={styles.button}*/
}
{/*                    variant="ghost"*/
}
{/*                    onClick={() => {*/
}
{/*                        setOrderField('isActive')*/
}
{/*                        setSort(prev => {*/
}
{/*                            return prev === 'asc' ? "desc" : 'asc'*/
}
{/*                        })*/
}
{/*                    }}*/
}
{/*                >*/
}
{/*                    {t('status')}*/
}
{/*                    <CaretSortIcon className="ml-2 h-4 w-4"/>*/
}
{/*                </Button>*/
}
{/*            </TableHead>*/
}
{/*        </TableRow>*/
}
{/*    </TableHeader>*/
}
{/*    <TableBody>*/
}
{/*        {data?.data?.length ? (*/
}
{/*            data.data.map((user: UserData) => (*/
}
{/*                <TableRow*/
}
{/*                    className={styles.tableRow}*/
}
{/*                    key={user.id}*/
}
{/*                    data-state={selectedRows.find(email => email === user.id) && "selected"}*/
}
{/*                >*/
}
{/*                    <TableCell className={styles.tableCell}>*/
}
{/*                        <Checkbox*/
}
{/*                            className={styles.checkbox}*/
}
{/*                            checked={!!selectedRows.find(email => email === user.id)}*/
}
{/*                            onCheckedChange={(value) => {*/
}
{/*                                if (value) setSelectedRows(prev => ([...prev, user.id]))*/
}
{/*                                else setSelectedRows(prev => (prev.filter(email => email !== user.id)))*/
}
{/*                            }}*/
}
{/*                        />*/
}
{/*                    </TableCell>*/
}
{/*                    <TableCell className={styles.tableCell}>*/
}
{/*                        {user.username}*/
}
{/*                    </TableCell>*/
}
{/*                    <TableCell className={styles.tableCell}>*/
}
{/*                        {user.email}*/
}
{/*                    </TableCell>*/
}
{/*                    <TableCell className={styles.tableCell}>*/
}
{/*                        {getRoleName(user.role)}*/
}
{/*                    </TableCell>*/
}
{/*                    <TableCell className={styles.tableCell}>*/
}
{/*                        {user.isActive ? "Active" : "Banned"}*/
}
{/*                    </TableCell>*/
}
{/*                </TableRow>*/
}
{/*            ))*/
}
{/*        ) : (*/
}
{/*            <TableRow className={styles.tableRow}>*/
}
{/*                <TableCell*/
}
{/*                    colSpan={5}*/
}
{/*                    className={`${styles.tableCell} text-center py-10`}*/
}
{/*                >*/
}
{/*                    {t('no-result')}*/
}
{/*                </TableCell>*/
}
{/*            </TableRow>*/
}
{/*        )}*/
}
{/*    </TableBody>*/
}
{/*</Table>*/
}
