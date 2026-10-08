import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

// Layouts
import { AuthLayout } from './layouts/AuthLayout.jsx';
import { DashboardLayout } from './layouts/DashboardLayout.jsx';
import { AdminLayout } from './layouts/AdminLayout.jsx';

// Route Guards
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute.jsx';

// Auth Pages
import { Login } from './pages/auth/Login.jsx';
import { Register } from './pages/auth/Register.jsx';
import { ForgotPassword } from './pages/auth/ForgotPassword.jsx';
import { ResetPassword } from './pages/auth/ResetPassword.jsx';

// Customer Pages
import { Dashboard } from './pages/customer/Dashboard.jsx';
import { Accounts } from './pages/customer/Accounts.jsx';
import { Transactions } from './pages/customer/Transactions.jsx';
import { Transfer } from './pages/customer/Transfer.jsx';
import { Beneficiaries } from './pages/customer/Beneficiaries.jsx';
import { Bills } from './pages/customer/Bills.jsx';
import { Statements } from './pages/customer/Statements.jsx';
import { Notifications } from './pages/customer/Notifications.jsx';
import { Profile } from './pages/customer/Profile.jsx';
import { SecuritySettings } from './pages/customer/SecuritySettings.jsx';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard.jsx';
import { AdminUsers } from './pages/admin/AdminUsers.jsx';
import { AdminTransactions } from './pages/admin/AdminTransactions.jsx';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs.jsx';

// 404
import { NotFound } from './pages/NotFound.jsx';

export default function App() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <Routes>
      {/* Root redirection */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            isAdmin ? (
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Auth Public Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Customer Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/transfer" element={<Transfer />} />
        <Route path="/beneficiaries" element={<Beneficiaries />} />
        <Route path="/bills" element={<Bills />} />
        <Route path="/statements" element={<Statements />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/security" element={<SecuritySettings />} />
      </Route>

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="customers" element={<AdminUsers />} />
        <Route path="transactions" element={<AdminTransactions />} />
        <Route path="audit-logs" element={<AdminAuditLogs />} />
      </Route>

      {/* 404 Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
