import useLocalStorage from "./useLocalStorage";

const useToggle = (key: string, initValue: boolean) : [boolean, (value: boolean) => void] => {
    const [value, setValue] = useLocalStorage<boolean>(key, initValue);

    const toggle = (value: boolean) => {
        setValue(value)
    }

    return [value, toggle];
}

export default useToggle
