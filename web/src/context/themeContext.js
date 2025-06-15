// themeContext.js
// Provides theme (light/dark mode) context and color palette for the StudyBuddy app.
// Exports ThemeProvider (wraps app with theme state) and useTheme (hook for theme/colors).

'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';

// Color palette for both light and dark modes
const COLORS = {
  light: {
    page: '#f4f6fb',            // Main page background
    card: '#f9fafb',            // Card background
    button: '#3b82f6',          // Primary button background
    buttonSecondary: '#e0e7ef', // Secondary button background
    buttonSecondaryText: '#23272f', // Secondary button text
    text: '#23272f',            // Main text color
    inputBg: '#f3f4f6',         // Input background
    inputBorder: '#cbd5e1',     // Input border color
    inputText: '#23272f',       // Input text color
    inputPlaceholder: '#64748b',// Input placeholder color
  },
  dark: {
    page: '#181a20',            // Main page background (dark)
    card: '#23272f',            // Card background (dark)
    button: '#3b82f6',          // Primary button background
    buttonSecondary: '#23272f', // Secondary button background (dark)
    buttonSecondaryText: '#f3f4f6', // Secondary button text (dark)
    text: '#e5e7eb',            // Main text color (dark)
    inputBg: '#23272f',         // Input background (dark)
    inputBorder: '#334155',     // Input border color (dark)
    inputText: '#e5e7eb',       // Input text color (dark)
    inputPlaceholder: '#94a3b8',// Input placeholder color (dark)
  },
};

// Create a React context for theme
const ThemeContext = createContext();

// ThemeProvider: wraps app and provides theme state and colors
export function ThemeProvider({ children }) {
  // Detect system color scheme preference
  const getSystemMode = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // State: current theme mode ('light' or 'dark')
  const [mode, setMode] = useState(getSystemMode());

  // Effect: update HTML class for Tailwind dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }, [mode]);

  // Toggle between light and dark mode
  const toggleMode = () => setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));

  // Context value: mode, color palette, and toggle function
  const value = {
    mode,
    colors: COLORS[mode],
    toggleMode,
  };

  // Provide theme context to children
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// useTheme: hook to access theme context (mode, colors, toggleMode)
export function useTheme() {
  return useContext(ThemeContext);
} 

