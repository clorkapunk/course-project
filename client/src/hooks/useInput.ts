import useLocalStorage from "./useLocalStorage";
import React from "react";

type AttributeObjType = {
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const useInput = (key: string, initValue: string): [string, () => void, AttributeObjType] => {
    const [value, setValue] = useLocalStorage<string>(key, initValue);

    const reset = () => setValue(initValue);

    const attributeObj = {
        value,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)
    }

    return [value, reset, attributeObj];
}

export default useInput
