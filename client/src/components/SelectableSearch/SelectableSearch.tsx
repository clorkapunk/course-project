import styles from "./SelectableSearch.module.scss";
import {
    Select,
    SelectContent,
    SelectGroup, SelectItem,
    SelectLabel,
    SelectSeparator,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select.tsx";
import {Input} from "@/components/ui/input.tsx";
import {useTranslation} from "react-i18next";

type Field = {
    value: string;
    label: string;
}

type Props ={
    searchBy: string;
    setSearchBy: (value: string) => void;
    setSearch: (value: string) => void;
    search: string;
    fields: Field[];
}

const SelectableSearch = ({searchBy, setSearchBy, fields, search, setSearch}: Props) => {
    const {t} = useTranslation()

    return (
        <div className={styles.searchContainer}>
            <Select value={searchBy} onValueChange={(value) => setSearchBy(value)}>
                <SelectTrigger
                    className={`${styles.select} w-[180px] h-full border-none bg-accent hover:bg-primary-foreground`}>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent className={'bg-primary-foreground'}>
                    <SelectGroup>
                        <SelectLabel>{t("search-by")}</SelectLabel>
                        <SelectSeparator/>
                        {
                            fields.map(field =>
                                <SelectItem
                                    key={field.value}
                                    value={field.value}
                                    defaultChecked>{field.label}</SelectItem>
                            )
                        }
                    </SelectGroup>
                </SelectContent>
            </Select>
            <Input
                className={`${styles.input} bg-accent`}
                type={'text'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t(`search-by-${searchBy}`)}
            />
        </div>
    );
};

export default SelectableSearch;
