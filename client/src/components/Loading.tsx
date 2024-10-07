import {ReloadIcon} from "@radix-ui/react-icons";

const Loading = () => {
    return (
        <section className={'h-screen flex items-center justify-center text-2xl'}>
            <ReloadIcon className="mr-2 h-8 w-8 animate-spin"/> Loading...
        </section>
    );
};

export default Loading;
