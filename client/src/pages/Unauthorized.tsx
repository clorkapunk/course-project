import {Button} from "@/components/ui/button.tsx";
import {useNavigate} from "react-router-dom";

const Unauthorized = () => {
    const navigate = useNavigate()

    const goBack = () => navigate(-1)

    return (
        <section className={'h-screen flex flex-col items-center justify-center'}>
            <h1 className={'text-4xl mb-4'}>We are sorry...</h1>
            <p className={'text-center mb-10'}>
                The page you're trying to access has restricted access. <br/>
                Please refer to your system administrator.
            </p>
            <Button
                variant={'link'}
                className={'text-xl'}
                onClick={goBack}
            >
                Go Back
            </Button>
        </section>
    );
};

export default Unauthorized;
