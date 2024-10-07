import {useNavigate} from "react-router-dom";
import Users from './Users';
import {Button} from "@/components/ui/button.tsx";
import {HOME_ROUTE} from "@/utils/consts.ts";

const Admin = () => {
    const navigate = useNavigate();

    return (
        <section className={'h-screen flex flex-col gap-10 items-center'}>
            <h1>Admins Page</h1>
            <br />
            <Users />
            <br />
            <Button variant={'secondary'} onClick={() => navigate(HOME_ROUTE)}>
                Home
            </Button>
        </section>
    )
}

export default Admin
