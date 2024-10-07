import {Outlet} from "react-router-dom";
import {Toaster} from "react-hot-toast";

const Layout = () => {
    return (
        <>
            {/* todo add header*/}
            <Outlet/>
            <Toaster/>
            {/* todo add footer*/}
        </>
    );
};

export default Layout;
