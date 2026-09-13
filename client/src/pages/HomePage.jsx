import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Eye, 
  Globe, 
  Cpu, 
  AlertTriangle, 
  Lock, 
  ArrowRight, 
  BookOpen, 
  Sparkles, 
  Download, 
  CheckCircle2, 
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function HomePage() {
  const [selectedArticle, setSelectedArticle] = useState(null);

  // 6 Specified Category Cards
  const categories = [
    {
      id: 'cybersecurity',
      title: 'Cybersecurity',
      icon: ShieldCheck,
      description: 'Foundational concepts, attack vectors, and systematic digital defenses without confusing jargon.',
      topicFilter: 'Cybersecurity'
    },
    {
      id: 'privacy-osint',
      title: 'Privacy & OSINT',
      icon: Eye,
      description: 'Understand digital footprints, open-source intelligence, and how data aggregators catalog your life.',
      topicFilter: 'Privacy & OSINT'
    },
    {
      id: 'internet-safety',
      title: 'Internet Safety',
      icon: Globe,
      description: 'Practical habits for public Wi-Fi, home networks, safe browsing, and device hardening.',
      topicFilter: 'Internet Safety'
    },
    {
      id: 'tech-explained',
      title: 'Tech Explained',
      icon: Cpu,
      description: 'Demystifying encryption algorithms, web protocols, DNS servers, and modern security architectures.',
      topicFilter: 'Tech Explained'
    },
    {
      id: 'online-scams',
      title: 'Online Scams',
      icon: AlertTriangle,
      description: 'Recognizing social engineering, modern phishing traps, smishing, and deceptive financial fraud.',
      topicFilter: 'Online Scams'
    },
    {
      id: 'digital-protection',
      title: 'Digital Protection',
      icon: Lock,
      description: 'Actionable checklists, password managers, multi-factor authentication, and threat defense routines.',
      topicFilter: 'Digital Protection'
    }
  ];

  // "Cybersecurity, Explained Simply" Article Grid
  const articles = [
    {
      id: 'username-osint',
      title: 'Can Someone Find You With Just Your Username?',
      category: 'Privacy & OSINT',
      readTime: '4 min read',
      summary: 'Reusing the same handle across platforms creates an invisible trail that automated OSINT tools can assemble into a complete profile in seconds.',
      content: `When you register for services using the exact same username (e.g. your childhood gamertag or preferred handle), you unwittingly create a unique fingerprint across the web.

Tools like Sherlock and Maigret query over 400 social platforms, coding sites, and forums in under 30 seconds. If your username is unique, a stranger can link your casual forum comments from 2018 to your active social accounts today.

### The Defensive Solution:
1. **Handle Compartmentalization**: Use different aliases for public gaming, professional profiles, and personal communication.
2. **Periodic Audits**: Search your own username in quotation marks across search engines to see what appears.
3. **Delete Abandoned Accounts**: Old forums and defunct websites often suffer data leaks that expose old email-to-username mappings.`
    },
    {
      id: 'http-vs-https',
      title: 'HTTP vs HTTPS: What the Little Lock Really Means',
      category: 'Tech Explained',
      readTime: '3 min read',
      summary: 'HTTPS encrypts data in transit between your browser and the web server, but it doesn’t automatically mean the website itself is trustworthy.',
      content: `In the early days of the web, HTTP (Hypertext Transfer Protocol) transmitted everything as plaintext. Anyone eavesdropping on your network or local coffee shop Wi-Fi could read your passwords and form submissions.

HTTPS adds TLS/SSL (Transport Layer Security) encryption. All transmitted packets are scrambled so that only you and the server hold the cryptographic keys to decipher them.

### Common Misconception:
The padlock icon means the connection is encrypted; **it does NOT mean the website is honest**. Scammers can easily obtain free SSL certificates. Always verify the domain name spelling, not just the presence of the lock.`
    },
    {
      id: 'phishing-psychology',
      title: 'How Phishing Tricks Your Brain',
      category: 'Online Scams',
      readTime: '5 min read',
      summary: 'Cybercriminals rarely hack code first — they hack human psychology. Discover why urgency, authority, and fear cause smart people to click.',
      content: `Modern phishing attacks succeed not through advanced software exploits, but by triggering cognitive biases:

1. **Artificial Urgency**: "Account suspended in 24 hours" creates panic, overriding the analytical prefrontal cortex.
2. **Authority Bias**: Messages disguised as bank fraud departments or workplace IT administrators bypass our natural skepticism.
3. **Curiosity & Relief**: "Unrecognized login from Moscow" provokes an immediate instinctive urge to tap the link and 'cancel' the unauthorized action.

### The 10-Second Rule:
Whenever an email or text urges immediate action regarding money or accounts, stop for 10 seconds. Manually open your browser and visit the official website directly. Never click the link in the message.`
    },
    {
      id: 'leaked-passwords',
      title: 'What Happens When Your Password Gets Leaked?',
      category: 'Cybersecurity',
      readTime: '4 min read',
      summary: 'From database dump to credential stuffing botnets: how breached credentials are traded on forums and tested against thousands of web services.',
      content: `When a retailer or service provider gets breached, attackers extract database tables. Even if passwords were encrypted with older algorithms, high-speed GPUs can crack millions of simple hashes per second.

Once cracked, the credential pairs (email:password) are loaded into automated bots that execute **credential stuffing attacks**.

These bots test your login on Netflix, Amazon, PayPal, banking portals, and email providers within hours of the leak.

### The Antidote:
- A dedicated password manager generates unique 20+ character passwords for every single site. If one service is compromised, none of your other accounts are at risk.`
    },
    {
      id: 'public-wifi-trust',
      title: 'Can Public Wi-Fi Really Be Trusted?',
      category: 'Internet Safety',
      readTime: '5 min read',
      summary: 'The reality of open Wi-Fi at airports and cafes, evil twin routers, and the simple settings that keep your traffic secure anywhere.',
      content: `Open Wi-Fi networks (networks without a Wi-Fi password prompt) do not encrypt the local wireless airwaves between your laptop antenna and the access point.

An attacker sitting nearby can run an "Evil Twin" attack — broadcasting a network named "Airport_Free_WiFi" that routes your traffic through their machine.

### What Actually Keeps You Safe:
- Modern HTTPS prevents plain HTTP inspection even on rogue networks.
- However, DNS queries (the website domain names you look up) may still leak without encrypted DNS.
- Turn off "Auto-Join Open Networks" and "File Sharing" when connecting to public venues.`
    },
    {
      id: 'incognito-mode-truth',
      title: 'Is Incognito Mode Actually Private?',
      category: 'Tech Explained',
      readTime: '3 min read',
      summary: 'Incognito wipes local browsing history and cookies from your own computer, but does not hide your activity from ISPs, school networks, or websites.',
      content: `Private or "Incognito" browsing mode is widely misunderstood.

### What It Does:
- Does not save your browsing history to your local computer.
- Discards session cookies and temporary cache files when the window closes.
- Useful when shopping for gifts on a shared family laptop or logging into a temporary account.

### What It Does NOT Do:
- Does NOT hide your IP address from websites you visit.
- Does NOT conceal your web traffic from your internet service provider (ISP), employer, or school network administrator.
- Does NOT protect you from malware downloads or phishing sites.`
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32 cyber-grid border-b border-slate-800/80">
        {/* Subtle Ambient Radial Glow (Restrained futuristic feel) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#1FA8A0]/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Hero Tag Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1FA8A0]/10 border border-[#1FA8A0]/30 text-[#1FA8A0] text-xs font-semibold uppercase tracking-wider mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            Digital Safety & Security Knowledge
          </div>

          {/* Specified Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
            DigitalDefender — <span className="text-[#1FA8A0] teal-text-glow">Stay Smarter.</span> Stay Safer.
          </h1>

          {/* Specified Tagline */}
          <p className="text-xl sm:text-2xl text-slate-300 font-medium max-w-2xl mx-auto mb-6">
            Simple cybersecurity knowledge for the digital world.
          </p>

          {/* Specified Intro Line */}
          <p className="text-slate-400 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed mb-10">
            DigitalDefender makes cybersecurity simple, practical, and accessible. Discover how online threats work, how your data can be exposed, and how to protect yourself.
          </p>

          {/* Specified CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#topics"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#1FA8A0] hover:bg-[#26C7BD] text-white font-semibold text-base transition-all shadow-lg shadow-[#1FA8A0]/25 hover:shadow-[#1FA8A0]/40 flex items-center justify-center gap-2 group"
            >
              Explore Topics
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            
            <Link
              to="/basics"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-slate-600 text-slate-200 font-semibold text-base transition-all flex items-center justify-center gap-2"
            >
              Learn More
              <BookOpen className="w-4 h-4 text-[#1FA8A0]" />
            </Link>
          </div>

          {/* Featured Study Notes Banner Callout */}
          <div className="mt-14 inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-[#0F172A]/80 border border-slate-700/80 text-xs sm:text-sm text-slate-300">
            <div className="w-2 h-2 rounded-full bg-[#1FA8A0] animate-ping" />
            <span>Curated Study Guides Available:</span>
            <Link to="/resources" className="text-[#1FA8A0] hover:underline font-semibold flex items-center gap-1">
              Browse Notes Library
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* 6 Category Cards Section */}
      <section id="topics" className="py-20 bg-[#070B14] border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#1FA8A0] mb-3">Core Disciplines</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white">
              Explore Our Defensive Domains
            </p>
            <p className="text-slate-400 mt-3 text-base">
              Clear, practical principles organized by security domains so you can focus on what matters to you.
            </p>
          </div>

          {/* 6 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.id}
                  className="bg-[#0F172A] border border-slate-800 rounded-2xl p-7 hover:border-[#1FA8A0]/50 hover:bg-[#111c34] transition-all duration-300 group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-[#1FA8A0]/10 border border-[#1FA8A0]/30 flex items-center justify-center text-[#1FA8A0] group-hover:scale-110 group-hover:bg-[#1FA8A0] group-hover:text-white transition-all duration-300 mb-5">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#1FA8A0] transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                      {cat.description}
                    </p>
                  </div>

                  <Link
                    to={`/resources?topic=${encodeURIComponent(cat.topicFilter)}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1FA8A0] hover:text-white transition-colors"
                  >
                    View Study Notes & Articles
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* "Cybersecurity, Explained Simply" Article Grid */}
      <section className="py-20 bg-[#0B1120] border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1FA8A0] mb-3">
                <BookOpen className="w-4 h-4" />
                Featured Insights
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Cybersecurity, Explained Simply
              </h2>
              <p className="text-slate-400 mt-2 text-base">
                Real-world threats broken down into everyday analogies without confusing industry jargon.
              </p>
            </div>

            <Link
              to="/basics"
              className="text-sm font-semibold text-[#1FA8A0] hover:underline flex items-center gap-1 shrink-0"
            >
              Explore All Beginner Guides
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Article Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 hover:shadow-xl transition-all cursor-pointer group"
                onClick={() => setSelectedArticle(article)}
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                    <span className="px-2.5 py-1 rounded-md bg-slate-800 text-[#1FA8A0] font-medium">
                      {article.category}
                    </span>
                    <span>{article.readTime}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-[#1FA8A0] transition-colors mb-3 leading-snug">
                    {article.title}
                  </h3>

                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    {article.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[#1FA8A0] font-semibold flex items-center gap-1 group-hover:underline">
                    Read Explainer
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="text-slate-500">Quick Read</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Interactive Gated Resources Call to Action */}
      <section className="py-20 bg-gradient-to-b from-[#0B1120] to-[#070B14]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#0F172A] to-[#131d33] border border-slate-700 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-80 h-80 bg-[#1FA8A0]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#1FA8A0]/20 text-[#1FA8A0] text-xs font-bold uppercase tracking-wider mb-4">
                <Download className="w-3.5 h-3.5" />
                Gated Defense Library
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
                Download Free Cybersecurity Study Notes & Checklists
              </h3>
              <p className="text-slate-300 text-base leading-relaxed mb-8">
                Created by our security team. Browse topic guides freely, or create a free DigitalDefender account to download high-resolution PDF checklists directly to your device.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/resources"
                  className="px-6 py-3 rounded-xl bg-[#1FA8A0] hover:bg-[#26C7BD] text-white font-semibold text-sm transition-all shadow-md shadow-[#1FA8A0]/25 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Browse Study Notes
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-semibold text-sm transition-all"
                >
                  Create Free Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-[#0F172A] border border-slate-700 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 my-8">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-6 right-6 p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-xs mb-3">
              <span className="px-2.5 py-1 rounded bg-[#1FA8A0]/20 text-[#1FA8A0] font-semibold">
                {selectedArticle.category}
              </span>
              <span className="text-slate-400">{selectedArticle.readTime}</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 pr-10">
              {selectedArticle.title}
            </h3>

            <div className="border-t border-slate-800 pt-6 text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-4">
              {selectedArticle.content}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">Published by DigitalDefender</span>
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-5 py-2 rounded-xl bg-[#1FA8A0] text-white font-medium text-sm hover:bg-[#26C7BD] transition-colors"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
