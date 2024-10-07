import {Navigate, Outlet, useLocation, useParams} from "react-router-dom";
import {LOGIN_ROUTE} from "@/utils/consts.ts";
import {useDispatch, useSelector} from "react-redux";
import {selectAuthState, setCredentials} from "@/features/auth/authSlice.ts";
import {useEffect} from "react";


const RequireAuth = ({allowedRoles}: { allowedRoles: string[] }) => {
    const {accessToken} = useParams()
    const dispatch = useDispatch();

    const authState = useSelector(selectAuthState)
    const location = useLocation()

    useEffect(() => {
        if(accessToken){
            console.log('accessToken', accessToken)
            dispatch(setCredentials({accessToken}))
        }
    }, [])


    return (
        authState?.roles.find(role => allowedRoles?.includes(role))
            ? <Outlet/>
            : authState?.token
                ? <Navigate to={`/unauthorized`} state={{from: location}} replace/>
                : <Navigate to={LOGIN_ROUTE} state={{from: location}} replace/>
    );
};

export default RequireAuth;
