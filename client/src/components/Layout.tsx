import {Outlet} from "react-router-dom";
import {Toaster} from "react-hot-toast";
import Sidebar from "@/components/Sidebar/Sidebar.tsx";
import GlobalSearch from "@/components/GlobalSearch.tsx";
import CreateTicketDialog from "@/components/CreateTicketDialog.tsx";

const Layout = () => {


    return (
        <main className={'bg-background flex h-full max-w-[100dvw]'}>
            <CreateTicketDialog/>
            <Sidebar/>
            <div className={'flex-grow-0 w-full max-w-[100dvw] h-full flex flex-col min-h-screen'}>
                <GlobalSearch/>
                <Outlet/>
            </div>
            <Toaster/>
        </main>
    );
};

export default Layout;
