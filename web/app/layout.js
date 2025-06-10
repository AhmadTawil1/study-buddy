// app/layout.js
//
// This is the global layout for the StudyBuddy app. It wraps all pages and provides:
// - Global CSS
// - Global context providers (auth, user, requests, questions, notifications)
// - Shared UI (Navbar and Footer)
//
// Navbar and Footer are included here so they appear on every page, and should NOT be added to individual pages.
// The {children} prop renders the unique content for each page.
//
// Providers ensure that authentication, user data, requests, questions, and notifications are available throughout the app.

import './globals.css'
import Navbar from '../src/components/layout/Navbar'
import Footer from '../src/components/layout/Footer'
import { AuthProvider } from '@/src/context/authContext'
import { UserProvider } from '@/src/context/userContext'
import { RequestProvider } from '@/src/context/requestContext'
import { QuestionProvider } from '@/src/context/questionContext'
import { NotificationProvider } from '@/src/context/notificationContext'

export const metadata = {
  title: 'StudyBuddy',
  description: 'Peer-to-peer academic help platform',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 min-h-screen text-gray-900 overflow-visible">
        {/*
          Context Providers:
          - AuthProvider: Handles authentication state
          - UserProvider: Provides user profile data
          - RequestProvider: Manages help requests
          - QuestionProvider: Manages questions
          - NotificationProvider: Handles notifications
        */}
        <AuthProvider>
          <UserProvider>
            <RequestProvider>
              <QuestionProvider>
                <NotificationProvider>
                  <div className="flex flex-col min-h-screen bg-slate-50 overflow-visible">
                    {/* Shared Navbar for all pages */}
                    <Navbar />
                    {/* Main content for each page */}
                    <main className="flex-1 w-full px-0 md:px-0 lg:px-0 py-0 bg-slate-50 mt-12 overflow-visible">
                      {children}
                    </main>
                    {/* Shared Footer for all pages */}
                    <Footer />
                  </div>
                </NotificationProvider>
              </QuestionProvider>
            </RequestProvider>
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  )
}


