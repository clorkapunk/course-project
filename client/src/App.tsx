import {Route, Routes} from "react-router-dom";
import Layout from "@/components/Layout.tsx";
import Login from "@/pages/Login.tsx";
import {
    ADMIN_ROUTE,
    HOME_ROUTE,
    LOGIN_ROUTE,
    OAUTH_CALLBACK,
    REGISTER_ROUTE,
    UNAUTHORIZED_ROUTE
} from "@/utils/consts.ts";
import Register from "@/pages/Register.tsx";
import RequireAuth from "@/components/RequireAuth.tsx";
import Home from "@/pages/Home.tsx";
import Admin from "@/pages/Admin.tsx";
import Unauthorized from "@/pages/Unauthorized.tsx";
import PersistLogin from "@/components/PersistLogin.tsx";
import OAuthHandler from "@/components/OAuthHandler.tsx";
import NotFound from "@/pages/NotFound.tsx";

const App = () => {

    return (
        <Routes>
            <Route path="/" element={<Layout/>}>
                {/* oauth handle route */}
                <Route path={OAUTH_CALLBACK} element={<OAuthHandler/>}/>

                {/* public routes */}
                <Route path={LOGIN_ROUTE} element={<Login/>}/>
                <Route path={REGISTER_ROUTE} element={<Register/>}/>
                <Route path={UNAUTHORIZED_ROUTE} element={<Unauthorized/>}/>

                <Route element={<PersistLogin/>}>
                    <Route element={<RequireAuth allowedRoles={['USER', 'ADMIN']}/>}>
                        <Route path={HOME_ROUTE} element={<Home/>}/>
                    </Route>
                    <Route element={<RequireAuth allowedRoles={['ADMIN']}/>}>
                        <Route path={ADMIN_ROUTE} element={<Admin/>}/>
                    </Route>
                </Route>

                <Route path={'*'} element={<NotFound/>}/>
            </Route>
        </Routes>
    )
}

export default App
