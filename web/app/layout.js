/**
 * app/layout.js
 * 
 * This is the root layout component for the StudyBuddy application.
 * It serves as the main wrapper for all pages and provides:
 * - Global CSS styles
 * - Context providers for app-wide state management
 * - Shared UI components (Navbar and Footer)
 * 
 * The layout uses a nested provider structure to ensure all necessary
 * context is available throughout the application.
 */

import './globals.css'
// Layout components
import Navbar from '../src/components/layout/Navbar'
import Footer from '../src/components/layout/Footer'

// Context providers for global state management
import { AuthProvider } from '@/src/context/authContext'
import { UserProvider } from '@/src/context/userContext'
import { RequestProvider } from '@/src/context/requestContext'
import { QuestionProvider } from '@/src/context/questionContext'
import { NotificationProvider } from '@/src/context/notificationContext'
import { ThemeProvider } from '@/src/context/themeContext'

// Metadata for SEO and browser tab information
export const metadata = {
  title: 'StudyBuddy',
  description: 'Peer-to-peer academic help platform',
}

/**
 * RootLayout Component
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to be rendered
 * @returns {JSX.Element} The root layout structure
 * 
 * The component implements a nested provider structure:
 * 1. ThemeProvider - Manages application theme
 * 2. AuthProvider - Handles authentication state
 * 3. UserProvider - Manages user data
 * 4. RequestProvider - Handles study requests
 * 5. QuestionProvider - Manages questions
 * 6. NotificationProvider - Handles notifications
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthProvider>
            <UserProvider>
              <RequestProvider>
                <QuestionProvider>
                  <NotificationProvider>
                    {/* Main container with flex layout and background */}
                    <div className="flex flex-col min-h-screen overflow-visible">
                      {/* Navigation bar fixed at the top */}
                      <Navbar />
                      {/* Main content area with responsive padding */}
                      <main className="flex-1 w-full px-0 md:px-0 lg:px-0 py-0 overflow-visible">
                        {children}
                      </main>
                      {/* Footer at the bottom */}
                      <Footer />
                    </div>
                  </NotificationProvider>
                </QuestionProvider>
              </RequestProvider>
            </UserProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


