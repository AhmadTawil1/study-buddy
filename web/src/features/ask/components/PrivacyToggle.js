'use client'

import React from 'react'
import { useTheme } from '@/src/context/themeContext'

export default function PrivacyToggle({ isPrivate, setIsPrivate, isAnonymous, setIsAnonymous }) {
  const { mode } = useTheme();
  const labelColor = mode === 'dark' ? '#e5e7eb' : '#374151';
  const checkboxAccent = mode === 'dark' ? '#60a5fa' : '#2563eb';
  const checkboxBorder = mode === 'dark' ? '#e5e7eb' : '#d1d5db';
  return (
    <div className="flex gap-6 items-center mt-4">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isPrivate}
          onChange={e => setIsPrivate(e.target.checked)}
          className="h-5 w-5 rounded focus:ring-2 focus:ring-blue-400/40 transition-all duration-200"
          style={{ accentColor: checkboxAccent, borderColor: checkboxBorder }}
        />
        <span className="text-sm" style={{ color: labelColor }}>Private</span>
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isAnonymous}
          onChange={e => setIsAnonymous(e.target.checked)}
          className="h-5 w-5 rounded focus:ring-2 focus:ring-blue-400/40 transition-all duration-200"
          style={{ accentColor: checkboxAccent, borderColor: checkboxBorder }}
        />
        <span className="text-sm" style={{ color: labelColor }}>Ask Anonymously</span>
      </label>
    </div>
  )
} 