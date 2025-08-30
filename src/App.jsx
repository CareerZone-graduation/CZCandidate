import AppRouter from './routes/AppRouter';
import { AuthProvider } from './contexts/AuthContext'; // đường dẫn context của bạn

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
