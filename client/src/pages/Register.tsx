import React, {useEffect, useRef, useState} from "react";
import {Check, Info, X} from "lucide-react";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Link} from "react-router-dom";
import {LOGIN_ROUTE} from "@/utils/routes.ts";
import {ApiErrorResponse} from "@/types";
import {useGoogleLoginMutation, useRegisterMutation} from "@/features/auth/authApiSlice.ts";
import {ReloadIcon} from "@radix-ui/react-icons";
import toast from "react-hot-toast";
import googleLogo from "@/assets/google-logo.png";
import {useTranslation} from "react-i18next";
import ResponseErrorCodes from "@/utils/response-error-codes.ts";

const USER_REGEX = /.+/
const PWD_REGEX = /.{3,8}/
const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const Register = () => {
    const {t, i18n} = useTranslation()
    const userRef = useRef<HTMLInputElement>(null);
    const errRef = useRef<HTMLParagraphElement>(null);
    const [register, {isLoading}] = useRegisterMutation()
    const [googleLogin] = useGoogleLoginMutation()

    const [user, setUser] = useState<string>('')
    const [validName, setValidName] = useState<boolean>(false);
    const [userFocus, setUserFocus] = useState<boolean>(false);

    const [email, setEmail] = useState<string>('')
    const [validEmail, setValidEmail] = useState<boolean>(false);
    const [emailFocus, setEmailFocus] = useState<boolean>(false);

    const [password, setPassword] = useState<string>('')
    const [validPassword, setValidPassword] = useState<boolean>(false);
    const [passwordFocus, setPasswordFocus] = useState<boolean>(false);

    const [matchPassword, setMatchPassword] = useState<string>('')
    const [validMatchPassword, setValidMatchPassword] = useState<boolean>(false);
    const [matchPasswordFocus, setMatchPasswordFocus] = useState<boolean>(false);

    const [errMsg, setErrMsg] = useState<string>('');

    useEffect(() => {
        userRef.current?.focus();
    }, [])

    useEffect(() => {
        const result = USER_REGEX.test(user)
        setValidName(result)
    }, [user]);

    useEffect(() => {
        const result = EMAIL_REGEX.test(email)
        setValidEmail(result)
    }, [email]);

    useEffect(() => {
        const result = PWD_REGEX.test(password)
        setValidPassword(result)

        const match = password === matchPassword
        setValidMatchPassword(match)
    }, [password, matchPassword]);

    useEffect(() => {
        setErrMsg('')
    }, [user, password, matchPassword, email, i18n.language]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const isUserValid = USER_REGEX.test(user)
        const isPasswordValid = PWD_REGEX.test(password)
        const isEmailValid = EMAIL_REGEX.test(email)

        if (!isUserValid || !isPasswordValid || !isEmailValid) {
            setErrMsg(t('invalid-entry'))
            return;
        }



        try {
            await register({username: user, email, password}).unwrap()
            setUser('')
            setEmail('')
            setPassword('')
            setMatchPassword('')
            toast.success(t('registration-success'))
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
                    case ResponseErrorCodes.ValidationFailed.username:
                        msg = t('validation-failed-username')
                        break;
                    case ResponseErrorCodes.UserAlreadyExist:
                        msg = t('user-already-exist', {email})
                        break;
                }
                setErrMsg(msg);
            } else {
                setErrMsg(t('register-failed'));
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


            <div className={'w-full max-w-[400px] flex flex-col border bg-accent rounded-xl p-6'}>
                <p
                    aria-live={'assertive'}
                    ref={errRef}
                    className={`${errMsg ? "block" : 'hidden'} gap-2 bg-red-900 rounded p-2 mb-2`}
                >
                    {errMsg}
                </p>

                <h1 className={'text-left text-2xl mb-4'}>
                    {t('register-title')}
                </h1>
                <form
                    onSubmit={handleSubmit}
                    className={'flex flex-col '}
                >
                    <label
                        htmlFor={'username'}
                        className={'flex gap-2 mb-1'}
                    >
                        {t('username')}:
                        <span className={`${validName ? 'block' : 'hidden'}`}>
                        <Check color={'green'}/>
                    </span>
                        <span className={`${validName || !user ? 'hidden' : 'block'}`}>
                        <X color={'red'}/>
                    </span>
                    </label>
                    <Input
                        className={'mb-4 bg-primary-foreground'}
                        type='text'
                        id='username'
                        ref={userRef}
                        value={user}
                        autoComplete='off'
                        onChange={(e) => setUser(e.target.value)}
                        required
                        aria-invalid={validName ? 'false' : 'true'}
                        aria-describedby={'uidnote'}
                        onFocus={() => setUserFocus(true)}
                        onBlur={() => setUserFocus(false)}
                    />
                    <p
                        id='uidnote'
                        className={`${userFocus && user && !validName ? 'block' : 'hidden'}
                            bg-primary-foreground flex items-center gap-2 p-2 text-sm rounded text-red-500 mb-4
                    `}
                    >
                        <Info size={15} className={'flex-shrink-0'}/>
                        {t('username-requirements')}
                    </p>

                    <label
                        htmlFor={'email'}
                        className={'flex gap-2 mb-1'}
                    >
                        {t('email')}:
                        <span className={`${validEmail ? 'block' : 'hidden'}`}>
                        <Check color={'green'}/>
                    </span>
                        <span className={`${validEmail || !email ? 'hidden' : 'block'}`}>
                        <X color={'red'}/>
                    </span>
                    </label>
                    <Input
                        className={'mb-4 bg-primary-foreground'}
                        type='email'
                        id='email'
                        value={email}
                        autoComplete='off'
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        aria-invalid={validEmail ? 'false' : 'true'}
                        aria-describedby={'emailnote'}
                        onFocus={() => setEmailFocus(true)}
                        onBlur={() => setEmailFocus(false)}
                    />
                    <p
                        id='emailnote'
                        className={`${emailFocus && email && !validEmail ? 'block' : 'hidden'}
                    bg-primary-foreground flex items-center gap-2 p-2 text-sm rounded text-red-500 mb-4
                    `}
                    >
                        <Info size={15} className={'flex-shrink-0'}/>
                        {t('email-requirements')}
                    </p>


                    <label
                        htmlFor={'password'}
                        className={'flex gap-2 mb-1'}
                    >
                        {t('password')}:
                        <span className={`${validPassword ? 'block' : 'hidden'}`}>
                        <Check color={'green'}/>
                    </span>
                        <span className={`${validPassword || !password ? 'hidden' : 'block'}`}>
                        <X color={'red'}/>
                    </span>
                    </label>
                    <Input
                        className={'mb-4 bg-primary-foreground'}
                        type='password'
                        id='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        aria-invalid={validPassword ? 'false' : 'true'}
                        aria-describedby={'pwdnote'}
                        onFocus={() => setPasswordFocus(true)}
                        onBlur={() => setPasswordFocus(false)}
                    />
                    <p
                        id='pwdnote'
                        className={`${passwordFocus && password && !validPassword ? 'block' : 'hidden'}
                    bg-primary-foreground flex items-center gap-2 p-2 text-sm rounded text-red-500 mb-4
                    `}
                    >
                        <Info size={15} className={'flex-shrink-0 float'}/>
                        {t('password-requirements')}
                    </p>


                    <label
                        htmlFor={'matchPassword'}
                        className={'flex gap-2 mb-1'}
                    >
                        {t('confirm-password')}:
                        <span className={`${validMatchPassword && matchPassword ? 'block' : 'hidden'}`}>
                        <Check color={'green'}/>
                    </span>
                        <span className={`${validMatchPassword || !matchPassword ? 'hidden' : 'block'}`}>
                        <X color={'red'}/>
                    </span>
                    </label>
                    <Input
                        className={'mb-4 bg-primary-foreground'}
                        type='password'
                        id='matchPassword'
                        value={matchPassword}
                        onChange={(e) => setMatchPassword(e.target.value)}
                        required
                        aria-invalid={validMatchPassword ? 'false' : 'true'}
                        aria-describedby={'matchnote'}
                        onFocus={() => setMatchPasswordFocus(true)}
                        onBlur={() => setMatchPasswordFocus(false)}
                    />
                    <p
                        id='matchnote'
                        className={`${matchPasswordFocus && !validMatchPassword ? 'block' : 'hidden'}
                    bg-primary-foreground flex items-center gap-2 p-2 text-sm rounded text-red-500 mb-4
                    `}
                    >
                        <Info size={15} className={'flex-shrink-0'}/>
                        {t('confirm-password-requirements')}
                    </p>

                    <Button
                        disabled={(!validName || !validPassword || !validMatchPassword) || isLoading}
                        className={'mt-4'}
                        variant={'default'}
                    >
                        {
                            isLoading
                                ? (<>
                                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin"/>
                                    {t('processing')}
                                </>)
                                : t('sign-up')
                        }
                    </Button>

                    <div className={'flex items-center gap-3 my-4'}>
                        <hr className={'w-full border-zinc-600'}/>
                        {t('or')}
                        <hr className={'w-full border-zinc-600'}/>
                    </div>

                    <Button
                        type={'button'}
                        variant={'default'}
                        className={'mb-2 flex items-center gap-4'}
                        onClick={handleGoogleAuth}
                    >
                        <img
                            alt={'google'}
                            src={googleLogo}
                            className={'h-full'}
                        />
                        {t('sign-up-with-google')}
                    </Button>
                </form>

                <p className={'mt-4 text-sm flex gap-2 justify-center'}>
                    {t('have-account-question')}
                    <span className={'underline'}>
                    <Link to={LOGIN_ROUTE}>
                        {t('sign-in')}
                    </Link>
                </span>
                </p>


            </div>
        </section>
    );
};

export default Register;
