import AppRouter from './routes/AppRouter';
import { Toaster } from 'sonner';
import SimpleAnimatedBackground from '@/components/background/SimpleAnimatedBackground';
import { BackgroundProvider } from '@/contexts/BackgroundContext';
import useFirebaseMessaging from './hooks/useFirebaseMessaging';
import { Route } from 'lucide-react';
import CVRenderOnlyPage from './pages/cv/CVRenderOnlyPage';

function App() {
  useFirebaseMessaging();
  // The logic for fetching the user on initial load has been moved to AppRouter.jsx
  // to better handle the initialization state and prevent race conditions with routing.
  // This keeps the App component clean and focused on rendering the router.
  return (
    <>
    <BackgroundProvider>
      <SimpleAnimatedBackground />
      <AppRouter />
      <Toaster position="top-center" richColors />
    </BackgroundProvider>

      <Route path="/render/:cvId" element={<CVRenderOnlyPage />} />
    </>
  );
}

export default App;
