// import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { resetRestoredLocalhostRoute } from './routes/devLocalhostRouteReset.ts';
import router from './router.tsx';

const queryClient = new QueryClient();

resetRestoredLocalhostRoute();

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>
  // </StrictMode>,
);
