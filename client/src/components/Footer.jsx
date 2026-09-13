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

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                <span className="w-2 h-2 rounded-full bg-[#1FA8A0]" />
                <span className="text-slate-400">Created by:</span>
                <span className="font-semibold text-white">Bharath Chand</span>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-3 pt-1">
              <a
                href="https://www.instagram.com/digital.defender/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-[#1FA8A0] hover:border-[#1FA8A0]/40 transition-all group"
                aria-label="DigitalDefender Instagram channel"
              >
                <InstagramIcon className="w-4 h-4 text-[#1FA8A0]" />
                <span className="text-xs font-medium">@digital.defender</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              <a
                href="https://github.com/chandu1414/DigitalDefender"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-[#1FA8A0] hover:border-[#1FA8A0]/40 transition-all group"
                aria-label="DigitalDefender GitHub repository"
              >
                <svg className="w-4 h-4 text-[#1FA8A0]" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span className="text-xs font-medium">GitHub</span>
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
              <li>
                <a href="/#about" className="text-slate-400 hover:text-[#1FA8A0] transition-colors">About &amp; Creator</a>
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
          <p>© 2026 DigitalDefender Media Platform • Created by <span className="text-slate-300 font-medium">Bharath Chand</span>. Stay Smarter. Stay Safer.</p>
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
