// src/features/requests/RequestFeed.js
'use client'
import { useState, useEffect } from 'react'
import RequestCard from './RequestCard'
import SearchBar from './SearchBar'
import FiltersPanel from './FiltersPanel'
import SidePanel from './SidePanel'
import { useRequest } from '@/src/context/requestContext'
import timeAgo from '@/src/utils/timeAgo'

export default function RequestFeed() {
  const { requests, loading, filters, updateFilters } = useRequest()
  const [searchQuery, setSearchQuery] = useState('')

  // Helper: active filters summary
  const activeFilters = []
  if (filters.subject) activeFilters.push(filters.subject)
  if (filters.status) activeFilters.push(`Status: ${filters.status}`)

  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1">
          <SearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
            onSuggestionClick={(suggestion) => setSearchQuery(suggestion)}
          />
          
          <FiltersPanel 
            filters={filters}
            onFilterChange={updateFilters}
          />

          {/* Result count and active filters */}
          <div className="flex items-center justify-between mt-4 mb-2">
            <span className="text-xs text-gray-500">
              {loading ? 'Loading...' : `${requests.length} result${requests.length !== 1 ? 's' : ''}`}
            </span>
            <div className="flex gap-1 flex-wrap">
              {activeFilters.map((f, i) => (
                <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs border border-blue-100">{f}</span>
              ))}
            </div>
          </div>

          <div className="mt-2 space-y-4">
            {/* Request Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-100 h-36 rounded-lg" />
                ))
              ) : requests.length === 0 ? (
                <div className="col-span-2 text-center text-gray-400">No requests found. Try adjusting your filters or search query.</div>
              ) : (
                requests.map(req => (
                  <RequestCard
                    key={req.id}
                    id={req.id}
                    title={req.title}
                    description={req.description}
                    timeAgo={req.createdAt?.toDate ? timeAgo(req.createdAt.toDate()) : ''}
                    author={req.authorName || 'Unknown'}
                    tags={req.tags || []}
                    answersCount={req.answersCount || 0}
                  />
                ))
              )}
            </div>

            {/* Load More Button */}
            {requests.length > 0 && (
              <div className="text-center mt-8">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Load More
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-full md:w-80">
          <SidePanel />
        </div>
      </div>
    </div>
  )
}
