import loadingGif from '@/assets/loading.gif'
import {ComponentProps} from "react";


type Props = {
    className?: ComponentProps<'div'>['className'],
    imageClassName?: ComponentProps<'img'>['className'],
    isFullScreen?: boolean
}

const Loading = ({className, imageClassName, isFullScreen = true}: Props) => {
    return (
        <div className={`${isFullScreen ? "h-screen" : "h-fit"} flex items-center justify-center text-2xl ${className}`}>
            <img
                className={`h-[150px] aspect-square ${imageClassName}`}
                src={loadingGif}
                alt={'loading...'}
            />
            {/*<ReloadIcon className="mr-2 h-8 w-8 animate-spin"/> Loading...*/}
        </div>
    );
};

export default Loading;
