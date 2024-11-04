import {useTranslation} from "react-i18next";
import {useCreateTemplateMutation} from "@/features/templates/templatesApiSlice.ts";
import toast from "react-hot-toast";
import TemplateForm from "@/components/TemplateForm.tsx";
import {HOME_ROUTE} from "@/utils/routes.ts";
import {useNavigate} from "react-router-dom";
import catchApiErrors from "@/utils/catch-api-errors.ts";

const CreateTemplate = () => {
    const {t} = useTranslation()
    const [createTemplate] = useCreateTemplateMutation()
    const navigate = useNavigate()

    const handleSubmit = async (body: FormData) => {
        try {
            await toast.promise(
                createTemplate(body).unwrap(),
                {
                    loading: `${t('saving')}...`,
                    success: <>{t('action-successfully-completed')}</>,
                    error: <>{t("error-occurred")}</>,
                }
            )
            navigate(HOME_ROUTE)
        } catch (err) {
            catchApiErrors(err, t)
        }
    }

    return (
        <section className={'p-4 pt-[72px] md:pt-4 flex flex-col gap-4'}>
            <h1 className={'text-base text-center md:text-xl md:text-left'}>{t('create-your-template')}</h1>
            <TemplateForm
                submitButtonText={t('publish')}
                handleSubmit={handleSubmit}
            />



        </section>

    );
};

export default CreateTemplate;
