import {Navigate, useLocation} from "react-router-dom";
import {HOME_ROUTE} from "@/utils/routes.ts";
import {useEffect, useRef, useState} from "react";
import Loading from "@/components/Loading.tsx";
import {useDispatch} from "react-redux";
import {setCredentials} from "@/features/auth/authSlice.ts";
import {useGoogleAuthMutation} from "@/features/auth/authApiSlice.ts";

const OAuthGoogleCallback = () => {
    const effectRan = useRef(false)
    const location = useLocation()
    const code = new URLSearchParams(location.search).get('code');
    const [isLoading, setIsLoading] = useState(true)
    const [googleAuth] = useGoogleAuthMutation()
    const dispatch = useDispatch()


    useEffect(() => {

        if(!effectRan.current){
            const authWithGoogleCode = async (code: string) => {
                try {
                    const response = await googleAuth({code}).unwrap();
                    dispatch(setCredentials({accessToken: response.accessToken}))
                } catch (err) {
                    console.log(err)
                } finally {
                    setIsLoading(false)
                }
            }

            if (code) {
                authWithGoogleCode(code)
            } else {
                setIsLoading(false)
            }


            return () => {
                effectRan.current = true
            }
        }



    }, []);

    return (
        <section className={''}>
            {
                isLoading
                    ? <Loading/>
                    : <Navigate to={HOME_ROUTE} replace/>
            }
        </section>
    );
};

export default OAuthGoogleCallback;
