'use client'

import React from 'react'
import { rephraseQuestion } from '@/src/services/aiService'
import { useTheme } from '@/src/context/themeContext'

export default function DescriptionInput({ value, onChange, onRephrase, loading }) {
  const { colors } = useTheme();
  const handleRephraseDescription = async () => {
    if (!value.trim()) return
    onRephrase(true)
    const result = await rephraseQuestion(value)
    onChange(result || value)
    onRephrase(false)
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>Description</label>
      <div className="flex justify-end mb-1">
        <button
          type="button"
          className="text-xs text-blue-600 hover:text-blue-700"
          onClick={handleRephraseDescription}
          disabled={loading || !(value || '').trim()}
        >
          {loading ? 'Rephrasing...' : 'Rephrase with AI'}
        </button>
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={6}
        placeholder="Describe your question in detail..."
        className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        style={{ color: colors.inputText, background: colors.inputBg, borderColor: colors.inputBorder }}
      />
    </div>
  )
} 