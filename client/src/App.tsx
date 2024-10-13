import {Route, Routes} from "react-router-dom";
import Layout from "@/components/Layout.tsx";
import Login from "@/pages/Login.tsx";
import {
    ADMIN_HISTORY_ROUTE, ADMIN_USERS_ROUTE,
    HOME_ROUTE,
    LOGIN_ROUTE,
    OAUTH_CALLBACK,
    REGISTER_ROUTE,
    UNAUTHORIZED_ROUTE,
} from "@/utils/routes.ts";
import Register from "@/pages/Register.tsx";
import RequireAuth from "@/components/RequireAuth.tsx";
import Home from "@/pages/Home.tsx";
import Unauthorized from "@/pages/Unauthorized.tsx";
import PersistLogin from "@/components/PersistLogin.tsx";
import OAuthGoogleCallback from "@/pages/OAuthGoogleCallback.tsx";
import NotFound from "@/pages/NotFound.tsx";
import Roles from '@/utils/roles.ts'
import UsersManagement from "@/pages/UsersManagement/UsersManagement.tsx";
import AdminHistory from "@/pages/AdminHistory/AdminHistory.tsx";

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<Layout/>}>
                {/* oauth handle route */}
                <Route path={OAUTH_CALLBACK} element={<OAuthGoogleCallback/>}/>

                {/* public routes */}
                <Route path={LOGIN_ROUTE} element={<Login/>}/>
                <Route path={REGISTER_ROUTE} element={<Register/>}/>
                <Route path={UNAUTHORIZED_ROUTE} element={<Unauthorized/>}/>

                <Route element={<PersistLogin/>}>
                    <Route element={<RequireAuth allowedRoles={[Roles.User, Roles.Admin]}/>}>
                        <Route path={HOME_ROUTE} element={<Home/>}/>
                    </Route>
                    <Route element={<RequireAuth allowedRoles={[Roles.Admin]}/>}>
                        <Route path={ADMIN_USERS_ROUTE} element={<UsersManagement/>}/>
                        <Route path={ADMIN_HISTORY_ROUTE} element={<AdminHistory/>}/>
                    </Route>
                </Route>

                <Route path={'*'} element={<NotFound/>}/>
            </Route>
        </Routes>
    )
}

export default App
