import {useTranslation} from "react-i18next";
import {useCreateTemplateMutation} from "@/features/templates/templatesApiSlice.ts";
import {ApiErrorResponse} from "@/types";
import toast from "react-hot-toast";
import TemplateForm from "@/components/TemplateForm.tsx";



const CreateTemplate = () => {
    const {t} = useTranslation()
    const [createTemplate] = useCreateTemplateMutation()

    const handleSubmit = async (body: FormData) => {
        try {
            console.log('sending')
            await toast.promise(
                createTemplate(body).unwrap(),
                {
                    loading: 'Saving...',
                    success: <>Template successfully created!</>,
                    error: <>Error when creating template.</>,
                }
            )
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

    return (
        <TemplateForm
            submitButtonText={t('publish')}
            handleSubmit={handleSubmit}
        />
    );
};

export default CreateTemplate;
