import {ComponentProps, useEffect, useState} from 'react';
import ReactQuill from 'react-quill';
import styles from './index.module.scss'
import './index.css'
import 'react-quill/dist/quill.snow.css';
import {cn} from "@/lib/utils.ts";
import {useTranslation} from "react-i18next";

type Props = {
    handleChange: (value: string) => void;
    classNames?: {
        editor: ComponentProps<'div'>['className'];
        toolbar: ComponentProps<'div'>['className'];
    }
    value: string;
}

const TextEditor = ({handleChange, value, classNames}: Props) => {
    const {t} = useTranslation()
    const [text, setText] = useState(value);

    const LIST_OF_COLOURS = [
        "#0290D7",
        "#4D4D4D",
        "#999999",
        "#F44E3B",
        "#FE9200",
        "#FCDC00",
        "#DBDF00"
    ];

    const toolbarModules = {
        listsAndIndents: [
            {list: "ordered"},
            {list: "bullet"},
            {indent: "-1"},
            {indent: "+1"}
        ],
        characterFormats: ["bold", "italic", "underline", "strike", "blockquote"],
        colors: [
            {color: [...LIST_OF_COLOURS]},
            {background: [...LIST_OF_COLOURS]}
        ]
    };

    const formatsSettings = {
        listsAndIndents: ["list", "bullet", "indent"],
        characterFormats: [
            "bold",
            "italic",
            "underline",
            "strike",
            "blockquote",
            "align"
        ],
        colors: ["color", "background"]
    };

    const formats = [
        ...formatsSettings.characterFormats,
        ...formatsSettings.colors,
        ...formatsSettings.listsAndIndents
    ];

    const modules = {
        toolbar: [
            toolbarModules.characterFormats,
            toolbarModules.colors,
            toolbarModules.listsAndIndents
        ],
        clipboard: {matchVisual: false},
        history: {
            delay: 2000,
            maxStack: 100,
            userOnly: true
        }
    };

    useEffect(() => {
        handleChange(text)
    }, [text]);


    return (
        <div
            className={'cursor-default'}
            onMouseDown={(e) => {
                e.stopPropagation();
            }}
            onKeyDown={(e) => {
                e.stopPropagation()
            }}
            onTouchStart={(e) => {
                e.stopPropagation()
            }}
        >
            <ReactQuill
                preserveWhitespace
                value={text}
                onChange={(value) => {
                    setText(value)
                }}
                placeholder={`${t('enter-question-description')}...`}
                modules={modules}
                formats={formats}
                className={cn(styles.input, classNames?.editor)}
            />
        </div>
    );
};

export default TextEditor;

