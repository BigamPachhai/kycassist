import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { KYCProvider } from './context/KYCContext';
import Navbar from './components/Navbar';
import AIChatAssistant from './components/AIChatAssistant';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import KYCForm from './pages/KYCForm';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children, requireRole }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (requireRole && user.role !== requireRole) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const HomeRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />;
};

const AppLayout = ({ children }) => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50">
      {user && <Navbar />}
      <main>{children}</main>
      {user && <AIChatAssistant />}
    </div>
  );
};

const App = () => (
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <AuthProvider>
      <KYCProvider>
        <AppLayout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute requireRole="user"><Dashboard /></ProtectedRoute>} />
            <Route path="/kyc" element={<ProtectedRoute requireRole="user"><KYCForm /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute requireRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/" element={<HomeRoute />} />
            <Route path="*" element={<HomeRoute />} />
          </Routes>
        </AppLayout>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: { fontSize: '14px', borderRadius: '12px', padding: '10px 14px' },
            success: { iconTheme: { primary: '#0D9488', secondary: 'white' } },
          }}
        />
      </KYCProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
