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
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import Dashboard from '../pages/dashboard/Dashboard';
import JobSuggestion from '../pages/dashboard/JobSuggestion';
import JobDetail from '../pages/jobs/JobDetail';
import JobSearch from '../pages/jobs/JobSearch';
import SavedJobs from '../pages/jobs/SavedJobs';
import Applications from '../pages/jobs/Applications';
import ApplicationDetailPage from '../pages/jobs/ApplicationDetailPage';
import Profile from '../pages/profile/ProfilePage';
import NotificationsPage from '../pages/notification/NotificationsPage.jsx';
import JobAlertSettings from '../pages/dashboard/settings/JobAlertSettings.jsx';
import News from '../pages/news/News';
import NotFound from '../pages/NotFound';
import BillingPage from '../pages/billing/Billing';
import Billing from '../pages/billing/Billing'; // Import trang nạp xu
import CreditHistory from '../pages/billing/CreditHistory';
import PaymentSuccess from '../pages/payment/PaymentSuccess';
import PaymentFailure from '../pages/payment/PaymentFailure';
import CompanyDetail from '../pages/company/CompanyDetail';
import CompanyList from '../pages/company/CompanyList';
import CVBuilder from '../components/buildCV/CVBuilder';
import CVListPage from '../pages/cv/CVListPage';
import ScrollToTopOnRouteChange from '../components/common/ScrollToTopOnRouteChange';

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
      <ScrollToTopOnRouteChange />
      <Routes>
        {/* Public routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<Navigate to="/jobs/search" replace />} />
          <Route path="/jobs/search" element={<JobSearch />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/companies" element={<CompanyList />} />
          <Route path="/company/:companyId" element={<CompanyDetail />} />
          <Route path="/news" element={<News />} />
          <Route path="/editor" element={<CVBuilder />} />
          <Route path="/editor/:cvId" element={<CVBuilder />} />
        </Route>

        {/* CV Render Page is now handled by render.html, this route is deprecated */}

        {/* Protected CV Management routes */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route path="/my-cvs" element={<MainLayout />}>
            <Route index element={<CVListPage />} />
          </Route>
        </Route>

        {/* Auth routes */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
        <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/" /> : <ForgotPassword />} />
        <Route path="/reset-password" element={isAuthenticated ? <Navigate to="/" /> : <ResetPassword />} />

        {/* Protected dashboard routes */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="job-suggestions" element={<JobSuggestion />} />
            <Route path="applications" element={<Applications />} />
            <Route path="applications/:id" element={<ApplicationDetailPage />} />
            <Route path="saved-jobs" element={<SavedJobs />} />
            <Route path="settings/job-alerts" element={<JobAlertSettings />} />
            {/* Thêm route cho trang nạp xu */}
            <Route path="billing" element={<BillingPage />} />
            <Route path="top-up" element={<Billing />} />
            <Route path="credit-history" element={<CreditHistory />} />
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
            <Route index element={<NotificationsPage />} />
          </Route>
        </Route>

        {/* Payment result routes - không cần layout */}
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failure" element={<PaymentFailure />} />
        
        {/* Fallback for any other route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;