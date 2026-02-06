import { createRoot } from 'react-dom/client'
import './main.css'
import App from './App.tsx'
import { BrowserRouter } from "react-router-dom";
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        {/* Provide the client to your entire app */}
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </QueryClientProvider>
    </React.StrictMode>
);