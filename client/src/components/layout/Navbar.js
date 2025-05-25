// src/components/layout/Navbar.js
'use client'
import Link from 'next/link'
import { useAuth } from '@/src/context/authContext'
import { signOut } from 'firebase/auth'
import { auth } from '@/src/firebase/firebase'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const { user } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/')
  }

  return (
    <nav className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur shadow-md z-50 transition-all duration-300">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <Link href="/">
          <span className="font-bold text-xl text-blue-600">StudyBuddy</span>
        </Link>
        <div className="flex space-x-6 items-center">
          {user ? (
            <>
              <Link href="/ask" className="text-gray-700 hover:text-blue-600 font-medium transition">Ask</Link>
              <Link href="/requests" className="text-gray-700 hover:text-blue-600 font-medium transition">Requests</Link>
              <Link href="/profile" className="text-gray-700 hover:text-blue-600 font-medium transition">Profile</Link>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600 font-medium transition border border-gray-300 rounded px-3 py-1.5 ml-2"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 hover:text-blue-600 transition">
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
