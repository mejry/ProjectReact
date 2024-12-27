import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/EmployeeList';
import AdminLeaveManagement from './pages/leaves/AdminLeaveManagement';
import EmployeeLeaveManagement from './pages/leaves/LeaveManagement';
import TimeSheet from './pages/TimeSheet';
import Performance from './pages/Performance';
import ProfilePage from './pages/profile';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route 
                  path="employees" 
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <EmployeeList />
                    </ProtectedRoute>
                  } 
                />
                <Route path="leaves/*" element={<LeaveRoutes />} />
                <Route path="timesheet" element={<TimeSheet />} />
                <Route path="performance" element={<Performance />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

// Separate component for leave-related routes
const LeaveRoutes = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Separate routes based on user role
  if (user.role === 'admin') {
    return (
      <Routes>
        <Route index element={<AdminLeaveManagement />} />
        <Route path="employee/:id" element={<EmployeeLeaveManagement />} />
      </Routes>
    );
  }

  // Employee routes
  return (
    <Routes>
      <Route index element={<EmployeeLeaveManagement />} />
      <Route path="*" element={<Navigate to="/leaves" replace />} />
    </Routes>
  );
};

export default App;