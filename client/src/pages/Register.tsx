import React, {useEffect, useRef, useState} from "react";
import {Check, Info, X} from "lucide-react";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Link} from "react-router-dom";
import {LOGIN_ROUTE} from "@/utils/consts.ts";
import {ApiErrorResponse} from "@/types";
import {useGoogleLoginMutation, useRegisterMutation} from "@/features/auth/authApiSlice.ts";
import {ReloadIcon} from "@radix-ui/react-icons";
import toast from "react-hot-toast";
import googleLogo from "@/assets/google-logo.png";

const USER_REGEX = /.+/
const PWD_REGEX = /.{3,8}/
const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const Register = () => {
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
    }, [user, password, matchPassword, email]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const isUserValid = USER_REGEX.test(user)
        const isPasswordValid = PWD_REGEX.test(password)
        const isEmailValid = EMAIL_REGEX.test(email)

        if (!isUserValid || !isPasswordValid || !isEmailValid) {
            setErrMsg('Invalid entry')
            return;
        }



        try {
            await register({username: user, email, password}).unwrap()
            setUser('')
            setEmail('')
            setPassword('')
            setMatchPassword('')
            toast.success('You successfully registered!\nYou can login now!')
        } catch (err) {
            console.log(err)
            const error = err as ApiErrorResponse

            if (!error.status) {
                setErrMsg('No Server Response');
            } else if (error.status === 400) {
                setErrMsg(error.data.message);
            } else if (error.status === 401) {
                setErrMsg(error.data.message);
            } else {
                setErrMsg('Register Failed');
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


            <div className={'w-full max-w-[400px] flex flex-col bg-primary rounded-xl p-6 text-slate-200'}>
                <p
                    aria-live={'assertive'}
                    ref={errRef}
                    className={`${errMsg ? "block" : 'hidden'} gap-2 bg-red-900 rounded p-2 mb-2`}
                >

                    {errMsg}
                </p>

                <h1 className={'text-left text-2xl mb-4'}>
                    Sign Up
                </h1>
                <form
                    onSubmit={handleSubmit}
                    className={'flex flex-col '}
                >
                    <label
                        htmlFor={'username'}
                        className={'flex gap-2 mb-1'}
                    >
                        Username:
                        <span className={`${validName ? 'block' : 'hidden'}`}>
                        <Check color={'green'}/>
                    </span>
                        <span className={`${validName || !user ? 'hidden' : 'block'}`}>
                        <X color={'red'}/>
                    </span>
                    </label>
                    <Input
                        className={'mb-4 bg-primary-foreground text-primary'}
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
                        More than one character.
                    </p>

                    <label
                        htmlFor={'email'}
                        className={'flex gap-2 mb-1'}
                    >
                        Email:
                        <span className={`${validEmail ? 'block' : 'hidden'}`}>
                        <Check color={'green'}/>
                    </span>
                        <span className={`${validEmail || !email ? 'hidden' : 'block'}`}>
                        <X color={'red'}/>
                    </span>
                    </label>
                    <Input
                        className={'mb-4 bg-primary-foreground text-primary'}
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
                        To register, please provide a valid email address. It must consist of two parts, separated by
                        the '@' symbol: username (any Latin letters, numbers and some symbols) and domain (e.g.
                        gmail.com, yandex.ru).
                    </p>


                    <label
                        htmlFor={'password'}
                        className={'flex gap-2 mb-1'}
                    >
                        Password:
                        <span className={`${validPassword ? 'block' : 'hidden'}`}>
                        <Check color={'green'}/>
                    </span>
                        <span className={`${validPassword || !password ? 'hidden' : 'block'}`}>
                        <X color={'red'}/>
                    </span>
                    </label>
                    <Input
                        className={'mb-4 bg-primary-foreground text-primary'}
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
                        <Info size={15} className={'flex-shrink-0'}/>
                        3 to 8 characters.
                    </p>


                    <label
                        htmlFor={'matchPassword'}
                        className={'flex gap-2 mb-1'}
                    >
                        Confirm Password:
                        <span className={`${validMatchPassword && matchPassword ? 'block' : 'hidden'}`}>
                        <Check color={'green'}/>
                    </span>
                        <span className={`${validMatchPassword || !matchPassword ? 'hidden' : 'block'}`}>
                        <X color={'red'}/>
                    </span>
                    </label>
                    <Input
                        className={'mb-4 bg-primary-foreground text-primary'}
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
                        Must match the first password input field.
                    </p>

                    <Button
                        disabled={(!validName || !validPassword || !validMatchPassword) || isLoading}
                        className={'mt-4'}
                        variant={'secondary'}
                    >
                        {
                            isLoading
                                ? (<>
                                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin"/>
                                    Processing
                                </>)
                                : "Sign up"
                        }
                    </Button>

                    <div className={'flex items-center gap-3 my-4'}>
                        <hr className={'w-full border-slate-500'}/>
                        or
                        <hr className={'w-full border-slate-500'}/>
                    </div>

                    <Button
                        type={'button'}
                        variant={'secondary'}
                        className={'mb-2 flex items-center gap-4'}
                        onClick={handleGoogleAuth}
                    >
                        <img
                            alt={'google'}
                            src={googleLogo}
                            className={'h-full'}
                        />
                        Sing up with Google
                    </Button>
                </form>

                <p className={'mt-4 text-sm flex gap-2 justify-center'}>
                    Already registered?
                    <span className={'underline'}>
                    <Link to={LOGIN_ROUTE}>
                        Sign In
                    </Link>
                </span>
                </p>


            </div>
        </section>
    );
};

export default Register;
