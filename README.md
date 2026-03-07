# Cyber Guardian Hub 🛡️

**Cyber Guardian Hub** is an advanced, all-in-one cybersecurity dashboard designed to provide enterprise-grade protection, threat intelligence, and secure asset management for modern digital operators. 

Built with a stunning, high-performance interface, the platform consolidates critical security tools into one seamless experience.

---

## 🎯 Project Overview & Mission

Our mission is to democratize cybersecurity by providing intuitive, powerful tools that visualize threats, secure communications, and analyze digital assets before they can cause harm. Whether you are an individual wanting to secure your personal data or a security professional monitoring global threats, Cyber Hub is your command center.

---

## ✨ Key Features & Capabilities

*(Perfect for presentation slides!)*

### 1. Global Threat Visualization (CyberGlobe & ThreatMap)
- **Live Telemetry:** Interactive 3D visualization of global cyber threats in real-time.
- **Attack Vectors:** Breakdowns of attack origins, targeting patterns, and system integrity telemetry.
- **Situational Awareness:** Gives operators a bird's-eye view of the current global threat landscape.

### 2. URL Radar & IP Intelligence
- **Deep Scanning:** Instantly inspect questionable URLs and IP addresses for malicious activity.
- **Reputation Scoring:** Analyzes domains against known threat databases to prevent phishing and malware infections.

### 3. Data Breach Pulse
- **Exposure Detection:** Actively scans for compromised email addresses and credentials across known data breaches.
- **Proactive Alerts:** Keeps users informed if their sensitive information has been leaked on the dark web or public forums.

### 4. Deep Drop (Secure Communications)
- **Military-Grade Encryption:** Utilizes AES-GCM End-to-End (E2E) encryption for sharing highly sensitive data.
- **Stealth Capabilities:** Includes visual "burn" animations and automatic data destruction to ensure zero traces are left behind.
- **Anonymous Drops:** Securely transfer payloads without compromising operator identity.

### 5. Cyber Vault
- **Encrypted Password Management:** A highly secure, local vault for storing credentials and sensitive access codes.
- **Vault Health Analysis:** Automatically calculates password entropy, flags weak or reused passwords, and provides an overall "Vault Integrity" score.

### 6. Visual Guard (AI Image Analysis)
- **Gemini-Powered AI:** Integrates advanced AI vision models to detect sophisticated phishing attempts hidden within images.
- **QR Code Verification:** Scans and verifies QR codes before you scan them with your phone to prevent malicious routing.
- **Social Engineering Detection:** Analyzes screenshots and images for common manipulative tactics.

### 7. PDF Armor
- **Document Sanctification:** Scans PDF files for malicious macros, embedded scripts, and hidden payloads before they are opened.

---

## 🛠️ Technology Stack

Cyber Guardian Hub is built on a modern, high-performance tech stack:

- **Frontend Framework:** React with Vite & TypeScript
- **Styling:** Tailwind CSS & Framer Motion (for buttery-smooth, dynamic animations)
- **UI Components:** shadcn-ui (customized for a dark, cyber-aesthetic)
- **Backend/Database:** Supabase (PostgreSQL, Row Level Security, Storage)
- **Authentication:** Supabase Auth (Google, GitHub, and Email/Password)
- **AI Integration:** Google Gemini 2.5 API

---

## 🚀 Getting Started

### Prerequisites
- Node.js & npm installed
- A Supabase Project (with `avatars` storage bucket configured)
- Gemini API Key

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/sparshagarwal0411/cyber-hub.git
   cd cyber-guardian-hub
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory and add your keys:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the Development Server:**
   ```sh
   npm run dev
   ```

---

## 🔒 Security Posture

- **Row Level Security (RLS):** Strict PostgreSQL policies ensure users can only access their own data.
- **State-of-the-Art Encryption:** Client-side encryption ensures that intermediate servers cannot read sensitive payloads like Deep Drops.
- **Zero-Trust Architecture:** Every action and API call is verified against authenticated sessions.

---
*Created by Sparsh Agarwal*
