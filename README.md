# StudyBuddy 📚

<div align="center">

![StudyBuddy Logo](https://via.placeholder.com/150x150.png?text=StudyBuddy)

[![Next.js](https://img.shields.io/badge/Next.js-15.3.2-blue)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-blue)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-11.7.3-orange)](https://firebase.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern web application designed to help students collaborate, share resources, and enhance their learning experience through peer-to-peer academic support.

[Features](#features) • [Tech Stack](#tech-stack) • [Getting Started](#getting-started) • [Documentation](#documentation) • [Contributing](#contributing)

</div>

## 🌟 Features

### 🔐 User Authentication
- Secure login and signup functionality with email/password
- Email verification for account security
- Password reset capabilities
- Social media authentication (Google, GitHub)
- Session management and security
- Protected routes and role-based access control

### 👤 Profile Management
- Customizable user profiles with academic information
- Profile picture upload with image optimization
- Academic information tracking (courses, majors, GPA)
- Study preferences and interests
- Activity history and statistics
- Achievement system and badges

### 📝 Request System
- Create and manage study requests
- Advanced filtering and search functionality
- Real-time updates using Firebase
- Request status tracking (open, in-progress, completed)
- Notification system for request updates
- Location-based study group matching

### ❓ Ask Questions
- Q&A forum for academic discussions
- Rich text editor with markdown support
- File attachment support (images, PDFs, code snippets)
- Upvoting and downvoting system
- Best answer selection and reputation points
- Tag-based question organization

### 📱 Responsive Design
- Mobile-first approach with fluid layouts
- Cross-browser compatibility
- Progressive Web App (PWA) support
- Offline functionality with service workers
- Touch-friendly interface
- Dark/Light mode support

## 🛠 Tech Stack

### Frontend
- **Next.js 15**: React framework with server-side rendering and API routes
- **React 19**: UI library with hooks and concurrent features
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **Context API**: State management solution for global state
- **React Query**: Data fetching and caching
- **Framer Motion**: Smooth animations and transitions

### Backend & Services
- **Firebase Authentication**: User management and security
- **Firestore**: Real-time database with offline support
- **Firebase Storage**: File storage with security rules
- **Cloud Functions**: Serverless backend operations
- **Firebase Hosting**: Production deployment
- **Firebase Analytics**: Usage tracking and insights

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AhmadTawil1/studybuddy.git
   cd study-buddy
   ```

2. **Install dependencies:**
   ```bash
   cd web
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Firebase configuration in `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser and navigate to `http://localhost:3000`**

### Development Commands
```bash
npm run dev        # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
npm run test      # Run tests
```

## 📚 Documentation

### Project Structure
```
frontend/
├── app/                 # Next.js app directory
│   ├── about/          # About page
│   ├── ask/            # Question asking feature
│   ├── login/          # Authentication pages
│   ├── profile/        # User profile pages
│   └── requests/       # Study request pages
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── common/     # Shared components
│   │   └── layout/     # Layout components
│   ├── context/        # React context providers
│   ├── features/       # Feature-specific components
│   ├── firebase/       # Firebase configuration
│   ├── services/       # API and utility services
│   └── utils/          # Helper functions
├── public/             # Static assets
```

### Key Components
- **Authentication**: Secure user management system with social login
- **Profile System**: User profile and preferences management
- **Request Management**: Study group coordination and matching
- **Q&A System**: Academic discussion platform with voting
- **UI Components**: Reusable design elements and layouts
- **Theme System**: Dark/Light mode with persistent preferences

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style and conventions
- Write meaningful commit messages following conventional commits
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR
- Keep PRs focused and manageable in size

### Code Style
- Use ESLint and Prettier for code formatting
- Follow React best practices and hooks guidelines
- Write clean, maintainable, and documented code
- Use TypeScript for type safety
- Follow the component structure guidelines

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape StudyBuddy
- Inspired by the need for better student collaboration tools
- Built with modern web technologies and best practices

