import {ApiErrorResponse} from "@/types";
import toast from "react-hot-toast";
import {TFunction} from "i18next";

export default function catchApiErrors(err: unknown, t: TFunction){
    const error = err as ApiErrorResponse
    if (!error?.data) {
        toast.error(t("no-server-response"))
    } else if (error?.status === 204) {

    } else if (error?.status === 400) {
        toast.error(t('invalid-data'))
    } else if (error?.status === 401) {
        toast.error(t('unauthorized'))
    } else if (error?.status === 455) {
        toast.error(t('user-banned'))
    } else {
        toast.error(t('unexpected-end'))
    }
}
