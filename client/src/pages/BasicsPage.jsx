import React, { useState } from 'react';
import { 
  KeyRound, 
  Search, 
  ShieldCheck, 
  Wifi, 
  Smartphone, 
  HardDrive, 
  Lock, 
  Check, 
  X, 
  HelpCircle, 
  AlertCircle, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BasicsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [quizAnswer, setQuizAnswer] = useState(null);

  const explainers = [
    {
      id: '2fa',
      title: 'What is 2FA (Two-Factor Authentication)?',
      icon: KeyRound,
      tagline: 'Two keys are always better than one.',
      category: 'Protection',
      simpleExplanation: 'Imagine your house had a physical key lock, plus a keypad requiring a 6-digit code that changes every 30 seconds on your watch. Even if a thief steals your physical key, they still cannot get inside without that second code.',
      whyItMatters: 'Over 80% of account takeovers happen because someone reused a leaked password. 2FA blocks attackers even if they know your exact password.',
      actionTip: 'Always choose an Authenticator App (like Bitwarden, Google Authenticator, or Aegis) instead of SMS text messages when available.'
    },
    {
      id: 'fake-links',
      title: 'How to Spot a Fake Link',
      icon: Search,
      tagline: 'Look right before the first slash.',
      category: 'Scams',
      simpleExplanation: 'Scammers create website names that look almost identical to real ones. For example: "paypal-security-login.com" or "netflixx-billing.com". The secret is to look at the letters immediately preceding the first single slash (/): that is the actual domain owning the site.',
      whyItMatters: 'Clicking a convincing fake link leads to a fake login page that records your password as you type it.',
      actionTip: 'On a computer, hover your mouse over any link before clicking to view the actual destination in the bottom corner of your browser.'
    },
    {
      id: 'password-manager',
      title: 'Why You Need a Password Manager',
      icon: Lock,
      tagline: 'Stop memorizing passwords — let a vault do it.',
      category: 'Protection',
      simpleExplanation: 'The average person has over 80 online accounts. Nobody can remember 80 distinct strings like "xK9!mQ2#zL". A password manager acts as a digital safe: you remember one strong master phrase, and it creates, stores, and autofills unique 24-character passwords for every site.',
      whyItMatters: 'When you reuse "Summer2024!" everywhere and one random fitness forum gets breached, attackers immediately try that password on your Amazon, email, and bank.',
      actionTip: 'Reputable free managers like Bitwarden or 1Password work seamlessly across your phone, tablet, and computer.'
    },
    {
      id: 'vpn-truth',
      title: 'What is a VPN (and What Does It NOT Do)?',
      icon: Wifi,
      tagline: 'An encrypted tunnel, not an invincible shield.',
      category: 'Internet Safety',
      simpleExplanation: 'A VPN (Virtual Private Network) wraps your internet traffic in an encrypted tunnel between your computer and the VPN provider’s server. It prevents the hotel or airport Wi-Fi from eavesdropping on what sites you connect to.',
      whyItMatters: 'VPN marketing often exaggerates: a VPN will NOT prevent you from entering your password on a phishing site, nor will it stop viruses if you download suspicious files.',
      actionTip: 'Use a trusted VPN when on public hotel or coffee shop Wi-Fi networks, but remember that safe browsing habits still apply.'
    },
    {
      id: 'updates',
      title: 'Why Software Updates are Actually Security Patches',
      icon: ShieldCheck,
      tagline: 'Closing the digital windows you forgot you had.',
      category: 'Protection',
      simpleExplanation: 'Software is written by humans, which means security oversights (vulnerabilities) are discovered regularly. When Apple, Microsoft, or Google release an update, they are fixing known holes that hackers have begun exploiting.',
      whyItMatters: 'Postponing updates for months leaves known security gaps wide open on your device.',
      actionTip: 'Turn on "Automatic Updates" for your operating system and web browsers. Restart your device once a week.'
    },
    {
      id: 'backups',
      title: 'Device Backups: The Only Real Defense Against Ransomware',
      icon: HardDrive,
      tagline: 'If you only have one copy, you don’t really own it.',
      category: 'Internet Safety',
      simpleExplanation: 'Ransomware is malware that scrambles all your photos and documents, demanding thousands of dollars to restore them. If you keep an updated external backup, you can simply erase the infected machine and restore your files for free.',
      whyItMatters: 'Hard drives also fail, phones fall in water, and laptops get stolen. A backup eliminates disaster anxiety.',
      actionTip: 'Follow the simple 3-2-1 rule: Keep 3 copies of important data on 2 different media types, with 1 copy stored off-site or in secure cloud storage.'
    },
    {
      id: 'app-permissions',
      title: 'App Permissions: Why Does a Calculator Need Your Contacts?',
      icon: Smartphone,
      tagline: 'Practice the principle of minimum privilege.',
      category: 'Privacy',
      simpleExplanation: 'When an app on your phone requests permission to access your microphone, camera, contacts, or precise location, ask yourself: does this app require this data to perform its core function?',
      whyItMatters: 'Free apps frequently bundle data broker trackers that harvest your location and address book to sell to marketing aggregators.',
      actionTip: 'Review your phone settings under Privacy > Permission Manager. Set location access to "Only while using the app".'
    }
  ];

  const categories = ['all', 'Protection', 'Scams', 'Internet Safety', 'Privacy'];

  const filteredExplainers = activeTab === 'all' 
    ? explainers 
    : explainers.filter(e => e.category.toLowerCase() === activeTab.toLowerCase());

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1FA8A0]/10 border border-[#1FA8A0]/30 text-[#1FA8A0] text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Plain Language Guides • Zero Jargon
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Basics of Cybersecurity
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Essential concepts explained simply. No complex acronyms or hacker clichés — just practical knowledge to keep you and your family safe online.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                activeTab === cat
                  ? 'bg-[#1FA8A0] text-white shadow-md shadow-[#1FA8A0]/25'
                  : 'bg-[#0F172A] text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
              }`}
            >
              {cat === 'all' ? 'All Explainers' : cat}
            </button>
          ))}
        </div>

        {/* Explainers List */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Foundational Security Guides
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Plain-English breakdowns of fundamental concepts to secure your digital footprint.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {filteredExplainers.map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.id} 
                className="bg-[#0F172A] border border-slate-800 rounded-3xl p-7 hover:border-[#1FA8A0]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#1FA8A0]/10 border border-[#1FA8A0]/30 flex items-center justify-center text-[#1FA8A0]">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-slate-800 text-slate-300">
                      {item.category}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm font-medium text-[#1FA8A0] mb-4">{item.tagline}</p>

                  <div className="space-y-4 text-sm text-slate-300">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Simple Explanation:</h4>
                      <p className="leading-relaxed text-slate-300">{item.simpleExplanation}</p>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">Why It Matters:</h4>
                      <p className="leading-relaxed text-slate-400">{item.whyItMatters}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-800/80 bg-slate-900/40 -mx-7 -mb-7 p-5 rounded-b-3xl">
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-[#1FA8A0]/20 text-[#1FA8A0] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <div>
                      <span className="font-bold text-[#1FA8A0]">Action Step: </span>
                      {item.actionTip}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Practice Quiz Section */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-8 md:p-10 mb-16">
          <div className="max-w-2xl mx-auto text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1FA8A0]">Interactive Skill Check</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1 mb-3">
              Can You Spot The Phishing URL?
            </h2>
            <p className="text-slate-400 text-sm mb-8">
              A text message arrives claiming your package delivery failed. Which of these two addresses is safe to tap?
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-left">
              <button
                onClick={() => setQuizAnswer('A')}
                className={`p-5 rounded-2xl border transition-all text-sm flex flex-col justify-between ${
                  quizAnswer === 'A'
                    ? 'border-rose-500 bg-rose-500/10 text-rose-200'
                    : 'border-slate-700 bg-slate-900/60 hover:border-slate-600 text-slate-200'
                }`}
              >
                <div className="font-mono text-xs sm:text-sm text-slate-300 mb-2">
                  https://usps-track-package-verify.info/login
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <span>Option A</span>
                  {quizAnswer === 'A' && <X className="w-4 h-4 text-rose-400" />}
                </div>
              </button>

              <button
                onClick={() => setQuizAnswer('B')}
                className={`p-5 rounded-2xl border transition-all text-sm flex flex-col justify-between ${
                  quizAnswer === 'B'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-200'
                    : 'border-slate-700 bg-slate-900/60 hover:border-slate-600 text-slate-200'
                }`}
              >
                <div className="font-mono text-xs sm:text-sm text-slate-300 mb-2">
                  https://tools.usps.com/go/TrackConfirmAction
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <span>Option B (Official)</span>
                  {quizAnswer === 'B' && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
              </button>
            </div>

            {quizAnswer && (
              <div className={`p-4 rounded-2xl text-xs sm:text-sm text-left leading-relaxed ${
                quizAnswer === 'B' 
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' 
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              }`}>
                {quizAnswer === 'B' ? (
                  <p>
                    <strong>Correct!</strong> Option B is the authentic USPS website. The actual domain is <code>usps.com</code> (preceding the single slash). Option A uses a throwaway domain <code>.info</code> with the words "usps-track-package-verify" hyphenated to deceive you.
                  </p>
                ) : (
                  <p>
                    <strong>Careful!</strong> Option A is an imposter. Look right before the first slash: the real website owner is <code>usps-track-package-verify.info</code>, NOT the real <code>usps.com</code>. Always verify the domain name itself.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Callout to Notes */}
        <div className="text-center">
          <p className="text-slate-400 text-sm mb-4">Want printable PDF reference cards for these topics?</p>
          <Link
            to="/resources"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1FA8A0] hover:bg-[#26C7BD] text-white font-semibold text-sm transition-all shadow-md shadow-[#1FA8A0]/25"
          >
            Go to Gated Study Notes Library
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
