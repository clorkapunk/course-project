import {createSlice} from "@reduxjs/toolkit";
import {RootState} from "@/app/store.ts";

type State = {
    isOpen: boolean;
    templateTitle: string;
}

const initialState: State = {
    isOpen: false,
    templateTitle: ""
}

const ticketSlice = createSlice({
    name: "ticket",
    initialState,
    reducers: {
        setIsDialogOpened: (state, action) => {
            const {isOpen, templateTitle} = action.payload
            state.isOpen = isOpen
            state.templateTitle = templateTitle || ''
        }
    }
})

export const {setIsDialogOpened} = ticketSlice.actions;
export default ticketSlice.reducer
export const selectIsDialogOpen = (state: RootState) => state.ticket.isOpen
export const selectTicketState = (state: RootState) => state.ticket
