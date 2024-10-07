import {useEffect, useState} from "react";
import {Outlet} from "react-router-dom";
import useLocalStorage from "@/hooks/useLocalStorage.ts";
import {useRefreshMutation} from "@/features/auth/authApiSlice.ts";
import {useDispatch, useSelector} from "react-redux";
import {selectAuthState, setCredentials} from "@/features/auth/authSlice.ts";
import Loading from "@/components/Loading.tsx";


const PersistLogin = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [persist] = useLocalStorage('persist', false)
    const authState = useSelector(selectAuthState)
    const dispatch = useDispatch()
    const [refresh] = useRefreshMutation()

    useEffect(() => {
        let isMounted = true;
        const verifyRefreshToken = async () => {
            try {
                const response = await refresh({}).unwrap();
                dispatch(setCredentials({accessToken: response.accessToken}))
            } catch (err) {
                console.log(err)
            } finally {
                if(isMounted) setIsLoading(false)
            }
        }

        if (!authState.token) {
            verifyRefreshToken()
        } else {
            setIsLoading(false)
        }

        return () => {
            isMounted = false
        }
    }, [])

    // todo paste loading spinner or something else
    return (
        <>
            {
                !persist
                    ? <Outlet/>
                    : isLoading
                        ? <Loading/>
                        : <Outlet/>
            }
        </>
    )

};

export default PersistLogin;
