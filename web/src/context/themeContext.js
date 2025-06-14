'use client'

/**
 * ThemeContext.js
 * 
 * This module provides theme management functionality for the StudyBuddy application.
 * It implements a theme context that handles:
 * - Light/dark mode switching
 * - Theme persistence in localStorage
 * - System preference detection
 * - Color scheme management
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * Color scheme definitions for light and dark modes.
 * Each mode contains a set of colors for different UI elements:
 * - page: Main background color
 * - card: Background color for card components
 * - button: Primary button color
 * - buttonSecondary: Secondary button background
 * - buttonSecondaryText: Secondary button text color
 * - text: Primary text color
 * - inputBg: Input field background
 * - inputBorder: Input field border
 * - inputText: Input field text
 * - inputPlaceholder: Input placeholder text
 */
const COLORS = {
  light: {
    page: '#f4f6fb',
    card: '#f9fafb',
    button: '#3b82f6',
    buttonSecondary: '#e0e7ef',
    buttonSecondaryText: '#23272f',
    text: '#23272f',
    inputBg: '#f3f4f6',
    inputBorder: '#cbd5e1',
    inputText: '#23272f',
    inputPlaceholder: '#64748b',
  },
  dark: {
    page: '#181a20',
    card: '#23272f',
    button: '#3b82f6',
    buttonSecondary: '#23272f',
    buttonSecondaryText: '#f3f4f6',
    text: '#e5e7eb',
    inputBg: '#23272f',
    inputBorder: '#334155',
    inputText: '#e5e7eb',
    inputPlaceholder: '#94a3b8',
  },
};

// Key used for storing theme preference in localStorage
const THEME_STORAGE_KEY = 'studybuddy-theme-mode';

// Create the theme context
const ThemeContext = createContext();

/**
 * ThemeProvider Component
 * 
 * Provides theme context to the application and manages theme state.
 * Handles theme persistence and system preference detection.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to be wrapped with theme context
 */
export function ThemeProvider({ children }) {
  /**
   * Determines the initial theme mode by checking:
   * 1. localStorage for saved preference
   * 2. System color scheme preference
   * 3. Defaults to 'light' if neither is available
   */
  const getInitialMode = () => {
    // Check localStorage first
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedMode === 'light' || savedMode === 'dark') {
        return savedMode;
      }
    }
    // Fall back to system preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Initialize theme state with the determined mode
  const [mode, setMode] = useState(getInitialMode);

  // Update document class when theme changes
  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }, [mode]);

  /**
   * Toggles between light and dark mode
   * Updates both state and localStorage
   */
  const toggleMode = () => {
    setMode((prev) => {
      const newMode = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_STORAGE_KEY, newMode);
      return newMode;
    });
  };

  // Context value containing current mode, colors, and toggle function
  const value = {
    mode,
    colors: COLORS[mode],
    toggleMode,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Custom hook to access theme context
 * @returns {Object} Theme context containing:
 *   - mode: Current theme mode ('light' or 'dark')
 *   - colors: Color scheme for current mode
 *   - toggleMode: Function to switch between modes
 */
export function useTheme() {
  return useContext(ThemeContext);
} 

