import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUser } from '../redux/authSlice';

// Layouts
import MainLayout from '../components/layout/MainLayout';
import DashboardLayout from '../components/layout/DashboardLayout';

// Pages
import HomePage from '../components/HomePage';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/dashboard/Dashboard';
import JobSuggestion from '../pages/dashboard/JobSuggestion';
import JobList from '../pages/jobs/JobList';
import JobDetail from '../pages/jobs/JobDetail';

// Protected Route Component
const ProtectedRoute = ({ isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

const AppRouter = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, isInitializing } = useSelector((state) => state.auth);

  useEffect(() => {
    // Fetch user on initial load if a token exists
    if (isAuthenticated) {
      dispatch(fetchUser());
    } else {
      // If no token, no need to fetch, just finish initializing
      // This part is handled by the initial state of isInitializing in the slice
    }
  }, [dispatch, isAuthenticated]);


  if (isInitializing && isAuthenticated) { // Only show loader if we are authenticated and fetching user
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        {/* Public routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <HomePage />} />
          <Route path="/jobs" element={<JobList />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
        </Route>

        {/* Auth routes */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />

        {/* Protected dashboard routes */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="job-suggestions" element={<JobSuggestion />} />
            {/* Add other nested dashboard routes here */}
          </Route>
        </Route>
        
        {/* Fallback for any other route */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;