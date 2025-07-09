'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';

// Color palette for light and dark modes
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

// Create the theme context
const ThemeContext = createContext();

// ThemeProvider component to wrap your app and provide theme state
export function ThemeProvider({ children }) {
  // Get system color scheme preference
  const getSystemMode = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // State for current mode (light or dark)
  const [mode, setMode] = useState(getSystemMode());

  // Update the HTML class for dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }, [mode]);

  // Toggle between light and dark mode
  const toggleMode = () => setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));

  // Context value with mode, color palette, and toggle function
  const value = {
    mode,
    colors: COLORS[mode],
    toggleMode,
  };

  // Provide the theme context to children
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// useTheme hook to access theme context in components
export function useTheme() {
  return useContext(ThemeContext);
} 

