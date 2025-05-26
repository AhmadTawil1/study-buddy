'use client'
import Link from 'next/link'
import { UserCircleIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { db } from '@/src/firebase/firebase'
import { collection, onSnapshot } from 'firebase/firestore'

export default function SidePanel() {
  const [popularTags, setPopularTags] = useState([])
  const [topContributors, setTopContributors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'requests'), (snapshot) => {
      const tagCount = {}
      const contributorCount = {}
      snapshot.docs.forEach(doc => {
        const data = doc.data()
        // Tags
        if (Array.isArray(data.tags)) {
          data.tags.forEach(tag => {
            tagCount[tag] = (tagCount[tag] || 0) + 1
          })
        }
        // Contributors
        const author = data.authorName || 'Unknown'
        contributorCount[author] = (contributorCount[author] || 0) + 1
      })
      // Top 5 tags
      const tagsSorted = Object.entries(tagCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }))
      setPopularTags(tagsSorted)
      // Top 5 contributors
      const contributorsSorted = Object.entries(contributorCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, answers]) => ({ name, answers }))
      setTopContributors(contributorsSorted)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  return (
    <div className="space-y-6">
      {/* Popular Tags */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Popular Tags</h3>
        <div className="space-y-2">
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : popularTags.length === 0 ? (
            <div className="text-gray-400">No tags found</div>
          ) : popularTags.map((tag) => (
            <div
              key={tag.name}
              className="flex justify-between items-center text-sm"
            >
              <span className="text-gray-700">{tag.name}</span>
              <span className="text-gray-500">{tag.count} questions</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Contributors */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Top Contributors</h3>
        <div className="space-y-3">
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : topContributors.length === 0 ? (
            <div className="text-gray-400">No contributors found</div>
          ) : topContributors.map((contributor) => (
            <div
              key={contributor.name}
              className="flex items-center justify-between"
            >
              <div className="flex items-center">
                <UserCircleIcon className="h-8 w-8 text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">{contributor.name}</span>
              </div>
              <span className="text-sm text-gray-500">
                {contributor.answers} answers
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Ask Question CTA */}
      <div className="bg-blue-50 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Need Help?
        </h3>
        <p className="text-blue-700 mb-4">
          Ask your question and get help from our community
        </p>
        <Link
          href="/ask"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Ask a Question
        </Link>
      </div>
    </div>
  )
} 