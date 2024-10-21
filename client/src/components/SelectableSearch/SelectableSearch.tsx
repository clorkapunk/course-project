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
    searchField: string;
    setSearchField: (value: string) => void;
    fields: Field[];
    searchString: string;
    setSearchString: (value: string) => void;
}

const SelectableSearch = ({searchField, setSearchField, fields, searchString, setSearchString}: Props) => {
    const {t} = useTranslation()

    return (
        <div className={styles.searchContainer}>
            <Select value={searchField} onValueChange={(value) => setSearchField(value)}>
                <SelectTrigger
                    className={`${styles.select} w-[180px] border-none bg-zinc-800 text-zinc-100 hover:bg-zinc-600`}>
                    <SelectValue/>
                </SelectTrigger>
                <SelectContent className={'bg-zinc-800 border-zinc-600 text-zinc-100 '}>
                    <SelectGroup>
                        <SelectLabel>{t("search-by")}</SelectLabel>
                        <SelectSeparator className={'bg-zinc-600'}/>
                        {
                            fields.map(field =>
                                <SelectItem
                                    key={field.value}
                                    className={'text-zinc-200 focus:bg-zinc-600 focus:text-zinc-100'}
                                    value={field.value}
                                    defaultChecked>{field.label}</SelectItem>
                            )
                        }
                    </SelectGroup>
                </SelectContent>
            </Select>
            <Input
                className={styles.input}
                type={'text'}
                value={searchString}
                onChange={(e) => setSearchString(e.target.value)}
                placeholder={t(`search-by-${searchField}`)}
            />
        </div>
    );
};

export default SelectableSearch;
