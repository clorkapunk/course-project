import {createSlice} from "@reduxjs/toolkit";
import {RootState} from "@/app/store.ts";

type State = {
    search: string;
}

const initialState: State = {
    search: ""
}

const searchSlice = createSlice({
    name: "search",
    initialState,
    reducers: {
        setSearch: (state, action) => {
            const {search} = action.payload;
            state.search = search
        }
    }
})

export const {setSearch} = searchSlice.actions;
export default searchSlice.reducer
export const selectSearch = (state: RootState) => state.search
