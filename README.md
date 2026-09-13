# DigitalDefender — Stay Smarter. Stay Safer.

A modern, full-stack cybersecurity and digital-safety media platform built with a **Python Flask** backend, **React (Vite)** frontend, and **Tailwind CSS**.

---

## 🌟 Key Features

1. **Homepage Design (Matching Specifications)**:
   - **Hero Section**: Dark navy (`#0B1120`) with vibrant teal (`#1FA8A0`) accent.
     - Headline: **"DigitalDefender — Stay Smarter. Stay Safer."**
     - Tagline: *"Simple cybersecurity knowledge for the digital world"*
     - CTA Buttons: *"Explore Topics"* (smooth scroll to categories) and *"Learn More"* (navigates to Basics).
     - Intro Line: *"DigitalDefender makes cybersecurity simple, practical, and accessible. Discover how online threats work, how your data can be exposed, and how to protect yourself."*
   - **6 Category Cards**:
     - *Cybersecurity*
     - *Privacy & OSINT*
     - *Internet Safety*
     - *Tech Explained*
     - *Online Scams*
     - *Digital Protection*
     (Each with custom icon, description, and link to filtered resources/topics)
   - **"Cybersecurity, Explained Simply" Article Grid**:
     - *Can Someone Find You With Just Your Username?*
     - *HTTP vs HTTPS: What the Little Lock Really Means*
     - *How Phishing Tricks Your Brain*
     - *What Happens When Your Password Gets Leaked?*
     - *Can Public Wi-Fi Really Be Trusted?*
     - *Is Incognito Mode Actually Private?*
     - Complete with an interactive modal reader for seamless on-page reading.
   - **Aesthetics**: Clean, slightly futuristic tone. No hacker clichés (no green matrix code, no skulls, no overly dark visuals). Smooth, restrained animations. Responsive across mobile, tablet, and desktop.
   - **Social Channel**: Instagram icon/link in both header and footer pointing directly to `https://www.instagram.com/digital.defender/`.

2. **Basics of Cybersecurity Section (`/basics`)**:
   - 7 beginner-friendly explainers written in plain, jargon-free English:
     - *What is 2FA (Two-Factor Authentication)?*
     - *How to Spot a Fake Link*
     - *Why You Need a Password Manager*
     - *What is a VPN (and What Does It NOT Do?)*
     - *Why Software Updates are Actually Security Patches*
     - *Device Backups: The Only Real Defense Against Ransomware*
     - *App Permissions: Why Does a Calculator Need Your Contacts?*
   - Interactive *"Can You Spot The Phishing URL?"* real-time skill test.

3. **Gated Notes & Resources Library (`/resources`)**:
   - Visitors can browse titles, descriptions, and file sizes freely.
   - **Download Gate**: Clicking "Download PDF" checks authentication. If unauthenticated, displays an alert modal prompting: *"Create a free account to download this resource"*, redirecting to login/signup.
   - **Download Tracking**: Authenticated downloads immediately increment the user's personal download count and the resource's download counter.
   - Pre-seeded with realistic, beautifully styled PDF study guides.

4. **Authentication System (Python Flask + Werkzeug Security)**:
   - User signup and login with Name, Email, Password.
   - **Security**: Passwords cryptographically hashed with salted **Werkzeug security hashes** before storage — never stored or displayed in plaintext, including to administrators.
   - PyJWT-based session tokens with 7-day expiration.
   - "Forgot Password" flow with secure expiring reset tokens (`/forgot-password` and `/reset-password?token=...`).

5. **Secured Admin Interface (`/admin`)**:
   - Protected route requiring admin login (`/admin/login`).
   - Platform metrics: Total Registered Users, Active Accounts, Total Notes Downloaded, Published PDFs.
   - **User Management**:
     - Complete table of registered users: Name, Email, Account Created Date, Last Login Timestamp, Number of Notes Downloaded, and Account Status (Active/Suspended toggle).
     - Live search filter by user name or email.
     - Strict zero-exposure policy: user passwords or hashes are completely excluded from the admin API and view.
   - **Resource Management**:
     - Upload new PDF study notes: Title, Topic Tag dropdown, Description, Author, and PDF file picker (via native Flask multipart/form-data).
     - Real-time download count tracking per resource.
     - Delete published resources.

---

## 🔑 Default Credentials

### Administrator Account
- **Email**: `admin@digitaldefender.io`
- **Password**: `AdminPassword2026!`
- **Role**: `admin`
- **Access**: Full access to `/admin` dashboard and all study downloads.

### Sample User Account
- **Email**: `alex@example.com`
- **Password**: `UserPassword123!`
- **Role**: `user`
- **Access**: Standard user account with pre-seeded downloads.

*(Both login screens also include 1-click test credentials autofill buttons for convenience)*

---

## 🚀 How to Run Locally

### Option 1: Start All via NPM
From the `DigitalDefender` directory:
```bash
# Starts the Python Flask backend (and serves the client)
npm start
```
Or to run the Vite dev server with hot-reload in another terminal:
```bash
npm run client
```

### Option 2: Run via Python Directly
**Terminal 1 (Flask Backend):**
```bash
python server_py/app.py
# Running on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
npm run client
# Running on http://localhost:5173 (proxies /api to 5000)
```

Navigate to:
👉 **`http://localhost:5173`** (Vite Dev Server) or **`http://localhost:5000`** (Flask Production Server)

---

## 🧪 Run Automated Tests

To run the Flask unit test suite:
```bash
python server_py/test_flask_api.py
```
Or run the full-stack end-to-end test suite:
```bash
node server/verify-fullstack.js
```

---

## 📁 Project Architecture

```
DigitalDefender/
├── client/                     # Frontend Single Page App (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx      # Header with navigation & Instagram link
│   │   │   ├── Footer.jsx      # Footer with brand & Instagram link
│   │   │   └── InstagramIcon.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx # JWT state & login/signup methods
│   │   ├── pages/
│   │   │   ├── HomePage.jsx    # Dark navy/teal hero, 6 categories, article grid
│   │   │   ├── BasicsPage.jsx  # Plain-English cybersecurity explainers & quiz
│   │   │   ├── ResourcesPage.jsx # Gated PDF study notes catalog
│   │   │   ├── LoginPage.jsx   # User login & gated prompt handling
│   │   │   ├── SignupPage.jsx  # User signup with password strength meter
│   │   │   ├── ForgotPasswordPage.jsx # Password reset link generator
│   │   │   ├── ResetPasswordPage.jsx  # Password reset handler
│   │   │   ├── AdminLoginPage.jsx     # Admin authentication gateway
│   │   │   └── AdminDashboard.jsx     # User management & PDF upload portal
│   │   ├── index.css
│   │   └── App.jsx
│   └── vite.config.js
│
├── server_py/                  # Backend API (Python 3.14 + Flask + SQLite3)
│   ├── data/
│   │   └── digitaldefender.db  # SQLite database file
│   ├── uploads/
│   │   └── resources/          # Stored PDF study guides
│   ├── app.py                  # Main Flask application & routes
│   ├── db.py                   # SQLite database models & query helper functions
│   ├── auth_utils.py           # JWT token encoding/decoding & auth decorators
│   ├── seed.py                 # Seeder script for initial users & sample guides
│   └── test_flask_api.py       # Python unit test suite
│
├── package.json
└── README.md
```
