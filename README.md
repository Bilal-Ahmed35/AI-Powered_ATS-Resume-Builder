# 📄 ATS Resume Builder — AI-Powered Resume Creator

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12.2-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An intuitive, ATS-friendly, and interactive resume builder built to create high-scoring resumes for job seekers, students, and professionals. Features real-time editing, intelligent document parsing, tailored career pathing, custom export formats (PDF & Word), and full cross-platform support.

---

## ✨ Features

### 🎯 **Tailored Career Pathing**
- **Student & Professional Workflows**: Customized field suggestions, skills emphasis, and templates tailored for beginners, entry-level, and experienced applicants.
- **ATS Optimization**: Section layout and keywords tuned for passing Applicant Tracking Systems.

### 📁 **Smart Document Parsing & Import**
- **Multi-Format Parsing**: Import existing resumes in `.pdf`, `.docx`, or `.txt` formats using built-in parsing (`pdfjs-dist`, `mammoth`).
- **Template Auto-Detection**: Intelligently auto-fills profile details, experiences, education, and skills.

### 🎨 **Modern Design & User Experience**
- **Glassmorphism & Micro-Interactions**: Modern UI built with **Shadcn UI** & **Radix UI** primitives and customized **Tailwind CSS**.
- **Physics-Based Animations**: Smooth entrance, hover, and spring transitions powered by **Framer Motion**.
- **Responsive & Dark-Mode Ready**: Seamless layout across mobile (320px+) to ultra-wide displays.

### 🔐 **User Authentication & Cloud Persistence**
- **Firebase Authentication**: Email/Password authentication, email verification, password reset, and protected routes.

### 📱 **Mobile & Cross-Platform Ready**
- **Capacitor Integration**: Packaged for Android and iOS native mobile apps alongside web deployment.

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Frontend Core** | React 18, TypeScript, Vite |
| **Styling & UI** | Tailwind CSS, Shadcn UI / Radix UI, Lucide Icons |
| **Animations** | Framer Motion, Tailwind Animate |
| **State & Data Fetching** | TanStack React Query, React Hook Form, Zod |
| **Authentication** | Firebase Auth |
| **Document Processing** | `jspdf`, `html2canvas`, `docx`, `pdfjs-dist`, `mammoth` |
| **Cross-Platform** | Capacitor (iOS & Android) |

---

## 🚀 Quick Start

### **Prerequisites**
- **Node.js**: `v18+`
- **npm** or **bun** / **yarn**

### **Installation & Setup**

```bash
# 1. Clone the repository
git clone https://github.com/Bilal-Ahmed35/ATS-RESUME-BUILDER.git
cd ATS-RESUME-BUILDER

# 2. Install dependencies
npm install

# 3. Start the local development server
npm run dev
```

The application will be available at `http://localhost:8080` (or `http://localhost:5173`).

---

## 📁 Project Structure

```
ATS-RESUME-BUILDER/
├── public/                 # Static assets & icons
├── src/
│   ├── components/         # Reusable UI components & Resume Builder modules
│   │   └── ui/             # Radix / Shadcn UI components
│   ├── contexts/           # React contexts (e.g., Firebase AuthContext)
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Router pages (Index, Login, SignUp, Profile, etc.)
│   ├── lib/                # Firebase setup & utilities
│   └── index.css           # Global Tailwind & CSS custom properties
├── capacitor.config.ts     # Native mobile build configuration
├── tailwind.config.ts      # Tailwind configuration & typography plugins
└── vite.config.ts          # Vite bundle & alias configuration
```

---

## 📱 Mobile Build (Capacitor)

```bash
# Build web assets for native mobile targets
npm run build

# Sync with Capacitor
npx cap sync
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

