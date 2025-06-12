'use client'

import React from 'react'
import { useTheme } from '@/src/context/themeContext'

export default function TagInput({ subject, setSubject, tags, setTags, customTag, setCustomTag, onAddTag, onRemoveTag, subjectsList }) {
  const { colors } = useTheme();
  return (
    <div>
      <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>Subject</label>
      <select
        value={subject}
        onChange={e => setSubject(e.target.value)}
        className="w-full border border-gray-300 px-4 py-2 rounded-lg mb-2"
        style={{ color: colors.inputText, background: colors.inputBg }}
      >
        <option value="">Select a subject</option>
        {subjectsList.map(subj => (
          <option key={subj} value={subj}>{subj}</option>
        ))}
      </select>
      <label className="block text-sm font-medium mb-1 mt-2" style={{ color: colors.text }}>Tags</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map(tag => (
          <span key={tag} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs flex items-center">
            {tag}
            <button type="button" className="ml-1 text-blue-500 hover:text-blue-700" onClick={() => onRemoveTag(tag)}>&times;</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={customTag}
          onChange={e => setCustomTag(e.target.value)}
          placeholder="Add a tag"
          className="border border-gray-300 px-2 py-1 rounded text-sm"
          style={{ color: colors.inputText, background: colors.inputBg, '::placeholder': { color: colors.inputPlaceholder } }}
        />
        <button type="button" className="bg-blue-600 text-white px-3 py-1 rounded text-sm" onClick={() => onAddTag(customTag)} disabled={!customTag.trim()}>
          Add
        </button>
      </div>
    </div>
  )
} 