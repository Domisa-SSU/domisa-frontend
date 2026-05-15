// import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queries/queryClient.ts';
import { resetRestoredLocalhostRoute } from './routes/devLocalhostRouteReset.ts';
import router from './router.tsx';

resetRestoredLocalhostRoute();

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
    <Analytics />
  </>
  // </StrictMode>,
);
