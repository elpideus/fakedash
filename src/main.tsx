import { createRoot } from 'react-dom/client'
import './main.css'
import App from './App.tsx'
import { BrowserRouter } from "react-router-dom";
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { APIProvider } from "./context/useDashAPI.tsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <APIProvider>
                    <App />
                </APIProvider>
            </BrowserRouter>
        </QueryClientProvider>
    </React.StrictMode>
);