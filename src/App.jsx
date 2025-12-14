import AppRouter from './routes/AppRouter';
// import { Toaster } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import AnimatedBackground from '@/components/background/AnimatedBackground';
import { BackgroundProvider } from '@/contexts/BackgroundContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { FirebaseProvider } from '@/contexts/FirebaseContext';
import ScrollToTop from '@/components/common/ScrollToTop';
import TikTokPreloader from '@/components/common/TikTokPreloader';
import ChatInterface from '@/components/chat/ChatInterface';
import { useChat } from '@/contexts/ChatContext';

function AppContent() {
  const { isChatOpen, chatConfig, closeChat } = useChat();

  return (
    <>
      <AnimatedBackground />
      <AppRouter />
      <Toaster position="top-center" richColors />
      <ScrollToTop />

      {/* Global Chat Interface */}
      <ChatInterface
        isOpen={isChatOpen}
        onClose={closeChat}
        conversationId={chatConfig.conversationId}
        recipientId={chatConfig.recipientId}
        jobId={chatConfig.jobId}
        companyName={chatConfig.companyName}
      />
    </>
  );
}

function App() {
  // The logic for fetching the user on initial load has been moved to AppRouter.jsx
  // to better handle the initialization state and prevent race conditions with routing.
  // This keeps the App component clean and focused on rendering the router.
  return (
    <>
      <TikTokPreloader minLoadTime={1500} />
      <ThemeProvider>
        <BackgroundProvider>
          <ChatProvider>
            <FirebaseProvider>
              <AppContent />
            </FirebaseProvider>
          </ChatProvider>
        </BackgroundProvider>
      </ThemeProvider>


    </>
  );
}

export default App;
