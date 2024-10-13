import { useSelector} from "react-redux";
import {selectAuthState} from "@/features/auth/authSlice.ts";

const Home = () => {
    const authState = useSelector(selectAuthState)

    return (
        <div className={'h-screen text-center flex flex-col gap-10 justify-center items-center text-2xl underline'}>
            Hello {authState.username}!
        </div>
    );
};

export default Home;
