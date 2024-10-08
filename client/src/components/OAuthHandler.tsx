import {Navigate, useLocation} from "react-router-dom";
import {HOME_ROUTE} from "@/utils/consts.ts";
import {useEffect, useState} from "react";
import {useGoogleGetDataMutation} from "@/features/auth/authApiSlice.ts";
import Loading from "@/components/Loading.tsx";
import {useDispatch} from "react-redux";
import {setCredentials} from "@/features/auth/authSlice.ts";

const OAuthHandler = () => {
    const location = useLocation()
    const code = new URLSearchParams(location.search).get('code');
    const [isLoading, setIsLoading] = useState(true)
    const [googleGetData] = useGoogleGetDataMutation()
    const dispatch = useDispatch()


    useEffect(() => {
        let isMounted = true;
        const getUserData = async (code: string) => {
            try {
                const response = await googleGetData({code}).unwrap();
                dispatch(setCredentials({accessToken: response.accessToken}))
            } catch (err) {
                console.log(err)
            } finally {
                if(isMounted) setIsLoading(false)
            }
        }

        if (code) {
            getUserData(code)
        } else {
            setIsLoading(false)
        }

        return () => {
            isMounted = false
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

export default OAuthHandler;
