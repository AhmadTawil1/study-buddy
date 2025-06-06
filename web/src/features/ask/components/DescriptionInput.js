'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import { rephraseQuestion } from '@/src/services/aiService'

export default function DescriptionInput({ value, onChange, onRephrase, loading, showPreview, setShowPreview }) {
  const handleRephraseDescription = async () => {
    if (!value.trim()) return
    onRephrase(true)
    const result = await rephraseQuestion(value)
    onChange(result || value)
    onRephrase(false)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
      <div className="flex justify-end mb-1">
        <button
          type="button"
          className="text-xs text-blue-600 hover:text-blue-700 mr-2"
          onClick={() => setShowPreview(p => !p)}
        >
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </button>
        <button
          type="button"
          className="text-xs text-blue-600 hover:text-blue-700"
          onClick={handleRephraseDescription}
          disabled={loading || !(value || '').trim()}
        >
          {loading ? 'Rephrasing...' : 'Rephrase with AI'}
        </button>
      </div>
      {showPreview ? (
        <div className="border rounded p-2 bg-gray-50 text-sm">
          <ReactMarkdown>{value}</ReactMarkdown>
        </div>
      ) : (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={6}
          placeholder="Describe your question in detail..."
          className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      )}
    </div>
  )
} 