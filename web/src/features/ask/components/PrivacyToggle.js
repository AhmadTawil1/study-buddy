'use client'

import React from 'react'
import { FiLock, FiGlobe } from 'react-icons/fi'

export default function PrivacyToggle({ isPrivate, setIsPrivate, isAnonymous, setIsAnonymous }) {
  return (
    <div className="flex gap-6 items-center mt-4">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isPrivate}
          onChange={e => setIsPrivate(e.target.checked)}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <span className="text-sm">Private</span>
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isAnonymous}
          onChange={e => setIsAnonymous(e.target.checked)}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <span className="text-sm">Ask Anonymously</span>
      </label>
    </div>
  )
} 