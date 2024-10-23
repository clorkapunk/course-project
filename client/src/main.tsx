import {createRoot} from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {Provider} from "react-redux";
import {store} from "@/app/store.ts";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {StrictMode} from "react";
import './i18n';
import {ThemeProvider} from "@/components/ThemeProvider.tsx";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider defaultTheme={'dark'} storageKey={"ui-theme"}>
            <Provider store={store}>
                <BrowserRouter>
                    <Routes>
                        <Route path={'/*'} element={<App/>}/>
                    </Routes>
                </BrowserRouter>
            </Provider>
        </ThemeProvider>

    </StrictMode>
)
