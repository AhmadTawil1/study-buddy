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
// - Dark mode toggle
// - Notification dropdown
//
// Uses AuthProvider context to show user info and handle login/logout.
// Uses ThemeProvider context for dark/light mode and styling.

"use client"
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FiUser, FiMenu, FiX } from 'react-icons/fi'
import { useAuth } from '@/src/context/authContext'
import ReactDOM from 'react-dom'
import NotificationDropdown from './NotificationDropdown'
import { useTheme } from '@/src/context/themeContext'
import { FaSun, FaMoon } from 'react-icons/fa'

export default function Navbar() {
  // State management for UI interactions
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false) // Controls mobile menu visibility
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false) // Controls profile dropdown visibility
  
  // Get authentication state and functions from context
  const { user, loading, logout } = useAuth()
  
  // Refs for handling click-outside behavior
  const profileMenuRef = useRef(null) // Ref for profile menu container
  const dropdownRef = useRef(null) // Ref for dropdown content
  const profileButtonRef = useRef(null) // Ref for profile button
  
  // Get theme state and functions from context
  const { mode, toggleMode, colors } = useTheme();

  // Debug logging for authentication state changes
  useEffect(() => {
    console.log('Navbar Auth State Changed:', { user, loading })
  }, [user, loading])

  // Handle click-outside behavior for profile menu
  // Closes the profile dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside all profile-related elements
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
    
    // Only add event listener when menu is open
    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    
    // Cleanup event listener on unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  // Prevent background scrolling when mobile menu is open
  // Improves UX by preventing content behind the menu from scrolling
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    // Cleanup: restore scrolling when component unmounts
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur shadow-lg transition-shadow duration-300 bg-opacity-95"
      style={{ background: colors.card, color: colors.text }}
    >
      {/* Main navigation bar content container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left side: Brand logo and desktop navigation links */}
          <div className="flex items-center">
            {/* Brand/Logo link */}
            <Link href="/" className="flex-shrink-0 flex items-center group">
              <span className="ml-2 text-2xl font-extrabold" style={{ color: colors.button }}>StudyBuddy</span>
            </Link>
            
            {/* Desktop navigation links - hidden on mobile */}
            <div className="hidden md:ml-8 md:flex md:space-x-6">
              <Link href="/" className="px-3 py-2 text-base font-medium transition-colors" style={{ color: colors.text }}>
                Home
              </Link>
              <Link href="/ask" className="px-3 py-2 text-base font-medium transition-colors" style={{ color: colors.text }}>
                Ask
              </Link>
              <Link href="/requests" className="px-3 py-2 text-base font-medium transition-colors" style={{ color: colors.text }}>
                Requests
              </Link>
            </div>
          </div>

          {/* Right side: User profile menu, theme toggle, and mobile menu button */}
          <div className="flex items-center space-x-4">
            {/* Show loading state while auth is being determined */}
            {loading ? (
              <div>Loading...</div>
            ) : user ? (
              // User is logged in - show profile menu and notifications
              <>
                {/* Notification dropdown component */}
                <NotificationDropdown />
                
                {/* Profile menu container */}
                <div className="ml-3 relative" ref={profileMenuRef}>
                  {/* Profile button with user avatar */}
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
                    
                    {/* Display user's profile photo if available */}
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt={user.displayName || "User avatar"}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      // Fallback avatar with user icon
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-200 to-blue-400 flex items-center justify-center text-blue-700 font-bold text-xl ring-1 ring-blue-300">
                        <FiUser className="h-7 w-7" />
                      </div>
                    )}
                  </button>
                  
                  {/* Profile dropdown menu - rendered as portal for proper z-index */}
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
                      {/* Profile link */}
                      <Link
                        href="/profile"
                        className="block px-6 py-3 text-base text-gray-700 hover:bg-blue-100/60 hover:text-blue-700 rounded-xl transition-colors"
                        role="menuitem"
                        tabIndex="-1"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Your Profile
                      </Link>
                      
                      {/* Divider */}
                      <div className="h-px bg-gray-100 my-1" />
                      
                      {/* Logout button */}
                      <button
                        onClick={() => { logout(); setIsProfileMenuOpen(false); }}
                        className="block w-full text-left px-6 py-3 text-base text-gray-700 hover:bg-blue-100/60 hover:text-blue-700 rounded-xl transition-colors"
                        role="menuitem"
                        tabIndex="-1"
                      >
                        Logout
                      </button>
                    </div>,
                    document.body // Render dropdown as portal to body for proper layering
                  )}
                </div>
              </>
            ) : (
              // User is not logged in - show sign in/register buttons
              <>
                <Link href="/login" className="px-3 py-2 text-base font-medium transition-colors" style={{ color: colors.text }}>
                  Sign In
                </Link>
                <Link href="/signup" className="bg-blue-600 text-white px-5 py-2 rounded-lg text-base font-semibold hover:bg-blue-700 transition">
                  Register
                </Link>
              </>
            )}
            
            {/* Dark mode toggle switch */}
            <button
              onClick={toggleMode}
              className="ml-8 flex items-center justify-center w-16 h-9 rounded-full border-2 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-opacity-80 shadow-md"
              style={{ background: mode === 'dark' ? colors.inputBg : '#f3f4f6', borderColor: colors.inputBorder }}
              aria-label="Toggle dark mode"
              title="Toggle dark mode"
            >
              <span className="relative flex items-center w-12 h-6">
                {/* Sun icon (light mode indicator) */}
                <FaSun className={`absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${mode === 'dark' ? 'text-gray-400' : 'text-yellow-400'}`} />
                
                {/* Toggle switch handle */}
                <span
                  className={`absolute left-0 top-0 w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 border-2 flex items-center justify-center ${mode === 'dark' ? 'translate-x-6 bg-gray-700 border-blue-400' : 'translate-x-0 bg-yellow-400 border-yellow-300'}`}
                >
                  {/* Icon inside toggle handle */}
                  {mode === 'dark' ? <FaMoon className="w-4 h-4 text-blue-300" /> : <FaSun className="w-4 h-4 text-yellow-500" />}
                </span>
                
                {/* Moon icon (dark mode indicator) */}
                <FaMoon className={`absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${mode === 'dark' ? 'text-blue-400' : 'text-gray-400'}`} />
              </span>
            </button>
          </div>

          {/* Mobile menu button - only visible on mobile devices */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset transition"
              style={{ color: colors.text, background: colors.inputBg }}
            >
              <span className="sr-only">Open main menu</span>
              {/* Toggle between hamburger and X icon */}
              {isMobileMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay and slide-in menu */}
      {isMobileMenuOpen && typeof window !== 'undefined' && ReactDOM.createPortal(
        <>
          {/* Backdrop overlay - closes menu when clicked */}
          <div
            className="fixed inset-0 top-0 left-0 z-[9999] bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu overlay"
          />
          
          {/* Slide-in mobile menu */}
          <div
            className="fixed top-0 right-0 h-full w-80 max-w-full z-[9999] bg-white dark:bg-gray-900 shadow-2xl flex flex-col transition-transform duration-300"
            style={{
              transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
              background: mode === 'dark' ? colors.card : '#fff',
              color: colors.text,
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)'
            }}
            id="mobile-menu"
          >
            {/* Close button for mobile menu */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 text-2xl p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              style={{ color: colors.text, background: 'transparent' }}
              aria-label="Close menu"
            >
              <FiX />
            </button>
            
            {/* Mobile menu content */}
            <div className="pt-16 pb-3 space-y-1 flex-1 flex flex-col justify-start" style={{ background: 'transparent' }}>
              {/* Navigation links */}
              <Link href="/" className="block px-6 py-3 text-lg font-medium transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800" style={{ color: colors.text }} onClick={() => setIsMobileMenuOpen(false)}>
                Home
              </Link>
              <Link href="/ask" className="block px-6 py-3 text-lg font-medium transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800" style={{ color: colors.text }} onClick={() => setIsMobileMenuOpen(false)}>
                Ask
              </Link>
              <Link href="/requests" className="block px-6 py-3 text-lg font-medium transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800" style={{ color: colors.text }} onClick={() => setIsMobileMenuOpen(false)}>
                Requests
              </Link>
              
              {/* User section divider */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                {/* Show loading state while auth is being determined */}
                {loading ? (
                  <div className="block px-6 py-3 text-lg font-medium" style={{ color: colors.text }}>Loading...</div>
                ) : user ? (
                  // User is logged in - show profile options
                  <>
                    {/* Notification dropdown in mobile menu */}
                    <div className="px-6 py-3">
                      <NotificationDropdown />
                    </div>
                    
                    {/* Profile link */}
                    <Link href="/profile" className="block px-6 py-3 text-lg font-medium transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800" style={{ color: colors.text }} onClick={() => setIsMobileMenuOpen(false)}>
                      Your Profile
                    </Link>
                    
                    {/* Logout button */}
                    <button
                      onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                      className="block w-full text-left px-6 py-3 text-lg font-medium transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800"
                      style={{ color: colors.text }}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  // User is not logged in - show auth options
                  <>
                    <Link href="/login" className="block px-6 py-3 text-lg font-medium transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800" style={{ color: colors.text }} onClick={() => setIsMobileMenuOpen(false)}>
                      Sign In
                    </Link>
                    <Link href="/signup" className="block px-6 py-3 text-lg font-medium transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800" style={{ color: colors.text }} onClick={() => setIsMobileMenuOpen(false)}>
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </>,
        document.body // Render mobile menu as portal to body for proper layering
      )}
    </nav>
  )
}
