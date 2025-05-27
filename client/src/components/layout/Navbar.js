// src/components/layout/Navbar.js
"use client"
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi'
import { useAuth } from '@/src/context/authContext'

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const { user, loading, logout } = useAuth()
  const profileMenuRef = useRef(null)

  useEffect(() => {
    console.log('Navbar Auth State Changed:', { user, loading })
  }, [user, loading])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Image
                src="/logo.svg"
                alt="StudyBuddy"
                width={40}
                height={40}
                className="h-8 w-auto"
              />
              <span className="ml-2 text-xl font-bold text-blue-800">StudyBuddy</span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link href="/" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                Home
              </Link>
              <Link href="/ask" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                Ask
              </Link>
              <Link href="/requests" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                Requests
              </Link>
              {user && (
                <Link href="/profile" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                  Profile
                </Link>
              )}
              <Link href="/about" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                About
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center">
            {loading ? (
              <div>Loading...</div>
            ) : user ? (
              <div className="ml-3 relative" ref={profileMenuRef}>
                <button
                  type="button"
                  className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  id="user-menu-button"
                  aria-expanded="false"
                  aria-haspopup="true"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                >
                  <span className="sr-only">Open user menu</span>
                  <Image
                    src={user.photoURL || "/avatar-placeholder.png"}
                    alt={user.displayName || "User avatar"}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full"
                  />
                </button>

                {isProfileMenuOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                    tabIndex="-1"
                  >
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      tabIndex="-1"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Your Profile
                    </Link>
                    <Link
                      href="/my-questions"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      tabIndex="-1"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      My Questions
                    </Link>
                    <button
                      onClick={() => { logout(); setIsProfileMenuOpen(false); }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      tabIndex="-1"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                  Sign In
                </Link>
                <Link href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                  Register
                </Link>
              </div>
            )}
          </div>

          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="pt-2 pb-3 space-y-1">
            <Link href="/" className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-blue-600">
              Home
            </Link>
            <Link href="/ask" className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-blue-600">
              Ask
            </Link>
            <Link href="/requests" className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-blue-600">
              Requests
            </Link>
            {user && (
              <Link href="/profile" className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-blue-600">
                Profile
              </Link>
            )}
            <Link href="/about" className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-blue-600">
              About
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {loading ? (
              <div className="block px-3 py-2 text-base font-medium text-gray-900">Loading...</div>
            ) : user ? (
              <div className="space-y-1">
                <Link href="/profile" className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-blue-600">
                  Your Profile
                </Link>
                <Link href="/my-questions" className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-blue-600">
                  My Questions
                </Link>
                <button
                  onClick={logout}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-900 hover:text-blue-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <Link href="/login" className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-blue-600">
                  Sign In
                </Link>
                <Link href="/signup" className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-blue-600">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
