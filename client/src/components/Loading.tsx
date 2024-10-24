import loadingGif from '@/assets/loading.gif'

const Loading = () => {
    return (
        <section className={'h-screen flex items-center justify-center text-2xl'}>
            <img
                className={'h-[150px] aspect-square'}
                src={loadingGif}
                alt={'loading...'}
            />
            {/*<ReloadIcon className="mr-2 h-8 w-8 animate-spin"/> Loading...*/}
        </section>
    );
};

export default Loading;
