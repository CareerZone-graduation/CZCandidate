import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Bell,
  LogOut,
  MessageCircle,
  User,
  Search,
  Coins,
} from 'lucide-react';
import AppRouter from './routes/AppRouter';
import { Toaster } from 'sonner';
import SimpleAnimatedBackground from '@/components/background/SimpleAnimatedBackground';
import { BackgroundProvider } from '@/contexts/BackgroundContext';

function App() {
  // The logic for fetching the user on initial load has been moved to AppRouter.jsx
  // to better handle the initialization state and prevent race conditions with routing.
  // This keeps the App component clean and focused on rendering the router.
  return (
    <BackgroundProvider>
      <SimpleAnimatedBackground />
      <AppRouter />
      <Toaster position="top-right" richColors />
    </BackgroundProvider>
  );
}

export default App;
