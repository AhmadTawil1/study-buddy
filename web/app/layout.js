// app/layout.js
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
      <body className="bg-white min-h-screen text-gray-900">
        <AuthProvider>
          <UserProvider>
            <RequestProvider>
              <QuestionProvider>
                <NotificationProvider>
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1 w-full px-0 md:px-0 lg:px-0 py-0 bg-white mt-12">
                      {children}
                    </main>
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


