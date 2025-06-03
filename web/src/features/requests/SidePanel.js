'use client'
import Link from 'next/link'
import { UserCircleIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { requestService } from '@/src/services/requestService'

export default function SidePanel() {
  const [popularTags, setPopularTags] = useState([])
  const [topContributors, setTopContributors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubTags = null;
    let unsubContributors = null;
    setLoading(true);

    // Subscribe to popular tags
    unsubTags = requestService.subscribeToPopularTags((tags) => {
      setPopularTags(tags);
    });

    // Subscribe to top contributors
    unsubContributors = requestService.subscribeToTopContributors((contributors) => {
      setTopContributors(contributors);
      setLoading(false);
    });

    return () => {
      if (unsubTags) unsubTags();
      if (unsubContributors) unsubContributors();
    };
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