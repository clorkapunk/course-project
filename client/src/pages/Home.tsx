import {useNavigate} from "react-router-dom";
import {Button} from "@/components/ui/button.tsx";
import {ADMIN_ROUTE, LOGIN_ROUTE} from "@/utils/consts.ts";
import {useSelector} from "react-redux";
import {selectAuthState} from "@/features/auth/authSlice.ts";
import {useLogoutMutation} from "@/features/auth/authApiSlice.ts";


const Home = () => {
    const navigate = useNavigate()
    const authState = useSelector(selectAuthState)
    const [logout] = useLogoutMutation()

    const signOut = async () => {
        await logout({})
        navigate(LOGIN_ROUTE)
    }

    return (
        <div className={'h-screen text-center flex flex-col gap-10 justify-center items-center text-2xl underline'}>
            Hello {authState.username}!

            <Button variant={'outline'} onClick={() => navigate(ADMIN_ROUTE)}>
                Admin page
            </Button>

            <Button variant={'outline'} onClick={signOut}>
                Sign Out
            </Button>
        </div>
    );
};

export default Home;
