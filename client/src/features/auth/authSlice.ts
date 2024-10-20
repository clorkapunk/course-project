import {createSlice} from "@reduxjs/toolkit";
import {RootState} from "@/app/store.ts";
import {jwtDecode} from "jwt-decode";
import {JwtPayload} from "@/types";

type State = {
    username: string | null;
    token: string | null;
    role: number | null;
    email: string | null;
    id: number | null;
}

const initialState: State = {
    username: null,
    token: null,
    role: null,
    email: null,
    id: null
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const {accessToken} = action.payload;
            const decoded = jwtDecode(accessToken) as JwtPayload
            state.username = decoded?.username
            state.role = decoded?.role
            state.email = decoded?.email
            state.id = decoded?.id
            state.token = accessToken;
        },
        logOut: (state) => {
            state.token = null;
            state.username = null;
            state.role = null;
            state.email = null;
            state.id = null
        }
    }
})

export const {setCredentials, logOut} = authSlice.actions;
export default authSlice.reducer
export const selectAuthState = (state: RootState) => state.auth
