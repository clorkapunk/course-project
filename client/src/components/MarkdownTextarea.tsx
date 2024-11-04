import ReactQuill from "react-quill";
import {ComponentProps} from "react";

type Props = {
    className?: ComponentProps<'div'>['className'];
    value: string
}

const MarkdownTextarea = ({className, value}: Props) => {
    return (
        <div className={className}>
            <ReactQuill
                modules={{
                    toolbar: null
                }}
                readOnly
                value={value}
            />
        </div>
    );
};

export default MarkdownTextarea;
