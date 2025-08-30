import AppRouter from './routes/AppRouter';
import { Toaster } from 'sonner';

function App() {
  // The logic for fetching the user on initial load has been moved to AppRouter.jsx
  // to better handle the initialization state and prevent race conditions with routing.
  // This keeps the App component clean and focused on rendering the router.
  return (
    <>
      <AppRouter />
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
