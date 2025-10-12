import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CVRenderOnlyPage from './pages/cv/CVRenderOnlyPage';
import './index.css';

// Create a client
const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <CVRenderOnlyPage />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);