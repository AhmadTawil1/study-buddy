// src/features/requests/RequestFeed.js
'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import RequestCard from '../components/RequestCard'
import SearchBar from '../components/SearchBar'
import FiltersPanel from '../components/FiltersPanel'
import SidePanel from '../components/SidePanel'
import { requestService } from '@/src/services/requests/requestService'
import timeAgo from '@/src/utils/timeAgo'

const PAGE_SIZE = 10

export default function RequestFeed() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [lastDoc, setLastDoc] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({})
  const sentinelRef = useRef(null)

  // Initial load
  useEffect(() => {
    setRequests([])
    setLastDoc(null)
    setHasMore(true)
    loadRequests(true)
    // eslint-disable-next-line
  }, [searchQuery, filters])

  const loadRequests = useCallback(async (reset = false) => {
    if (loading || (!reset && !hasMore)) return
    setLoading(true)
    const { requests: newRequests, lastDoc: newLastDoc } = await requestService.fetchRequestsPaginated(PAGE_SIZE, reset ? null : lastDoc, filters, searchQuery)
    setRequests(prev => {
      if (reset) return newRequests
      const existingIds = new Set(prev.map(r => r.id))
      const filtered = newRequests.filter(r => !existingIds.has(r.id))
      return [...prev, ...filtered]
    })
    setLastDoc(newLastDoc)
    setHasMore(!!newLastDoc && newRequests.length === PAGE_SIZE)
    setLoading(false)
  }, [loading, hasMore, lastDoc, filters, searchQuery])

  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore || loading) return
    const observer = new window.IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadRequests()
        }
      },
      { threshold: 1 }
    )
    if (sentinelRef.current) observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [loadRequests, hasMore, loading])

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
            onFilterChange={setFilters}
          />
          {/* Result count and active filters */}
          <div className="flex items-center justify-between mt-4 mb-2">
            <span className="text-xs text-gray-500">
              {loading && requests.length === 0 ? 'Loading...' : `${requests.length} result${requests.length !== 1 ? 's' : ''}`}
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
              {loading && requests.length === 0 && (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-100 h-36 rounded-lg" />
                ))
              )}
              {!loading && requests.length === 0 && (
                <div className="col-span-2 text-center text-gray-400">
                  No requests found. Try adjusting your filters or search query.
                </div>
              )}
              {/* Filter out duplicate IDs before rendering */}
              {(() => {
                const uniqueRequests = [];
                const seenIds = new Set();
                for (const req of requests) {
                  if (!seenIds.has(req.id)) {
                    uniqueRequests.push(req);
                    seenIds.add(req.id);
                  }
                }
                console.log('Request IDs:', uniqueRequests.map(r => r.id));
                return uniqueRequests.map(req => (
                  <RequestCard
                    key={req.id}
                    id={req.id}
                    title={req.title}
                    description={req.description}
                    timeAgo={req.createdAt?.toDate ? timeAgo(req.createdAt.toDate()) : ''}
                    author={req.authorName || 'Unknown'}
                    userId={req.userId}
                    createdAt={req.createdAt}
                    tags={req.tags || []}
                    answersCount={req.answersCount || 0}
                  />
                ));
              })()}
            </div>
            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} style={{ height: 1 }} />
            {loading && requests.length > 0 && (
              <div className="text-center text-gray-400 py-4">Loading more...</div>
            )}
            {!hasMore && requests.length > 0 && (
              <div className="text-center text-gray-400 py-4">No more requests.</div>
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
