# 📄 AI-Powered ATS Resume Builder (Google Gemini Integrated)

[!\[React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react\&logoColor=black)](https://reactjs.org/)
[!\[TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript\&logoColor=white)](https://www.typescriptlang.org/)
[!\[Google Gemini AI](https://img.shields.io/badge/Google\_Gemini\_AI-3.5\_Flash-4285F4?logo=google\&logoColor=white)](https://aistudio.google.com/)
[!\[Tailwind CSS](https://img.shields.io/badge/Tailwind\_CSS-3.4-38B2AC?logo=tailwind-css\&logoColor=white)](https://tailwindcss.com/)
[!\[Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite\&logoColor=white)](https://vitejs.dev/)
[!\[Firebase](https://img.shields.io/badge/Firebase-12.2-FFCA28?logo=firebase\&logoColor=black)](https://firebase.google.com/)
[!\[License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An intuitive, ATS-friendly, and interactive resume builder supercharged with **Google Gemini AI**. Generates high-impact bullet points with action verbs \& metrics, writes professional profile summaries, suggests in-demand technical \& soft skills, parses existing documents, and exports print-ready PDFs.

\---

## ✨ AI Features (Google Gemini)

### 🤖 **AI Resume Assistant**

* **ATS Bullet Point Generator**: Uses `gemini-2.5-flash` to transform basic job duties into impact-driven bullet points with metrics.
* **Professional Summary Writer**: Tailors concise executive profile summaries based on targeted role and skills.
* **AI Skill Recommendation Engine**: Recommends top technical and soft skills for any job role.
* **In-App API Key Manager**: Support for free Google AI Studio API key via `.env` (`VITE\_GEMINI\_API\_KEY`) or interactive UI settings modal.

\---

## 🛠️ Tech Stack

|Category|Technology|
|-|-|
|**AI Integration**|`@google/generative-ai` (`gemini-3.5-flash`)|
|**Frontend Core**|React 18, TypeScript, Vite|
|**Styling \& UI**|Tailwind CSS, Shadcn UI / Radix UI, Lucide Icons|
|**Animations**|Framer Motion, Tailwind Animate|
|**State \& Data Fetching**|TanStack React Query, React Hook Form, Zod|
|**Authentication**|Firebase Auth|
|**Document Processing**|`jspdf`, `html2canvas`, `docx`, `pdfjs-dist`, `mammoth`|
|**Cross-Platform**|Capacitor (iOS \& Android)|

\---

## 🚀 Quick Start

```bash
# 1. Navigate to project directory
cd AI-Powered\_ATS-Resume-Builder

# 2. Install dependencies
npm install

# 3. Create .env file (Optional - you can also input key inside the app UI)
echo "VITE\_GEMINI\_API\_KEY=your\_free\_gemini\_key\_here" > .env

# 4. Start development server
npm run dev
```

\---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

