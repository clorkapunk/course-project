import {Navigate, Outlet, useLocation} from "react-router-dom";
import {LOGIN_ROUTE} from "@/utils/routes.ts";
import {useSelector} from "react-redux";
import {selectAuthState, } from "@/features/auth/authSlice.ts";


const RequireAuth = ({allowedRoles}: { allowedRoles: number[] }) => {
    const authState = useSelector(selectAuthState)
    const location = useLocation()

    return (
        // authState?.role.find(role => allowedRoles?.includes(role))
        allowedRoles.some(role => role === authState?.role)
            ? <Outlet/>
            : authState?.token
                ? <Navigate to={`/unauthorized`} state={{from: location}} replace/>
                : <Navigate to={LOGIN_ROUTE} state={{from: location}} replace/>
    );
};

export default RequireAuth;
