# 📚 StudyBuddy – Peer-to-Peer Academic Help Platform

**StudyBuddy** is a full-stack academic support platform that empowers students to ask for and offer academic help in a collaborative, AI-assisted, and reputation-driven environment.

Built with **Next.js 14**, **Tailwind CSS**, **Firebase**, and **OpenAI**, the app features a modular and scalable architecture, real-time data flow, and smart AI-powered assistance to improve the quality of academic support.

---

## 🚀 Live Demo

[🔗 Hosted on Vercel](https://your-vercel-deployment-url.com)

---

## 🛠️ Tech Stack

| Category         | Technology                      |
|------------------|----------------------------------|
| Frontend         | Next.js 14 (App Router)         |
| Styling          | Tailwind CSS                    |
| Authentication   | Firebase Auth (Google, Email)   |
| Database         | Firebase Firestore (NoSQL)      |
| Hosting          | Vercel / Firebase Hosting       |
| State Management | React Context API               |
| AI Integration   | OpenAI API (GPT-3.5)            |
| Version Control  | Git + GitHub                    |

---

## ✨ Core Features

### For Help Seekers
- Post questions anonymously or with profile
- Attach files (images, code, documents)
- AI-powered clarity enhancement & summarization
- Choose public/private visibility
- Rate answers and bookmark helpful responses

### For Helpers
- Filter and browse open requests by topic or urgency
- Submit answers in text (voice/video planned)
- Receive feedback and AI rephrase suggestions
- Earn badges, reputation, and profile highlights

### General Features
- Firebase-secured Auth & Firestore integration
- AI modules for rephrasing, summarizing, suggesting
- Responsive design with dark/light themes
- Modular codebase for scalable team development

---

## 🗂 Project Structure

```
studybuddy/
├── app/                    # App Router pages & layout
├── src/
│   ├── components/         # UI components (Navbar, Footer)
│   ├── context/            # Auth, theme, question context providers
│   ├── features/           # Feature modules (Ask, Requests, Profile)
│   ├── firebase/           # Firebase config & Firestore helpers
│   ├── services/           # AI logic, request & question APIs
│   ├── utils/              # Utilities (e.g., formatDate)
├── public/                 # Static files (icons, logos)
├── styles/                 # Tailwind config & globals.css
├── .env.local.example      # Environment variable template
├── README.md               # Project documentation
```

---

## ⚙️ Getting Started

1. **Clone the repo**
   ```bash
   git clone https://github.com/your-username/studybuddy.git
   cd studybuddy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   Create a `.env.local` file based on `.env.local.example` and add your Firebase and OpenAI credentials.

4. **Run the dev server**
   ```bash
   npm run dev
   ```

5. **Deploy**
   - Push to GitHub and connect to [Vercel](https://vercel.com/)
   - Add environment variables in Vercel settings

---

## 🧠 AI Integration

| Feature              | API Route              | Description                              |
|----------------------|------------------------|------------------------------------------|
| Rephrase Questions   | `/api/rephrase`        | Rewrites unclear student questions       |
| AI Answer Generator  | `/api/ai-answer`       | Returns a model-generated explanation    |
| Resource Suggestions | `/api/ai-suggestions`  | Suggests quality links for a question    |

---

## 👥 Contributors

- Ahmad Tawil – System Engineer, Layout, Requests, Ask
- Cyrine – Firebase Auth, Context, Security
- Adam – Ask Page, AI Service Lead
- Ibrahim – Requests Feed, Integration
- Omar & Marwa – Profile Page, Stats, Badges

---

## 📄 License

This project is for educational purposes and may be extended with a proper open-source license in the future.

---

## 📬 Contact

For inquiries, feedback, or contributions, reach out via GitHub or email.

> Made with ❤️ for learners, by learners.