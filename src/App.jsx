import AppRouter from './routes/AppRouter';
import { Toaster } from 'sonner';
import AnimatedBackground from '@/components/background/AnimatedBackground';
import { BackgroundProvider } from '@/contexts/BackgroundContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import useFirebaseMessaging from './hooks/useFirebaseMessaging';
import { Route } from 'lucide-react';
import CVRenderOnlyPage from './pages/cv/CVRenderOnlyPage';
import ScrollToTop from '@/components/common/ScrollToTop';
import TikTokPreloader from '@/components/common/TikTokPreloader';

function App() {
  useFirebaseMessaging();
  // The logic for fetching the user on initial load has been moved to AppRouter.jsx
  // to better handle the initialization state and prevent race conditions with routing.
  // This keeps the App component clean and focused on rendering the router.
  return (
    <>
      <TikTokPreloader minLoadTime={1500} />
      <ThemeProvider>
        <BackgroundProvider>
          <AnimatedBackground />
          <AppRouter />
          <Toaster position="top-center" richColors />
          <ScrollToTop />
        </BackgroundProvider>
      </ThemeProvider>

      <Route path="/render/:cvId" element={<CVRenderOnlyPage />} />
    </>
  );
}

export default App;
