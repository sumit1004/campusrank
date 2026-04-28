import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import UploadCertificate from './pages/UploadCertificate';
import Leaderboard from './pages/Leaderboard';
import Badges from './pages/Badges';
import Notifications from './pages/Notifications';
import DashboardLayout from './layouts/DashboardLayout';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import VerifyCertificate from './pages/VerifyCertificate';

// Import new Role/Protected Components

import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import EventRegistration from './pages/EventRegistration';
import AdminForms from './pages/AdminForms';
import AdminECertificates from './pages/AdminECertificates';
import { getUser } from './utils/auth';

const AuthRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  if (user) {
    if (user.role === 'superadmin') return <Navigate to="/superadmin-dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// Layout for Animate presence to work on route changes properly
const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<AuthRoute><Landing /></AuthRoute>} />
        <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
        <Route path="/signup" element={<AuthRoute><Signup /></AuthRoute>} />
        
        {/* All Protected Routes wrapped behind ProtectedRoute and DashboardLayout */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          
          {/* Student Dashboard */}
          <Route path="/dashboard" element={
            <RoleRoute allowed={['student']}>
              <Dashboard />
            </RoleRoute>
          } />
          
          {/* Admin Dashboard */}
          <Route path="/admin-dashboard" element={
            <RoleRoute allowed={['admin']}>
              <AdminDashboard />
            </RoleRoute>
          } />

          {/* SuperAdmin Dashboard */}
          <Route path="/superadmin-dashboard" element={
            <RoleRoute allowed={['superadmin']}>
              <SuperAdminDashboard />
            </RoleRoute>
          } />

          {/* Shared Protected Routes (you can adjust Roles as needed) */}
          <Route path="/upload" element={<UploadCertificate />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/notifications" element={
            <RoleRoute allowed={['student', 'admin']}>
              <Notifications />
            </RoleRoute>
          } />
          <Route path="/badges" element={
            <RoleRoute allowed={['student']}>
              <Badges />
            </RoleRoute>
          } />
          {/* Event Registration — Student */}
          <Route path="/events" element={
            <RoleRoute allowed={['student']}>
              <EventRegistration />
            </RoleRoute>
          } />

          {/* Admin Forms Management */}
          <Route path="/admin-forms" element={
            <RoleRoute allowed={['admin']}>
              <AdminForms />
            </RoleRoute>
          } />

          <Route path="/admin-certificates" element={
            <RoleRoute allowed={['admin']}>
              <AdminECertificates />
            </RoleRoute>
          } />

          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        
        {/* Public Verification Route */}
        <Route path="/verify/:id" element={<VerifyCertificate />} />
        <Route path="/verify-certificate/:id" element={<VerifyCertificate />} />

        
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ style: { background: '#111827', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)' } }}/>
        <AnimatedRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
