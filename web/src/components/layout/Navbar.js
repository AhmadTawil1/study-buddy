// src/components/layout/Navbar.js
//
// This is the global navigation bar for the StudyBuddy app.
// It appears at the top of every page (via app/layout.js).
//
// Features:
// - Brand/logo link
// - Navigation links (Home, Ask, Requests)
// - User profile menu (with avatar, profile link, logout)
// - Responsive mobile menu
//
// Uses AuthProvider context to show user info and handle login/logout.

"use client"
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi'
import { useAuth } from '@/src/context/authContext'
import ReactDOM from 'react-dom'
import NotificationDropdown from './NotificationDropdown'

export default function Navbar() {
  // State for mobile and profile menus
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const { user, loading, logout } = useAuth()
  const profileMenuRef = useRef(null)
  const dropdownRef = useRef(null)
  const profileButtonRef = useRef(null)

  // Log auth state changes (for debugging)
  useEffect(() => {
    console.log('Navbar Auth State Changed:', { user, loading })
  }, [user, loading])

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  return (
    <nav className="backdrop-blur bg-white/80 shadow-lg rounded-b-2xl">
      {/* Main navigation bar content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand and desktop nav links */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center group">
              <span className="ml-2 text-2xl font-extrabold text-blue-700 group-hover:text-blue-500 transition-colors">StudyBuddy</span>
            </Link>
            <div className="hidden md:ml-8 md:flex md:space-x-6">
              <Link href="/" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-base font-medium transition-colors">
                Home
              </Link>
              <Link href="/ask" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-base font-medium transition-colors">
                Ask
              </Link>
              <Link href="/requests" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-base font-medium transition-colors">
                Requests
              </Link>
            </div>
          </div>

          {/* User profile menu (desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
              <div>Loading...</div>
            ) : user ? (
              <>
                <NotificationDropdown />
                <div className="ml-3 relative" ref={profileMenuRef}>
                  <button
                    type="button"
                    ref={profileButtonRef}
                    className="flex items-center justify-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 bg-white w-11 h-11 shadow-md hover:shadow-lg transition-all ring-2 ring-blue-100"
                    id="user-menu-button"
                    aria-expanded="false"
                    aria-haspopup="true"
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  >
                    <span className="sr-only">Open user menu</span>
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt={user.displayName || "User avatar"}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-200 to-blue-400 flex items-center justify-center text-blue-700 font-bold text-xl ring-1 ring-blue-300">
                        <FiUser className="h-7 w-7" />
                      </div>
                    )}
                  </button>

                  {/* Profile dropdown menu (portal) */}
                  {isProfileMenuOpen && typeof window !== 'undefined' && ReactDOM.createPortal(
                    <div
                      ref={dropdownRef}
                      className="origin-top-right absolute right-0 mt-3 w-56 rounded-2xl shadow-2xl py-3 bg-white/80 backdrop-blur-lg focus:outline-none z-50 animate-fade-in"
                      style={{ top: '70px', right: '16px', left: 'auto', position: 'fixed', transform: 'translateX(-30%)' }}
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu-button"
                      tabIndex="-1"
                    >
                      <Link
                        href="/profile"
                        className="block px-6 py-3 text-base text-gray-700 hover:bg-blue-100/60 hover:text-blue-700 rounded-xl transition-colors"
                        role="menuitem"
                        tabIndex="-1"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Your Profile
                      </Link>
                      <div className="h-px bg-gray-100 my-1" />
                      <button
                        onClick={() => { logout(); setIsProfileMenuOpen(false); }}
                        className="block w-full text-left px-6 py-3 text-base text-gray-700 hover:bg-blue-100/60 hover:text-blue-700 rounded-xl transition-colors"
                        role="menuitem"
                        tabIndex="-1"
                      >
                        Logout
                      </button>
                    </div>,
                    document.body
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-base font-medium transition-colors">
                  Sign In
                </Link>
                <Link href="/signup" className="bg-blue-600 text-white px-5 py-2 rounded-lg text-base font-semibold hover:bg-blue-700 transition">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu with smooth transition */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`} id="mobile-menu">
        <div className="pt-2 pb-3 space-y-1 bg-white/90 rounded-b-2xl shadow-xl">
          <Link href="/" className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-blue-600 transition-colors">
            Home
          </Link>
          <Link href="/ask" className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-blue-600 transition-colors">
            Ask
          </Link>
          <Link href="/requests" className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-blue-600 transition-colors">
            Requests
          </Link>
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200 bg-white/90 rounded-b-2xl shadow-xl">
          {loading ? (
            <div className="block px-3 py-2 text-base font-medium text-gray-900">Loading...</div>
          ) : user ? (
            <div className="space-y-1">
              <div className="px-3 py-2">
                <NotificationDropdown />
              </div>
              <Link href="/profile" className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-blue-600 transition-colors">
                Your Profile
              </Link>
              <button
                onClick={logout}
                className="block w-full text-left px-3 py-2 text-base font-medium text-gray-900 hover:text-blue-600 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              <Link href="/login" className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-blue-600 transition-colors">
                Sign In
              </Link>
              <Link href="/signup" className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-blue-600 transition-colors">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
