import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUser } from '../redux/authSlice';

// Layouts
import MainLayout from '../components/layout/MainLayout';
import DashboardLayout from '../components/layout/DashboardLayout';
import ProfileLayout from '../components/layout/ProfileLayout';

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
import RecommendedJobsPage from '../pages/RecommendedJobsPage';
import SavedJobs from '../pages/jobs/SavedJobs';
import ViewHistory from '../pages/jobs/ViewHistory';
import JobAlertJobsPage from '../pages/jobs/JobAlertJobsPage';
import Applications from '../pages/jobs/Applications';
import ApplicationDetailPage from '../pages/jobs/ApplicationDetailPage';
import Profile from '../pages/profile/ProfilePage';
import WorkPreferences from '../pages/profile/WorkPreferences';
import ProfilePrivacySettings from '../pages/profile/ProfilePrivacySettings';
import SecuritySettings from '../pages/profile/SecuritySettings';
import NotificationsPage from '../pages/notification/NotificationsPage.jsx';
import JobAlertSettings from '../pages/dashboard/settings/JobAlertSettings.jsx';
import PrivacySettings from '../pages/dashboard/settings/PrivacySettings.jsx';
import MessagesPage from '../pages/messages/MessagesPage.jsx';
import News from '../pages/news/News';
import MyInterviews from '../pages/interviews/MyInterviews';
import InterviewRoom from '../pages/interviews/InterviewRoom';
import DeviceTest from '../components/interviews/DeviceTest';
import NotFound from '../pages/NotFound';
import BillingPage from '../pages/billing/Billing';
import Billing from '../pages/billing/Billing'; // Import trang nạp xu
import CreditHistory from '../pages/billing/CreditHistory';
import PaymentSuccess from '../pages/payment/PaymentSuccess';
import PaymentFailure from '../pages/payment/PaymentFailure';
import CompanyDetail from '../pages/company/CompanyDetail';
import CompanyList from '../pages/company/CompanyList';
import CVBuilder from '../components/buildCV/CVBuilder';
import CVBuilderPage from '../pages/cv/CVBuilderPage';
import UploadedCVPage from '../pages/cv/UploadedCVPage';
import OnboardingPage from '../pages/onboarding/OnboardingPage';
import { OnboardingPreview } from '../components/onboarding/OnboardingPreview';
import ScrollToTopOnRouteChange from '../components/common/ScrollToTopOnRouteChange';

// Support Request Pages
import SupportRequestsPage from '../pages/support/SupportRequestsPage';
import CreateSupportRequestPage from '../pages/support/CreateSupportRequestPage';
import SupportRequestDetailPage from '../pages/support/SupportRequestDetailPage';

// Contact Page
import ContactPage from '../pages/contact/ContactPage';

// Protected Route Component
const ProtectedRoute = ({ isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};



import { getAccessToken } from '../utils/token';
import { useOnboardingStatus } from '../hooks/useOnboardingStatus';

// This component will perform the onboarding check globally using Redux
const GlobalOnboardingChecker = () => {
  const { isAuthenticated, isInitializing } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use Redux hook to get onboarding status (auto-fetches if needed)
  const { needsOnboarding, isLoading } = useOnboardingStatus(isAuthenticated && !isInitializing);

  useEffect(() => {
    // Check only when authentication is resolved and user is logged in
    if (isAuthenticated && !isInitializing && !isLoading) {
      // Avoid redirect loops or redirecting away from the onboarding process itself
      if (location.pathname.startsWith('/onboarding')) return;

      if (needsOnboarding) {
        console.log('GlobalOnboardingChecker: Redirecting to /onboarding (from Redux)');
        navigate('/onboarding', { replace: true });
      }
    }
  }, [isAuthenticated, isInitializing, needsOnboarding, isLoading, navigate, location.pathname]);

  return null; // This component does not render anything
};

const AppRouter = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, isInitializing } = useSelector((state) => state.auth);

  useEffect(() => {
    // Run once on app startup to check for existing token
    if (getAccessToken()) {
      dispatch(fetchUser());
    }
  }, [dispatch]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
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
      <GlobalOnboardingChecker />
      <Routes>
        {/* Public routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<Navigate to="/jobs/search" replace />} />
          <Route path="/jobs/search" element={<JobSearch />} />
          <Route path="/jobs/recommended" element={<RecommendedJobsPage />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/companies" element={<CompanyList />} />
          <Route path="/company/:companyId" element={<CompanyDetail />} />
          <Route path="/news" element={<News />} />
          <Route path="/editor" element={<CVBuilder />} />
          <Route path="/editor/:cvId" element={<CVBuilder />} />
        </Route>

        {/* Protected Job Alert Jobs Page */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route path="/jobs/alert" element={<MainLayout />}>
            <Route index element={<JobAlertJobsPage />} />
          </Route>
        </Route>

        {/* Onboarding Preview - Public route without layout */}
        <Route path="/onboarding-preview" element={<OnboardingPreview />} />

        {/* CV Render Page is now handled by render.html, this route is deprecated */}

        {/* Protected CV Management routes */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route path="/my-cvs" element={<MainLayout />}>
            <Route index element={<Navigate to="/my-cvs/builder" replace />} />
            <Route path="builder" element={<CVBuilderPage />} />
            <Route path="uploaded" element={<UploadedCVPage />} />
          </Route>
        </Route>

        {/* Auth routes */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
        <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/" /> : <ForgotPassword />} />
        <Route path="/reset-password" element={isAuthenticated ? <Navigate to="/" /> : <ResetPassword />} />

        {/* Protected onboarding route - no onboarding check needed */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
        </Route>

        {/* Protected dashboard routes - now use standard protected route */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="job-suggestions" element={<JobSuggestion />} />
            <Route path="applications" element={<Applications />} />
            <Route path="applications/:id" element={<ApplicationDetailPage />} />
            <Route path="saved-jobs" element={<SavedJobs />} />
            <Route path="view-history" element={<ViewHistory />} />
            <Route path="settings/job-alerts" element={<JobAlertSettings />} />
            <Route path="settings/privacy" element={<PrivacySettings />} />
            {/* Thêm route cho trang nạp xu */}
            <Route path="billing" element={<BillingPage />} />
            <Route path="top-up" element={<Billing />} />
            <Route path="credit-history" element={<CreditHistory />} />
          </Route>
        </Route>
        {/* Protected profile routes - now use standard protected route */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route element={<MainLayout />}>
            <Route path="/profile" element={<ProfileLayout />}>
              <Route index element={<Profile />} />
              <Route path="work-preferences" element={<WorkPreferences />} />
              <Route path="privacy" element={<ProfilePrivacySettings />} />
              <Route path="security" element={<SecuritySettings />} />
            </Route>
          </Route>
        </Route>

        {/* Protected notifications routes - now use standard protected route */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route path="/notifications" element={<MainLayout />}>
            <Route index element={<NotificationsPage />} />
          </Route>
        </Route>

        {/* Protected messages routes - now use standard protected route */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route path="/messages" element={<MainLayout />}>
            <Route index element={<MessagesPage />} />
          </Route>
        </Route>

        {/* Protected interviews routes - now use standard protected route */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route path="/interviews" element={<MainLayout />}>
            <Route index element={<MyInterviews />} />
          </Route>
          {/* Interview room routes - no layout for full-screen experience */}
          <Route path="/interviews/:interviewId/device-test" element={<DeviceTest />} />
          <Route path="/interviews/:interviewId/room" element={<InterviewRoom />} />
        </Route>

        {/* Protected support request routes */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route path="/support" element={<MainLayout />}>
            <Route index element={<SupportRequestsPage />} />
          </Route>
          <Route path="/support/new" element={<MainLayout />}>
            <Route index element={<CreateSupportRequestPage />} />
          </Route>
          <Route path="/support/:id" element={<MainLayout />}>
            <Route index element={<SupportRequestDetailPage />} />
          </Route>
        </Route>

        {/* Protected Contact Page - requires login */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route path="/contact" element={<MainLayout />}>
            <Route index element={<ContactPage />} />
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