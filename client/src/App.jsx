import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import BasicsPage from './pages/BasicsPage';
import ResourcesPage from './pages/ResourcesPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLoginPage from './pages/AdminLoginPage';

function RouteSEO() {
  const location = useLocation();

  useEffect(() => {
    const titles = {
      '/': 'DigitalDefender | Cybersecurity & Digital Safety',
      '/basics': 'Basics of Cybersecurity | DigitalDefender',
      '/resources': 'Cybersecurity Study Notes & Resources | DigitalDefender',
      '/login': 'Sign In | DigitalDefender',
      '/signup': 'Create Free Account | DigitalDefender',
      '/forgot-password': 'Reset Password | DigitalDefender',
      '/admin': 'Admin Dashboard | DigitalDefender',
      '/admin/login': 'Admin Sign In | DigitalDefender'
    };

    const currentTitle = titles[location.pathname] || 'DigitalDefender | Cybersecurity & Digital Safety';
    document.title = currentTitle;

    const canonical = document.querySelector("link[rel='canonical']");
    if (canonical) {
      canonical.setAttribute('href', `https://digitaldefender.onrender.com${location.pathname === '/' ? '/' : location.pathname}`);
    }
  }, [location]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <RouteSEO />
        <div className="flex flex-col min-h-screen bg-[#0B1120] text-slate-100 selection:bg-[#1FA8A0] selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/basics" element={<BasicsPage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
