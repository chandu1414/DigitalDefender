import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowUpRight, Lock, Heart } from 'lucide-react';
import InstagramIcon from './InstagramIcon';

export default function Footer() {
  return (
    <footer className="bg-[#070B14] border-t border-slate-800/80 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1FA8A0] to-[#0f5b57] flex items-center justify-center shadow-md shadow-[#1FA8A0]/20">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Digital<span className="text-[#1FA8A0]">Defender</span>
              </span>
            </div>
            
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              DigitalDefender makes cybersecurity simple, practical, and accessible. Discover how online threats work, how your personal data gets exposed, and how to protect yourself with confidence.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.instagram.com/digital.defender/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-[#1FA8A0] hover:border-[#1FA8A0]/40 transition-all group"
              >
                <InstagramIcon className="w-4 h-4 text-[#1FA8A0]" />
                <span className="text-xs font-medium">@digital.defender</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-slate-400 hover:text-[#1FA8A0] transition-colors">Homepage</Link>
              </li>
              <li>
                <Link to="/basics" className="text-slate-400 hover:text-[#1FA8A0] transition-colors">Basics of Cybersecurity</Link>
              </li>
              <li>
                <Link to="/resources" className="text-slate-400 hover:text-[#1FA8A0] transition-colors">Study Notes & Resources</Link>
              </li>
              <li>
                <a href="/#topics" className="text-slate-400 hover:text-[#1FA8A0] transition-colors">Category Topics</a>
              </li>
            </ul>
          </div>

          {/* Defensive Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Defensive Tools</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/login" className="text-slate-400 hover:text-[#1FA8A0] transition-colors">User Login</Link>
              </li>
              <li>
                <Link to="/signup" className="text-slate-400 hover:text-[#1FA8A0] transition-colors">Create Free Account</Link>
              </li>
              <li>
                <Link to="/resources" className="text-slate-400 hover:text-[#1FA8A0] transition-colors">Study Notes Library</Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 DigitalDefender Media Platform. Stay Smarter. Stay Safer.</p>
          <div className="flex items-center gap-6">
            <a 
              href="https://www.instagram.com/digital.defender/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-400 hover:text-[#1FA8A0] transition-colors flex items-center gap-1"
            >
              Instagram Channel
            </a>
            <span>•</span>
            <span>Zero Tracking & Plain Text Privacy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
