import {Route, Routes} from "react-router-dom";
import Layout from "@/components/Layout.tsx";
import Login from "@/pages/Login.tsx";
import {
    ADMIN_HISTORY_ROUTE, ADMIN_USERS_ROUTE, FILL_TEMPLATE_ROUTE,
    HOME_ROUTE,
    LOGIN_ROUTE,
    OAUTH_CALLBACK,
    REGISTER_ROUTE, CREATE_TEMPLATE_ROUTE,
    UNAUTHORIZED_ROUTE, SEARCH_TEMPLATES_ROUTE, PROFILE_ROUTE, EDIT_TEMPLATE_ROUTE, EDIT_FORM_ROUTE,
} from "@/utils/routes.ts";
import Register from "@/pages/Register.tsx";
import RequireAuth from "@/components/RequireAuth.tsx";
import Main from "@/pages/Main/Main.tsx";
import Unauthorized from "@/pages/Unauthorized.tsx";
import PersistLogin from "@/components/PersistLogin.tsx";
import OAuthGoogleCallback from "@/pages/OAuthGoogleCallback.tsx";
import NotFound from "@/pages/NotFound.tsx";
import Roles from '@/utils/roles.ts'
import UsersManagement from "@/pages/UsersManagement/UsersManagement.tsx";
import AdminHistory from "@/pages/AdminHistory/AdminHistory.tsx";
import CreateTemplate from "@/pages/CreateTemplate.tsx";
import FillTemplate from "@/pages/FillTemplate.tsx";
import SearchTemplates from "@/pages/SearchTemplates.tsx";
import Profile from "@/pages/Profile.tsx";
import EditTemplate from "@/pages/EditTemplate.tsx";
import EditForm from "@/pages/EditForm.tsx";

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
                    <Route path={HOME_ROUTE} element={<Main/>}/>
                    <Route path={FILL_TEMPLATE_ROUTE + "/:id"} element={<FillTemplate/>}/>
                    <Route path={SEARCH_TEMPLATES_ROUTE} element={<SearchTemplates/>}/>


                    <Route element={<RequireAuth allowedRoles={[Roles.User, Roles.Admin]}/>}>
                        <Route path={EDIT_TEMPLATE_ROUTE + "/:id"} element={<EditTemplate/>}/>
                        <Route path={EDIT_FORM_ROUTE + "/:id"} element={<EditForm/>}/>
                        <Route path={CREATE_TEMPLATE_ROUTE} element={<CreateTemplate/>}/>
                        <Route path={PROFILE_ROUTE} element={<Profile/>}/>
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
