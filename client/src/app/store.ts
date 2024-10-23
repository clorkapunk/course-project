import {configureStore} from "@reduxjs/toolkit";
import {apiSlice} from "@/app/api/apiSlice.ts";
import authReducer from '@/features/auth/authSlice.ts'
import searchReducer from '@/features/search/searchSlice.ts'

export const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        auth: authReducer,
        search: searchReducer
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware().concat(apiSlice.middleware),
    devTools: true
})

export type AppStore = typeof store
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
