import {Navigate, useNavigate, useParams} from "react-router-dom";
import {HOME_ROUTE} from "@/utils/routes.ts";
import {useGetTemplateByIdQuery, useUpdateTemplateMutation} from "@/features/templates/templatesApiSlice.ts";
import {useSelector} from "react-redux";
import {selectAuthState} from "@/features/auth/authSlice.ts";
import {useEffect} from "react";
import Roles from "@/utils/roles.ts";
import {useTranslation} from "react-i18next";
import toast from "react-hot-toast";
import TemplateForm from "@/components/TemplateForm.tsx";
import Loading from "@/components/Loading.tsx";
import catchApiErrors from "@/utils/catch-api-errors.ts";

const EditTemplate = () => {
    const {id} = useParams()
    const navigate = useNavigate()

    if (!id || isNaN(parseInt(id))) {
        return <Navigate to={HOME_ROUTE} replace/>
    }

    const {data, refetch, isLoading} = useGetTemplateByIdQuery({id: parseInt(id)})

    const authState = useSelector(selectAuthState)

    useEffect(() => {
        if (isLoading) return;
        if (!data) {
            navigate(HOME_ROUTE)
        }
        if (authState.role === Roles.Admin) return;
        if (data?.user.id !== authState?.id) {
            navigate(HOME_ROUTE)
        }
    }, [authState?.id, data, isLoading]);


    const {t} = useTranslation()
    const [updateTemplate] = useUpdateTemplateMutation()

    const handleSubmit = async (body: FormData) => {
        try {
            for (const [key, value] of body.entries()) {
                console.log(`${key}: ${value}`);
            }

            await toast.promise(
                updateTemplate({body, templateId: data?.id}).unwrap(),
                {
                    loading: `${t('saving')}...`,
                    success: <>{t('action-successfully-completed')}</>,
                    error: <>{t("error-occurred")}</>,
                }
            )
            refetch()
        } catch (err) {
            catchApiErrors(err, t)
        }
    }

    return (
        <>
            {
                isLoading ?
                    <Loading/>
                    :
                    <section className={'p-4 pt-[72px] md:pt-4 flex flex-col gap-4'}>
                        <TemplateForm
                            submitButtonText={"Update"}
                            existingData={data}
                            handleSubmit={handleSubmit}
                        />
                    </section>
            }
        </>


    );

};

export default EditTemplate;
