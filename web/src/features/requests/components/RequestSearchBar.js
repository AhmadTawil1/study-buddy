import React from 'react';
import { useTheme } from '@/src/context/themeContext';

// Search bar component for filtering requests by text input
function RequestSearchBar({ value, onChange, loading }) {
  const { colors } = useTheme();

  return (
    // Pill-shaped search bar with theme-based colors
    <div
      className="flex items-center rounded-full px-4 py-1.5 mb-6 w-full border"
      style={{
        background: colors.inputBg,
        borderColor: colors.inputBorder,
        boxShadow: 'none',
      }}
    >
      {/* Search icon */}
      <span className="ml-2" style={{ color: colors.inputPlaceholder }}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" /></svg>
      </span>
      {/* Input field */}
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search requests..."
        className="flex-1 pl-3 pr-4 py-2 h-10 border-none rounded-full focus:outline-none focus:ring-0 bg-transparent"
        autoComplete="off"
        style={{
          color: colors.inputText,
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
        }}
      />
      {/* Loading spinner */}
      {loading && (
        <svg className="animate-spin h-5 w-5 mr-2" style={{ color: colors.button }} viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
    </div>
  );
}

export default RequestSearchBar;