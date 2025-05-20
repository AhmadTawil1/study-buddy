// app/layout.js
import './globals.css'
import Navbar from '../src/components/layout/Navbar'
import Footer from '../src/components/layout/Footer'
import { AuthProvider } from '@/src/context/authContext'

export const metadata = {
  title: 'StudyBuddy',
  description: 'Peer-to-peer academic help platform',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-white via-blue-50 to-indigo-100 min-h-screen text-gray-900">
        {/* <AuthProvider> */}
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 px-4 md:px-8 lg:px-12 py-8 bg-white">
              {children}
            </main>
            <Footer />
          </div>
        {/* </AuthProvider> */}
      </body>
    </html>
  )
}
