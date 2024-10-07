import {createSlice} from "@reduxjs/toolkit";
import {RootState} from "@/app/store.ts";
import {jwtDecode} from "jwt-decode";
import {JwtPayload} from "@/types";

type State = {
    username: string | null;
    token: string | null;
    roles: string[] | []
}

const initialState: State = {
    username: null,
    token: null,
    roles: []
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const {accessToken} = action.payload;
            const decoded = jwtDecode(accessToken) as JwtPayload
            state.username = decoded?.username
            state.roles = decoded?.roles
            state.token = accessToken;
        },
        logOut: (state) => {
            console.log('done')
            state.token = null;
            state.username = null;
            state.roles = [];
        }
    }
})

export const {setCredentials, logOut} = authSlice.actions;
export default authSlice.reducer
export const selectAuthState = (state: RootState) => state.auth
