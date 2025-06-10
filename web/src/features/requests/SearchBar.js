'use client'
import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { requestService } from '@/src/services/requestService'

export default function SearchBar({ value, onChange, onSuggestionClick }) {
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (value.length > 2) {
        try {
          const allSuggestions = await requestService.getSearchSuggestions(value)
          setSuggestions(allSuggestions)
          setShowSuggestions(true)
        } catch (error) {
          console.error('Error fetching suggestions:', error)
          setSuggestions([])
        }
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }

    fetchSuggestions()
  }, [value])

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search help requests..."
          className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
        />
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => {
                onSuggestionClick(suggestion)
                setShowSuggestions(false)
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm text-gray-700"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
} 