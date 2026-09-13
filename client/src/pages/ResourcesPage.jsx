import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Download, 
  Search, 
  FileText, 
  Lock, 
  CheckCircle, 
  Filter, 
  ExternalLink, 
  AlertCircle,
  ShieldCheck,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTopic = searchParams.get('topic') || 'All';

  const [downloadingId, setDownloadingId] = useState(null);
  const [gatedModalOpen, setGatedModalOpen] = useState(false);
  const [selectedResourceForGate, setSelectedResourceForGate] = useState(null);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState(null);

  const { isAuthenticated, token, user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const topics = [
    'All',
    'Cybersecurity',
    'Privacy & OSINT',
    'Internet Safety',
    'Tech Explained',
    'Online Scams',
    'Digital Protection'
  ];

  const fetchResources = async () => {
    try {
      setLoading(true);
      const url = selectedTopic === 'All' 
        ? '/api/resources' 
        : `/api/resources?topic=${encodeURIComponent(selectedTopic)}`;
      
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        setResources(data.resources || []);
      }
    } catch (err) {
      console.error('Failed to load resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [selectedTopic, token]);

  const handleTopicChange = (topic) => {
    if (topic === 'All') {
      searchParams.delete('topic');
    } else {
      searchParams.set('topic', topic);
    }
    setSearchParams(searchParams);
  };

  // Gated download handler
  const handleDownload = async (resource) => {
    if (!isAuthenticated) {
      // User is not logged in: show gate modal and option to redirect
      setSelectedResourceForGate(resource);
      setGatedModalOpen(true);
      return;
    }

    try {
      setDownloadingId(resource.id);
      const res = await fetch(`/api/resources/${resource.id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.status === 401) {
        setSelectedResourceForGate(resource);
        setGatedModalOpen(true);
        return;
      }

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to download file.');
        return;
      }

      // Convert response stream to blob and trigger download
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = resource.file_name || `${resource.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

      // Refresh list to update counters
      fetchResources();
      refreshUser();

      // Show toast
      setDownloadSuccessToast(`Downloaded "${resource.title}" successfully!`);
      setTimeout(() => setDownloadSuccessToast(null), 4000);

    } catch (err) {
      console.error('Download error:', err);
      alert('Error downloading resource. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const filtered = resources.filter(r => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return r.title.toLowerCase().includes(q) || 
           r.description.toLowerCase().includes(q) || 
           r.topic.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1FA8A0]/10 border border-[#1FA8A0]/30 text-[#1FA8A0] text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Gated Study Notes Library
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              Cybersecurity Study Notes & Guides
            </h1>
            <p className="text-slate-400 text-base sm:text-lg mt-3 max-w-2xl">
              Free educational PDFs and practical security checklists. Browse topics freely — sign in to download full PDF documents to your device.
            </p>
          </div>

          {/* User Status Badge */}
          <div className="shrink-0 bg-[#0F172A] border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    Account Active: <span className="text-[#1FA8A0]">{user.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {user.download_count || 0} files downloaded to date
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">Browsing in Guest Mode</div>
                  <Link to="/login?redirect=/resources" className="text-[11px] text-[#1FA8A0] hover:underline font-medium">
                    Log in to enable 1-click downloads
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Topic Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {topics.map(t => (
              <button
                key={t}
                onClick={() => handleTopicChange(t)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedTopic === t
                    ? 'bg-[#1FA8A0] text-white shadow-md shadow-[#1FA8A0]/25'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search study notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#1FA8A0] transition-colors"
            />
          </div>

        </div>

        {/* Success Toast */}
        {downloadSuccessToast && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4" />
            <span>{downloadSuccessToast}</span>
          </div>
        )}

        {/* Resources Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-[#1FA8A0] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p>Loading study resources...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No Study Notes Found</h3>
            <p className="text-slate-400 text-sm mb-6">
              No notes matched your query or topic filter. Try selecting "All" or typing a different search term.
            </p>
            <button
              onClick={() => { setSearchQuery(''); handleTopicChange('All'); }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-300"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 rounded-md bg-[#1FA8A0]/10 border border-[#1FA8A0]/30 text-[#1FA8A0] text-xs font-semibold">
                      {item.topic}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {item.file_size || 'PDF'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#1FA8A0] transition-colors leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" />
                    <span>{item.download_count || 0} downloads</span>
                  </div>

                  <button
                    onClick={() => handleDownload(item)}
                    disabled={downloadingId === item.id}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isAuthenticated
                        ? 'bg-[#1FA8A0] hover:bg-[#26C7BD] text-white shadow-md shadow-[#1FA8A0]/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {downloadingId === item.id ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Downloading...
                      </>
                    ) : isAuthenticated ? (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        Download PDF
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        Sign in to Download
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Gated Access Modal */}
        {gatedModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0F172A] border border-slate-700 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-center animate-in fade-in zoom-in-95 duration-200">
              
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-teal-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-5 shadow-lg">
                <Lock className="w-8 h-8" />
              </div>

              <span className="text-xs font-bold uppercase tracking-wider text-[#1FA8A0]">Members-Only Resource</span>
              <h3 className="text-2xl font-bold text-white mt-1 mb-3">
                Create a free account to download this resource
              </h3>
              
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                You are trying to download <span className="font-semibold text-white">"{selectedResourceForGate?.title}"</span>. Create a quick, free DigitalDefender account or log in to unlock instant PDF downloads.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => navigate(`/signup?redirect=/resources&resource=${selectedResourceForGate?.id}`)}
                  className="w-full py-3 rounded-xl bg-[#1FA8A0] hover:bg-[#26C7BD] text-white font-semibold text-sm transition-all shadow-md shadow-[#1FA8A0]/25"
                >
                  Create Free Account
                </button>

                <button
                  onClick={() => navigate(`/login?redirect=/resources&msg=gate&resource=${selectedResourceForGate?.id}`)}
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold text-sm transition-all"
                >
                  Log In to Existing Account
                </button>

                <button
                  onClick={() => setGatedModalOpen(false)}
                  className="text-xs text-slate-500 hover:text-slate-400 py-1"
                >
                  Continue Browsing Without Downloading
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
