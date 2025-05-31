'use client'
import Link from 'next/link'
import { UserCircleIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { db } from '@/src/firebase/firebase'
import { collection, onSnapshot, query, where, getDocs } from 'firebase/firestore'

export default function SidePanel() {
  const [popularTags, setPopularTags] = useState([])
  const [topContributors, setTopContributors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Listener for Popular Tags (from requests)
    const unsubRequests = onSnapshot(collection(db, 'requests'), (snapshot) => {
      const tagCount = {}
      snapshot.docs.forEach(doc => {
        const data = doc.data()
        // Tags
        if (Array.isArray(data.tags)) {
          data.tags.forEach(tag => {
            tagCount[tag] = (tagCount[tag] || 0) + 1
          })
        }
      })
      // Top 5 tags
      const tagsSorted = Object.entries(tagCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }))
      setPopularTags(tagsSorted)
      // We don't set loading to false here yet, as we are also waiting for contributors data
    })

    // Listener for Top Contributors (from answers)
    const unsubAnswers = onSnapshot(collection(db, 'answers'), async (snapshot) => {
      const contributorCount = {}
      snapshot.docs.forEach(doc => {
        const data = doc.data()
        // Contributors count based on answers
        // Assuming the author's name is stored in the 'author' or 'authorName' field (which is currently email)
        const authorEmail = data.author || data.authorName || 'Unknown'
        if (authorEmail !== 'Unknown') {
          contributorCount[authorEmail] = (contributorCount[authorEmail] || 0) + 1
        }
      })

      // Sort contributors by answer count and get top 5 emails
      const sortedContributorEmails = Object.entries(contributorCount)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 5)
        .map(([email, count]) => ({ email, count }))

      // If there are no contributors, set and return
      if (sortedContributorEmails.length === 0) {
        setTopContributors([])
        setLoading(false)
        return
      }

      // Fetch user data for the top contributor emails
      const topContributorEmails = sortedContributorEmails.map(item => item.email)
      const usersRef = collection(db, 'users')
      // Firestore 'in' query supports up to 10 items in the array
      if (topContributorEmails.length > 0) {
        const usersQuery = query(usersRef, where('email', 'in', topContributorEmails))
        const usersSnapshot = await getDocs(usersQuery)

        const userDataMap = {}
        usersSnapshot.docs.forEach(doc => {
          const data = doc.data()
          userDataMap[data.email] = { name: data.name, nickname: data.nickname }
        })

        // Combine answer counts with user names/nicknames
        const topContributorsWithNames = sortedContributorEmails.map(item => {
          const userData = userDataMap[item.email]
          const displayName = userData?.nickname || userData?.name || item.email // Use nickname, then name, then email as fallback
          return { name: displayName, answers: item.count }
        })

        setTopContributors(topContributorsWithNames)
      }

      setLoading(false) // Set loading to false after answers data and user data is received
    })

    // Cleanup function to unsubscribe from both listeners
    return () => {
      unsubRequests()
      unsubAnswers()
    }
  }, []) // Empty dependency array means this effect runs once on mount and cleans up on unmount

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