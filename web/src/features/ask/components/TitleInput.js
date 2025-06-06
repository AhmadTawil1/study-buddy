'use client'

import React from 'react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { rephraseQuestion } from '@/src/services/aiService'
import calculateClarityScore from '@/src/utils/clarityScore'

const MAX_TITLE_LENGTH = 100

export default function TitleInput({ value, onChange, onRephrase, loading, clarityScore, maxLength }) {
  const [aiTitle, setAiTitle] = useState('')

  const handleRephraseTitle = async () => {
    if (!value.trim()) return
    onRephrase(true)
    const result = await rephraseQuestion(value)
    setAiTitle(result || '⚠️ Could not rephrase title')
    onRephrase(false)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Title
        <span className="text-gray-500 ml-2">
          {(value || '').length}/{maxLength}
        </span>
        {clarityScore !== undefined && (
          <span className="ml-2 text-xs text-blue-500">Clarity: {clarityScore}/10</span>
        )}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value.slice(0, maxLength))}
          placeholder="Enter your question title"
          className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="button"
          onClick={handleRephraseTitle}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700"
          disabled={loading || !(value || '').trim()}
        >
          {loading ? 'Rephrasing...' : 'Rephrase with AI'}
        </button>
      </div>
      {value && (
        <div className="mt-2 text-sm text-gray-500">
          Avoid vague titles like "Help me please"
        </div>
      )}
      {clarityScore !== null && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm font-medium">Clarity score:</span>
          <div className="flex items-center">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full mx-0.5 ${
                  i < clarityScore ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {clarityScore}/10 {clarityScore >= 7 ? '😊' : '🤔'}
          </span>
        </div>
      )}
      {aiTitle && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 bg-blue-50 p-3 rounded-lg"
        >
          <p className="text-sm text-blue-800">
            <strong>AI Suggestion:</strong> {aiTitle}
          </p>
          <button
            type="button"
            onClick={() => onChange(aiTitle)}
            className="mt-1 text-xs text-blue-600 hover:text-blue-700"
          >
            Use this version
          </button>
        </motion.div>
      )}
    </div>
  )
} 