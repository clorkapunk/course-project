import React, {useEffect, useState} from "react";

const getLocalValue = <T>(key: string, initValue: T) => {
    if(typeof  window === 'undefined') return initValue;

    const storedValue = localStorage.getItem(key)
    if(storedValue) return JSON.parse(storedValue);

    // if(initValue instanceof Function) return initValue();

    return initValue
}


const useLocalStorage = <T>(key: string, initValue: T): [T, React.Dispatch<React.SetStateAction<T>>]=> {
    const [value, setValue] = useState<T>(() => {
        return getLocalValue<T>(key, initValue)
    })

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value))
    }, [key, value])

    return [value, setValue]
}

export default useLocalStorage
