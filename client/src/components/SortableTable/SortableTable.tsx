import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {Button} from "@/components/ui/button.tsx";
import {CaretSortIcon} from "@radix-ui/react-icons";
import {useTranslation} from "react-i18next";
import {FaChevronLeft, FaChevronRight} from "react-icons/fa6";

import {
    Select,
    SelectContent,
    SelectGroup, SelectItem,
    SelectLabel,
    SelectSeparator,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select.tsx";
import {ReactNode} from "react";
import styles from './SortableTable.module.scss'


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
    };

type RequiredData = {
    id: string | number;
    dataState: boolean;
    checked?: boolean;
    onCheckedChange?: (value: boolean) => void;
}

type DataType = RequiredData & {
    [key: string]: any
}

type Pagination = | {
    enabled: false,
} | {
    enabled: true;
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
    pagination: Pagination,
    header?: ReactNode
}

const SortableTable = ({fields, data, pagination, header}: Props) => {
    const {t} = useTranslation()

    return (

        <div className={styles.container}>
            {!!header && header}
            <div className={styles.tableContainer}>
                <Table>
                    <TableHeader>
                        <TableRow className={styles.tableRow}>
                            {
                                fields.map(field => {
                                    if (field.type === 'select') {
                                        return (<TableHead
                                            key={field.name}
                                            className={`${styles.tableHead} w-[${field.width}px]  min-w-fit`}
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
                                                           className={`${styles.tableHead} w-[${field.width?.toString()}px]  min-w-fit`}
                                        >
                                            <Button
                                                className={styles.button}
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
                                            className={`${styles.tableHead} w-[${field.width}px]  min-w-fit`}
                                        >
                                            {field.text}
                                        </TableHead>)
                                    }
                                })

                            }

                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            data?.length
                                ? (data.map((item) => (
                                    <TableRow
                                        className={styles.tableRow}
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
                                                    return (<TableCell key={field.name} className={styles.tableCell}
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
                                )))
                                : (<TableRow className={styles.tableRow}>
                                    <TableCell
                                        colSpan={fields.length}
                                        className={`${styles.tableCell} text-center py-10`}
                                    >
                                        {t('no-result')}
                                    </TableCell>
                                </TableRow>)
                        }
                    </TableBody>
                </Table>

            </div>
            {
                pagination.enabled &&
                <div className={styles.paginationContainer}>
                    <Select
                        value={pagination.limit.toString()}
                        onValueChange={(value) => {
                            pagination.setPage(1)
                            pagination.setLimit(parseInt(value))
                        }}
                    >
                        <SelectTrigger className={'w-[130px] border-none bg-zinc-800 text-zinc-100 hover:bg-zinc-600 '}>
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent className={'bg-zinc-800 border-zinc-600 text-zinc-100'}>
                            <SelectGroup>
                                <SelectLabel>{t("page-size")}</SelectLabel>
                                <SelectSeparator className={'bg-zinc-600'}/>
                                <SelectItem className={'text-zinc-200 focus:bg-zinc-600 focus:text-zinc-100'}
                                            value="10" defaultChecked>10 {t('per-page')}</SelectItem>
                                <SelectItem className={'text-zinc-200 focus:bg-zinc-600 focus:text-zinc-100'}
                                            value="20" defaultChecked>20 {t('per-page')}</SelectItem>
                                <SelectItem className={'text-zinc-200 focus:bg-zinc-600 focus:text-zinc-100'}
                                            value="30" defaultChecked>30 {t('per-page')}</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>


                    <div className={'flex'}>
                        <div
                            className={styles.pageInfo}
                        >
                            <p>
                                {pagination.page &&
                                    `${((pagination.page - 1) * pagination.limit) + 1} - ${pagination.page === pagination.pages ? pagination.total : pagination.page * pagination.limit} ${t('of')} ${pagination.total}`}
                            </p>
                        </div>

                        <Button
                            className={styles.prevButton}
                            variant="outline"
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
                            variant="outline"
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
