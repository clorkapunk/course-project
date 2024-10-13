import {Outlet} from "react-router-dom";
import {Toaster} from "react-hot-toast";
import Sidebar from "@/components/Sidebar/Sidebar.tsx";

const Layout = () => {
    return (
        <main className={'bg-primary flex h-full max-w-[100dvw]'}>
            <Sidebar/>
            <div className={'bg-zinc-900 flex-grow-0 w-full max-w-[100dvw]'}>
                <Outlet/>
            </div>
            <Toaster/>
        </main>
    );
};

export default Layout;
