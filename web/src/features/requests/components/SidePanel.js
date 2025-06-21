'use client'
import Link from 'next/link'
import { UserCircleIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { subscribeToPopularTags } from '@/src/services/requests/tagService'
import { subscribeToTopContributors } from '@/src/services/requests/contributorService'
import { useTheme } from '@/src/context/themeContext'

export default function SidePanel() {
  const [popularTags, setPopularTags] = useState([])
  const [topContributors, setTopContributors] = useState([])
  const [loading, setLoading] = useState(true)
  const { colors } = useTheme();

  useEffect(() => {
    let unsubTags = null;
    let unsubContributors = null;
    setLoading(true);

    // Subscribe to popular tags
    unsubTags = subscribeToPopularTags((tags) => {
      setPopularTags(tags);
    });

    // Subscribe to top contributors
    unsubContributors = subscribeToTopContributors((contributors) => {
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
      <div
        className="rounded-lg shadow-sm p-4 border hover:shadow-md transition-shadow duration-300 ease-in-out"
        style={{ background: colors.card, borderColor: colors.inputBorder }}
      >
        <h3 className="font-semibold mb-4" style={{ color: colors.text }}>Popular Tags</h3>
        <div className="space-y-2">
          {loading ? (
            <div style={{ color: colors.inputPlaceholder }}>Loading...</div>
          ) : popularTags.length === 0 ? (
            <div style={{ color: colors.inputPlaceholder }}>No tags found</div>
          ) : popularTags.map((tag) => (
            <div
              key={tag.name}
              className="flex justify-between items-center text-sm px-3 py-2 rounded-md transition-colors"
              style={{ background: colors.inputBg, color: colors.button }}
            >
              <span style={{ color: colors.button }}>{tag.name}</span>
              <span style={{ color: colors.button }}>{tag.count} questions</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Contributors */}
      <div
        className="rounded-lg shadow-sm p-4 border hover:shadow-md transition-shadow duration-300 ease-in-out"
        style={{ background: colors.card, borderColor: colors.inputBorder }}
      >
        <h3 className="font-semibold mb-4" style={{ color: colors.text }}>Top Contributors</h3>
        <div className="space-y-3">
          {loading ? (
            <div style={{ color: colors.inputPlaceholder }}>Loading...</div>
          ) : topContributors.length === 0 ? (
            <div style={{ color: colors.inputPlaceholder }}>No contributors found</div>
          ) : topContributors.map((contributor) => (
            <Link
              key={contributor.name}
              href={`/profile/${contributor.userId}`}
              className="flex items-center justify-between p-3 rounded-md transition-colors duration-300 ease-in-out"
              style={{ background: colors.inputBg }}
            >
              <div className="flex items-center">
                <UserCircleIcon className="h-8 w-8 mr-2" style={{ color: colors.button }} />
                <span className="text-sm font-medium" style={{ color: colors.button }}>{contributor.name}</span>
              </div>
              <span className="text-sm" style={{ color: colors.button }}>
                {contributor.answers} answers
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Ask Question CTA */}
      <div
        className="rounded-lg p-6 text-center"
        style={{ background: colors.inputBg }}
      >
        <h3 className="text-lg font-semibold mb-2" style={{ color: colors.button }}>
          Need Help?
        </h3>
        <p className="mb-4" style={{ color: colors.text }}>
          Ask your question and get help from our community
        </p>
        <Link
          href="/ask"
          className="inline-block px-6 py-2 rounded-lg transition-colors"
          style={{ background: colors.button, color: colors.buttonSecondaryText }}
        >
          Ask a Question
        </Link>
      </div>
    </div>
  )
} 