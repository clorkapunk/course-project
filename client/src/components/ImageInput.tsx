import {ChangeEvent, useRef, useState} from "react";
import {Button} from "@/components/ui/button.tsx";
import {FaImage} from "react-icons/fa6";


const ImageInput = ({handleChange, handleDelete}: { handleChange: (file: File) => void; handleDelete: () => void }) => {

    const [fileName, setFileName] = useState('')
    const hiddenFileInput = useRef<HTMLInputElement>(null);


    const handleClick = () => {
        hiddenFileInput.current?.click();
    };

    const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleChange(file)
            setFileName(file.name)
        }
    };

    const onDeleteHandler = () => {
        setFileName('')
        handleDelete()
    }

    return (
        <>
            <Button
                className={'border-dashed border-2 min-w-[80px] h-[80px] flex justify-center p-2'}
                variant={fileName ? 'destructive' : 'dark'}
                onClick={fileName ? onDeleteHandler : handleClick}
            >
                {
                    fileName ?
                        <p className={'truncate overflow-hidden whitespace-nowrap'}>
                            {fileName}
                        </p>
                        :
                        <FaImage/>
                }


            </Button>
            <input
                type="file"

                onChange={onChangeHandler}
                ref={hiddenFileInput}
                style={{display: 'none'}} // Make the file input element invisible
            />
        </>
    );
};

export default ImageInput;
