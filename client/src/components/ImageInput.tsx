import {ChangeEvent, useRef, useState} from "react";
import {Button} from "@/components/ui/button.tsx";
import {FaImage} from "react-icons/fa6";


const ImageInput = ({handleChange, handleDelete, existingImage}: { handleChange: (file: File) => void; handleDelete: () => void; existingImage: string | undefined;}) => {

    const [file, setFile] = useState<File | null>(null)
    const hiddenFileInput = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        hiddenFileInput.current?.click();
    };

    const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleChange(file)
            setFile(file)
        }
    };

    const onDeleteHandler = () => {
        setFile(null)
        handleDelete()
    }

    return (
        <>

            <Button
                className={'border-dashed border-2 min-w-[80px] h-[80px] flex justify-center p-1 bg-transparent'}
                variant={file ? 'destructive' : 'default'}
                onClick={file ? onDeleteHandler : handleClick}
            >
                {
                    file
                        ? <img src={URL.createObjectURL(file)} alt="Uploaded image" className={' w-full h-full object-cover'}/>
                        : existingImage
                            ? <img src={existingImage} alt="Uploaded image" className={' w-full h-full object-cover'} />
                            : <FaImage/>

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
