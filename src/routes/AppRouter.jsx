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
import SavedJobs from '../pages/jobs/SavedJobs';
import Profile from '../pages/profile/Profile';
import JobNotificationManager from '../pages/notification/JobNotificationManager.jsx';
import News from '../pages/news/News';
import BillingPage from '../pages/billing/Billing';
import Billing from '../pages/billing/Billing'; // Import trang nạp xu
import PaymentSuccess from '../pages/payment/PaymentSuccess';
import PaymentFailure from '../pages/payment/PaymentFailure';

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
    if (isAuthenticated) {
      dispatch(fetchUser());
    }
  }, [dispatch, isAuthenticated]);

  if (isInitializing && isAuthenticated) {
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
          <Route path="/" element={isAuthenticated ? <Navigate to="/jobs" /> : <HomePage />} />
          <Route path="/jobs" element={<JobList />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/news" element={<News />} />
        </Route>

        {/* Auth routes */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/jobs" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/jobs" /> : <Register />} />

        {/* Protected dashboard routes */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="job-suggestions" element={<JobSuggestion />} />
            <Route path="saved-jobs" element={<SavedJobs />} />
            {/* Thêm route cho trang nạp xu */}
            <Route path="billing" element={<BillingPage />} />
            <Route path="top-up" element={<Billing />} />
          </Route>
        </Route>

        {/* Protected profile routes */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route path="/profile" element={<MainLayout />}>
            <Route index element={<Profile />} />
          </Route>
        </Route>

        {/* Protected notifications routes */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route path="/notifications" element={<MainLayout />}>
            <Route index element={<JobNotificationManager />} />
          </Route>
        </Route>

        {/* Payment result routes - không cần layout */}
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failure" element={<PaymentFailure />} />
        
        {/* Fallback for any other route */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/jobs" : "/"} />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;