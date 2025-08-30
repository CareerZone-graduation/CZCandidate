import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '../components/HomePage';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/dashboard/Dashboard';
import JobSuggestion from '../pages/dashboard/JobSuggestion';
import JobList from '../pages/jobs/JobList';
import JobDetail from '../pages/jobs/JobDetail'; // Remove .jsx extension
import MainLayout from '../components/layout/MainLayout';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';

const AppRouter = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
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
        {/* Routes dùng MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobList />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          {/* các route khác dùng MainLayout */}
        </Route>

        {/* Dashboard routes - sử dụng DashboardLayout như wrapper */}
        <Route 
          path="/dashboard" 
          element={user ? (
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          ) : (
            <Navigate to="/login" />
          )} 
        />
        
        <Route 
          path="/dashboard/job-suggestions" 
          element={user ? (
            <DashboardLayout>
              <JobSuggestion />
            </DashboardLayout>
          ) : (
            <Navigate to="/login" />
          )} 
        />

        {/* Routes không dùng layout */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" /> : <Login />} 
        />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;