
import {TemplateData} from "@/types";
import {TooltipProvider} from "@/components/ui/tooltip.tsx";
import TemplateCard from "@/components/TemplateCard.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";

type Props ={
    data: {
        data: TemplateData[];
        page: number;
        pages: number;
        total: number;
        limit: number;
    } | undefined,
    label?: string;
    handleLoadMore?: (page: number) => void;
    isLoading: boolean;
}

const TemplatesGrid = ({data, label, handleLoadMore, isLoading}: Props) => {
    const [page, setPage] = useState(data?.page || 1);
    const {t} = useTranslation()

    useEffect(() => {
        if(handleLoadMore) handleLoadMore(page)
    }, [page]);

    return (
        <div className={'flex flex-col gap-2 md:gap-3 2xl:gap-4 '}>
            {
                label &&
                <h1 className={'text-primary text-base md:text-xl'}>{label}</h1>
            }

            {
                data?.data?.length ?
                    <>
                        <ul className={'w-full grid gap-2 md:gap-3 2xl:gap-4 grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 '}>
                            <TooltipProvider>
                                {
                                    data?.data?.map(template =>
                                        <TemplateCard key={template.id} template={template}/>
                                    )
                                }
                            </TooltipProvider>
                        </ul>
                        {
                            handleLoadMore && data && (data.pages > data.page) &&
                            <Button
                                disabled={isLoading}
                                className={'w-fit'}
                                variant={'secondary'}
                                onClick={() => {
                                    if (!data) return
                                    if (data?.pages > data?.page) {
                                        setPage(data?.page + 1)
                                    }
                                }}
                            >
                                {isLoading ? t('loading') : t("see-more")}...
                            </Button>
                        }
                    </>
                    :
                    <div className={'w-full bg-accent rounded-md px-2 p-4 text-center'}>
                        {
                            isLoading ? `${t('loading')}...` :  t('no-results')
                        }

                    </div>
            }


        </div>
    );
};

export default TemplatesGrid;
