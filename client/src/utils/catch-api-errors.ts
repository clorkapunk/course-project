import {ApiErrorResponse} from "@/types";
import toast from "react-hot-toast";
import {TFunction} from "i18next";
import ResponseErrorCodes from "@/utils/response-error-codes.ts";

export default function catchApiErrors(err: unknown, t: TFunction){
    const error = err as ApiErrorResponse
    if (!error?.data) {
        toast.error(t("no-server-response"))
    } else if (error?.status === 204) {

    } else if (error?.status === 400) {
        let msg = t('unexpected-error')
        switch (error.data.code){
            case ResponseErrorCodes.ValidationFailed.email:
                msg = t('validation-failed-email')
                break;
            case ResponseErrorCodes.ValidationFailed.password:
                msg = t('validation-failed-password')
                break;
            case ResponseErrorCodes.UserNotExist:
                msg = t('user-not-exist')
                break;
            case ResponseErrorCodes.UserAlreadyExist:
                msg = t('user-already-exists')
                break;
            case ResponseErrorCodes.UserRegisteredViaExternalService:
                msg = t('user-registered-via-external-service')
                break;
            case ResponseErrorCodes.WrongPassword:
                msg = t('wrong-password')
                break;
        }
        toast.error(msg);
    } else if (error?.status === 401) {
        toast.error(t('unauthorized'))
    } else if (error?.status === 455) {
        toast.error(t('user-banned'))
    } else {
        toast.error(t('unexpected-end'))
    }
}
