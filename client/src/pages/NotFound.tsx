
import {Button} from "@/components/ui/button.tsx";
import {useNavigate} from "react-router-dom";

const NotFound = () => {
    const navigate = useNavigate()

    return (
        <section className={'h-screen flex flex-col items-center justify-center'}>
            <h1>404</h1>
            <h3>Not Found</h3>
            <Button onClick={() => {
                navigate(-1)
            }}>
                Go back
            </Button>
        </section>
    );
};

export default NotFound;
