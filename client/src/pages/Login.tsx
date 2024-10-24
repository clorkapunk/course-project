import {Link, useLocation, useNavigate} from "react-router-dom";
import {HOME_ROUTE, REGISTER_ROUTE} from "@/utils/routes.ts";
import React, {useEffect, useRef, useState} from "react";
import useInput from "@/hooks/useInput.ts";
import useToggle from "@/hooks/useToggle.ts";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useGoogleLoginMutation, useLoginMutation} from "@/features/auth/authApiSlice.ts";
import {useDispatch} from "react-redux";
import {setCredentials} from "@/features/auth/authSlice.ts";
import {ApiErrorResponse} from "@/types";
import {ReloadIcon} from "@radix-ui/react-icons";
import googleLogo from '@/assets/google-logo.png'
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {FaCircleExclamation} from "react-icons/fa6";
import {useTranslation} from "react-i18next";
import ResponseErrorCodes from "@/utils/response-error-codes.ts";

const Login = () => {
    const {t, i18n} = useTranslation()
    const navigate = useNavigate()
    const location = useLocation()
    const from = location.state?.from.pathname || HOME_ROUTE

    const [login, {isLoading}] = useLoginMutation()
    const [googleLogin] = useGoogleLoginMutation()
    const dispatch = useDispatch()

    const userRef = useRef<HTMLInputElement>(null);
    const errRef = useRef<HTMLParagraphElement>(null)

    const [email, resetEmail, emailAttribs] = useInput('email', '')
    const [password, setPassword] = useState<string>('')
    const [errMsg, setErrMsg] = useState<string>('')
    const [check, toggleCheck] = useToggle('persist', false)

    useEffect(() => {
        userRef.current?.focus()
    }, [])

    useEffect(() => {
        setErrMsg('')
    }, [email, password, i18n.language])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!email || !password) {
            setErrMsg(t('invalid-entry'))
            return;
        }

        try {
            const response = await login({email, password}).unwrap()
            dispatch(setCredentials({accessToken: response.accessToken}))
            resetEmail()
            setPassword('')
            navigate(from, {replace: true});
        } catch (err) {

            const error = err as ApiErrorResponse

            if (!error.data) {
                setErrMsg(t('no-server-response'));
            } else if (error.status === 400) {
                let msg = t('unexpected-error')
                switch (error.data.code){
                    case ResponseErrorCodes.ValidationFailed.email:
                        msg = t('validation-failed-email')
                        break;
                    case ResponseErrorCodes.ValidationFailed.password:
                        msg = t('validation-failed-password')
                        break;
                    case ResponseErrorCodes.UserNotExist:
                        msg = t('user-not-exist', {email})
                        break;
                    case ResponseErrorCodes.UserRegisteredViaExternalService:
                        msg = t('user-registered-via-external-service', {email})
                        break;
                    case ResponseErrorCodes.WrongPassword:
                        msg = t('wrong-password')
                        break;
                }
                setErrMsg(msg);
            } else {
                setErrMsg(t('login-failed'));
            }
            errRef.current?.focus();
        }


    }

    const handleGoogleAuth = async () => {
        const response = await googleLogin({}).unwrap()
        window.location.href = response.url
    }

    return (
        <section className={'h-screen flex items-center justify-center'}>
            <div className={'w-full max-w-[400px] flex flex-col rounded-xl border p-3 md:p-6 bg-accent'}>
                <p
                    aria-live={'assertive'}
                    ref={errRef}
                    className={`${errMsg ? "block" : 'hidden'} gap-2 bg-red-900 rounded p-2 mb-2`}
                >
                    <FaCircleExclamation className={'flex-shrink-0 float-left mt-1 mr-2'}/>
                    {errMsg}
                </p>

                <h1 className={'text-left text-2xl mb-4'}>
                    {t("login-title")}
                </h1>
                <form
                    onSubmit={handleSubmit}
                    className={'flex flex-col'}
                >
                    <label
                        htmlFor={'email'}
                        className={'mb-1'}
                    >
                        {t("email")}:
                    </label>
                    <Input
                        className={'mb-4 bg-primary-foreground'}
                        type='email'
                        id='email'
                        ref={userRef}
                        autoComplete='off'
                        {...emailAttribs}
                        required
                    />

                    <label
                        htmlFor={'password'}
                        className={'mb-1'}
                    >
                        {t("password")}:
                    </label>
                    <Input
                        className={'mb-4 bg-primary-foreground'}
                        type='password'
                        id='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <Button
                        type={'submit'}
                        disabled={(!email || !password) || isLoading}
                        className={'mt-4'}

                    >
                        {
                            isLoading
                                ? (<>
                                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin"/>
                                    {t("processing")}
                                </>)
                                :  t("sign-in")
                        }
                    </Button>

                    <div className={'flex items-center gap-3 my-4'}>
                        <hr className={'w-full border-zinc-600'}/>
                        {t("or")}
                        <hr className={'w-full border-zinc-600'}/>
                    </div>

                    <Button
                        type={'button'}
                        className={'mb-2 flex items-center gap-4'}
                        onClick={handleGoogleAuth}

                    >
                       <img
                           alt={'google'}
                           src={googleLogo}
                           className={'h-full'}
                       />
                        {t("sign-in-with-google")}
                    </Button>

                    <div className={'flex items-center gap-2 mt-4'}>
                        <Checkbox
                            className={'flex items-center justify-center  border-primary-foreground'}
                            id={'persist'}
                            onCheckedChange={(e) => {
                                toggleCheck(e as boolean)
                            }}
                            checked={check}
                        />
                        <label>
                            {t("trust-this-device")}
                        </label>
                    </div>
                </form>





                <p className={'mt-4 text-sm flex gap-2 justify-center'}>
                    {t("no-account-question")}
                    <span className={'underline'}>
                    <Link to={REGISTER_ROUTE}>
                             {t('sign-up')}
                    </Link>
                </span>
                </p>

            </div>
        </section>
    )
};

export default Login;
