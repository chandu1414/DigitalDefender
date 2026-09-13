import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  Download, 
  Upload, 
  Search, 
  Trash2, 
  Shield, 
  Lock, 
  CheckCircle, 
  AlertCircle, 
  BarChart3, 
  RefreshCw,
  EyeOff,
  UserCheck,
  UserX,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user, token, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'resources'
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, totalDownloads: 0, totalResources: 0 });
  const [usersList, setUsersList] = useState([]);
  const [resourcesList, setResourcesList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadTopic, setUploadTopic] = useState('Cybersecurity');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadAuthor, setUploadAuthor] = useState('DigitalDefender Security Team');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const topics = [
    'Cybersecurity',
    'Privacy & OSINT',
    'Internet Safety',
    'Tech Explained',
    'Online Scams',
    'Digital Protection'
  ];

  // Protect Admin route
  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
    }
  }, [isAdmin, navigate]);

  // Load Admin Data
  const fetchData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      // 1. Stats
      const statsRes = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
      }

      // 2. Users
      const usersRes = await fetch(`/api/admin/users?search=${encodeURIComponent(searchQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsersList(data.users || []);
      }

      // 3. Resources
      const resRes = await fetch('/api/resources', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resRes.ok) {
        const data = await resRes.json();
        setResourcesList(data.resources || []);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, searchQuery]);

  // Toggle user status
  const handleToggleUserStatus = async (targetUser) => {
    const nextStatus = targetUser.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch(`/api/admin/users/${targetUser.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });

      if (res.ok) {
        setActionMessage(`Updated account status for ${targetUser.email} to ${nextStatus}.`);
        setTimeout(() => setActionMessage(''), 4000);
        fetchData();
      }
    } catch (err) {
      alert('Error updating user status.');
    }
  };

  // Upload new study note PDF
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploadError('');

    if (!selectedFile) {
      setUploadError('Please choose a PDF file to upload.');
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Only .pdf files are accepted.');
      return;
    }

    const formData = new FormData();
    formData.append('title', uploadTitle);
    formData.append('topic', uploadTopic);
    formData.append('description', uploadDescription);
    formData.append('author', uploadAuthor);
    formData.append('pdf', selectedFile);

    setUploading(true);

    try {
      const res = await fetch('/api/admin/resources', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed.');
      }

      setActionMessage(`Published "${uploadTitle}" successfully!`);
      setTimeout(() => setActionMessage(''), 4000);

      // Reset form
      setUploadTitle('');
      setUploadDescription('');
      setSelectedFile(null);
      // Reset input element
      const fileInput = document.getElementById('pdf-upload-input');
      if (fileInput) fileInput.value = '';

      fetchData();
      setActiveTab('resources');
    } catch (err) {
      setUploadError(err.message || 'Error uploading file.');
    } finally {
      setUploading(false);
    }
  };

  // Delete Resource
  const handleDeleteResource = async (resource) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${resource.title}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/resources/${resource.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setActionMessage(`Deleted "${resource.title}".`);
        setTimeout(() => setActionMessage(''), 4000);
        fetchData();
      }
    } catch (err) {
      alert('Failed to delete resource.');
    }
  };

  const formatDate = (isoString) => {
    if (!isoString || isoString === 'Never') return 'Never';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-slate-800 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Shield className="w-3.5 h-3.5" />
              Administrative Control Panel
            </div>
            <h1 className="text-3xl font-extrabold text-white">DigitalDefender Admin</h1>
            <p className="text-slate-400 text-sm mt-1">
              Logged in as <span className="text-amber-300 font-medium">{user?.email}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
            <Link
              to="/resources"
              className="px-3.5 py-2 rounded-xl bg-[#1FA8A0]/10 border border-[#1FA8A0]/30 hover:bg-[#1FA8A0]/20 text-[#1FA8A0] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              View Public Library
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 my-8">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Total Registered</span>
              <Users className="w-4 h-4 text-[#1FA8A0]" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white">{stats.totalUsers}</div>
            <span className="text-[11px] text-slate-500">All registered users</span>
          </div>

          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Active Accounts</span>
              <UserCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400">{stats.activeUsers}</div>
            <span className="text-[11px] text-slate-500">Status: active</span>
          </div>

          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Notes Downloaded</span>
              <Download className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-amber-400">{stats.totalDownloads}</div>
            <span className="text-[11px] text-slate-500">Total gated downloads</span>
          </div>

          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Published PDFs</span>
              <FileText className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-cyan-400">{stats.totalResources}</div>
            <span className="text-[11px] text-slate-500">Live study guides</span>
          </div>
        </div>

        {/* Global Action Toast */}
        {actionMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Tabs & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 border-b sm:border-b-0 border-slate-800 pb-2 sm:pb-0">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'users'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              User Directory ({stats.totalUsers})
            </button>

            <button
              onClick={() => setActiveTab('resources')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'resources'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              Resource Files & Upload ({stats.totalResources})
            </button>
          </div>

          {/* User Search Input */}
          {activeTab === 'users' && (
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          )}
        </div>

        {/* TAB 1: USERS DIRECTORY */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            
            {/* Security Guarantee Banner */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2.5 text-xs text-slate-400">
              <EyeOff className="w-4 h-4 text-[#1FA8A0] shrink-0" />
              <span>
                <strong>Zero Password Exposure:</strong> Per security guidelines, user passwords are encrypted with one-way salted bcrypt. Passwords are never retrieved, stored in session, or shown to administrators.
              </span>
            </div>

            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] sm:text-xs tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Joined Date</th>
                      <th className="px-6 py-4">Last Login</th>
                      <th className="px-6 py-4 text-center">Notes Downloaded</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="text-center py-12 text-slate-500">
                          Loading user directory...
                        </td>
                      </tr>
                    ) : usersList.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-12 text-slate-500">
                          No users found matching "{searchQuery}".
                        </td>
                      </tr>
                    ) : (
                      usersList.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#1FA8A0]/20 text-[#1FA8A0] font-bold text-xs flex items-center justify-center">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-white">{u.name}</div>
                                {u.role === 'admin' && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold uppercase">
                                    Admin
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 font-mono text-slate-300">
                            {u.email}
                          </td>

                          <td className="px-6 py-4 text-slate-400 text-xs">
                            {formatDate(u.created_at)}
                          </td>

                          <td className="px-6 py-4 text-slate-400 text-xs">
                            {formatDate(u.last_login_at)}
                          </td>

                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#1FA8A0]/10 text-[#1FA8A0] border border-[#1FA8A0]/20">
                              {u.download_count || 0}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              u.status === 'active' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            }`}>
                              {u.status === 'active' ? 'Active' : 'Suspended'}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-right">
                            {u.role !== 'admin' && (
                              <button
                                onClick={() => handleToggleUserStatus(u)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                                  u.status === 'active'
                                    ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                }`}
                              >
                                {u.status === 'active' ? 'Suspend' : 'Activate'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RESOURCE MANAGEMENT & FILE UPLOAD */}
        {activeTab === 'resources' && (
          <div className="space-y-8">
            
            {/* Upload Box */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                <Upload className="w-4 h-4" />
                Upload New Study Notes File
              </div>
              <h3 className="text-xl font-bold text-white mb-6">
                Publish a New Cybersecurity Guide / PDF
              </h3>

              {uploadError && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              <form onSubmit={handleUploadSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Wi-Fi Hardening Checklist 2026"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Topic Tag
                    </label>
                    <select
                      value={uploadTopic}
                      onChange={(e) => setUploadTopic(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      {topics.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Description / Overview
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Brief description of what this study guide covers..."
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Author / Department
                    </label>
                    <input
                      type="text"
                      value={uploadAuthor}
                      onChange={(e) => setUploadAuthor(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Select PDF File
                    </label>
                    <input
                      id="pdf-upload-input"
                      type="file"
                      required
                      accept=".pdf,application/pdf"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500/20 file:text-amber-300 hover:file:bg-amber-500/30 cursor-pointer"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-amber-500/20 flex items-center gap-2"
                >
                  {uploading ? 'Uploading PDF Document...' : 'Upload & Publish Note'}
                </button>
              </form>
            </div>

            {/* Existing Resources Table */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Live Study Notes Library</h3>
                <span className="text-xs text-slate-400">{resourcesList.length} files hosted</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] sm:text-xs tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4">Title & Topic</th>
                      <th className="px-6 py-4">File Name</th>
                      <th className="px-6 py-4">Size</th>
                      <th className="px-6 py-4 text-center">Total Downloads</th>
                      <th className="px-6 py-4">Published Date</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {resourcesList.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-white">{r.title}</div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[#1FA8A0]/10 text-[#1FA8A0] font-medium">
                            {r.topic}
                          </span>
                        </td>

                        <td className="px-6 py-4 font-mono text-xs text-slate-400">
                          {r.file_name}
                        </td>

                        <td className="px-6 py-4 font-mono text-xs text-slate-400">
                          {r.file_size}
                        </td>

                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            <Download className="w-3 h-3" />
                            {r.download_count || 0}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-slate-400 text-xs">
                          {formatDate(r.created_at)}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteResource(r)}
                            title="Delete resource"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
