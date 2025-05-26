'use client'
import { useEffect, useState } from 'react'
import { db } from '@/src/firebase/firebase'
import { collection, onSnapshot } from 'firebase/firestore'
import { XMarkIcon } from '@heroicons/react/24/outline'

const TIME_RANGES = [
  { value: '24h', label: 'Last 24h' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: 'all', label: 'All' }
]
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'most_answered', label: 'Most Answered' },
  { value: 'unanswered', label: 'Unanswered' }
]
const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
]

export default function FiltersPanel({ filters, onFilterChange }) {
  const [availableTags, setAvailableTags] = useState([])
  const [loadingTags, setLoadingTags] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'requests'), (snapshot) => {
      const tagSet = new Set()
      snapshot.docs.forEach(doc => {
        const data = doc.data()
        if (Array.isArray(data.tags)) {
          data.tags.forEach(tag => tagSet.add(tag))
        }
      })
      setAvailableTags(Array.from(tagSet).sort())
      setLoadingTags(false)
    })
    return () => unsub()
  }, [])

  const handleTagToggle = (tag) => {
    const newTags = filters.subject.includes(tag)
      ? filters.subject.filter(s => s !== tag)
      : [...filters.subject, tag]
    onFilterChange({ ...filters, subject: newTags })
  }

  const clearFilters = () => {
    onFilterChange({ subject: [], timeRange: 'all', sortBy: 'newest', difficulty: 'all' })
  }

  return (
    <div className="w-full flex flex-col md:flex-row md:items-center gap-2 md:gap-4 bg-white/80 rounded-full shadow-sm px-3 py-2 mt-4 mb-2 border border-gray-100">
      {/* Tag Chips */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 flex-1">
        {loadingTags ? (
          <span className="text-gray-400 text-xs">Loading...</span>
        ) : availableTags.length === 0 ? (
          <span className="text-gray-400 text-xs">No tags</span>
        ) : availableTags.map((tag) => (
          <button
            key={tag}
            onClick={() => handleTagToggle(tag)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 ${
              filters.subject.includes(tag)
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-blue-50 hover:text-blue-700'
            }`}
            style={{ transition: 'all 0.15s' }}
          >
            {tag}
          </button>
        ))}
      </div>
      {/* Dropdowns */}
      <div className="flex gap-2 items-center flex-wrap">
        <select
          value={filters.timeRange}
          onChange={(e) => onFilterChange({ ...filters, timeRange: e.target.value })}
          className="rounded-full px-3 py-1 text-xs bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm"
        >
          {TIME_RANGES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          value={filters.sortBy}
          onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value })}
          className="rounded-full px-3 py-1 text-xs bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm"
        >
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          value={filters.difficulty}
          onChange={(e) => onFilterChange({ ...filters, difficulty: e.target.value })}
          className="rounded-full px-3 py-1 text-xs bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm"
        >
          <option value="all">All</option>
          {DIFFICULTY_LEVELS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button
          onClick={clearFilters}
          className="ml-1 text-gray-400 hover:text-blue-600 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-200"
          title="Clear Filters"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
} 