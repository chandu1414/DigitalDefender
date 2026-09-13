import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, ShieldAlert, BookOpen, Download, User, LogOut, Menu, X, LayoutDashboard } from 'lucide-react';
import InstagramIcon from './InstagramIcon';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0B1120]/90 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1FA8A0] to-[#0f5b57] flex items-center justify-center shadow-lg shadow-[#1FA8A0]/20 group-hover:scale-105 transition-transform duration-300">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              Digital<span className="text-[#1FA8A0]">Defender</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium -mt-1">
              Cybersecurity & Safety
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link 
            to="/" 
            className={`text-sm font-medium transition-colors hover:text-[#1FA8A0] ${
              isActive('/') ? 'text-[#1FA8A0] font-semibold' : 'text-slate-300'
            }`}
          >
            Home
          </Link>
          <Link 
            to="/basics" 
            className={`text-sm font-medium transition-colors hover:text-[#1FA8A0] ${
              isActive('/basics') ? 'text-[#1FA8A0] font-semibold' : 'text-slate-300'
            }`}
          >
            Basics
          </Link>
          <a 
            href="/#topics" 
            className="text-sm font-medium text-slate-300 hover:text-[#1FA8A0] transition-colors"
          >
            Topics
          </a>
          <a 
            href="/#about" 
            className="text-sm font-medium text-slate-300 hover:text-[#1FA8A0] transition-colors"
          >
            About
          </a>
          <Link 
            to="/resources" 
            className={`text-sm font-medium transition-colors hover:text-[#1FA8A0] flex items-center gap-1.5 ${
              isActive('/resources') ? 'text-[#1FA8A0] font-semibold' : 'text-slate-300'
            }`}
          >
            <Download className="w-4 h-4 text-[#1FA8A0]" />
            Study Notes & Resources
          </Link>
        </nav>

        {/* Action Controls & Socials */}
        <div className="hidden md:flex items-center gap-4">
          {/* Instagram Link (as requested) */}
          <a
            href="https://www.instagram.com/digital.defender/"
            target="_blank"
            rel="noopener noreferrer"
            title="Follow @digital.defender on Instagram"
            className="w-10 h-10 rounded-xl bg-slate-800/80 hover:bg-[#1FA8A0]/20 border border-slate-700/80 hover:border-[#1FA8A0]/40 flex items-center justify-center text-slate-300 hover:text-[#1FA8A0] transition-all duration-200"
          >
            <InstagramIcon className="w-5 h-5" />
          </a>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-amber-500/20 transition-all"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Admin Panel
                </Link>
              )}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="w-8 h-8 rounded-full bg-[#1FA8A0]/20 border border-[#1FA8A0]/40 flex items-center justify-center text-[#1FA8A0] font-bold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-white truncate max-w-[120px]">{user.name}</span>
                  <span className="text-[10px] text-slate-400">{user.download_count || 0} notes downloaded</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Log out"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 rounded-lg bg-[#1FA8A0] hover:bg-[#26C7BD] text-white font-medium text-sm transition-all shadow-md shadow-[#1FA8A0]/20 hover:shadow-[#1FA8A0]/40"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-3">
          <a
            href="https://www.instagram.com/digital.defender/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-slate-300 hover:text-[#1FA8A0]"
          >
            <InstagramIcon className="w-5 h-5" />
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0B1120] border-b border-slate-800 px-4 pt-3 pb-6 space-y-4">
          <nav className="flex flex-col space-y-3">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-200 hover:text-[#1FA8A0] font-medium text-base py-1"
            >
              Home
            </Link>
            <Link
              to="/basics"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-200 hover:text-[#1FA8A0] font-medium text-base py-1"
            >
              Basics of Cybersecurity
            </Link>
            <a
              href="/#topics"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-200 hover:text-[#1FA8A0] font-medium text-base py-1"
            >
              Explore Topics
            </a>
            <a
              href="/#about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-200 hover:text-[#1FA8A0] font-medium text-base py-1"
            >
              About &amp; Creator
            </a>
            <Link
              to="/resources"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-200 hover:text-[#1FA8A0] font-medium text-base py-1 flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-[#1FA8A0]" />
              Study Notes & Resources
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="text-amber-300 hover:text-amber-200 font-medium text-base py-1 flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-amber-400" />
                Admin Dashboard
              </Link>
            )}
          </nav>

          <div className="pt-3 border-t border-slate-800">
            {isAuthenticated ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">{user.name}</div>
                  <div className="text-xs text-slate-400">{user.email}</div>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 text-xs font-semibold hover:bg-rose-500/20"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg border border-slate-700 text-slate-300 font-medium text-sm hover:border-slate-500"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg bg-[#1FA8A0] text-white font-medium text-sm hover:bg-[#26C7BD]"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
