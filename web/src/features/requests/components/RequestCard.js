'use client'
import Link from 'next/link'
import { BookmarkIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'
import pluralize from '@/src/utils/pluralize'
import { useAuth } from '@/src/context/authContext'
import { requestService } from '@/src/services/requests/requestService'
import { format } from 'date-fns'
import Card from '@/src/components/common/Card'
import { useTheme } from '@/src/context/themeContext'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/src/firebase/firebase'

// Card component for displaying a single request/ask item
export default function RequestCard({ id, title, description, timeAgo, author, tags, answersCount, userId, createdAt }) {
  const { user } = useAuth()
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { colors } = useTheme();
  const [realAnswersCount, setRealAnswersCount] = useState(0);

  // Real-time listener for answers (excluding AI Assistant)
  useEffect(() => {
    if (!id) return;
    const q = query(collection(db, 'answers'), where('requestId', '==', id));
    const unsub = onSnapshot(q, (snapshot) => {
      const answers = snapshot.docs.map(doc => doc.data());
      const humanAnswers = answers.filter(a => a.author !== 'AI Assistant');
      setRealAnswersCount(humanAnswers.length);
    });
    return () => unsub();
  }, [id]);

  // Check if this question is saved by the user
  useEffect(() => {
    if (!user) return
    const checkSaved = async () => {
      try {
        const savedQuestions = await requestService.getSavedQuestions(user.uid)
        setIsSaved(savedQuestions.some(q => q.id === id))
      } catch (e) {
        setIsSaved(false)
      }
    }
    checkSaved()
  }, [user, id])

  // Handle bookmark (save/unsave)
  const handleSave = async () => {
    if (!user) return
    setIsSaving(true)
    try {
      if (isSaved) {
        await requestService.unsaveQuestion(user.uid, id)
      } else {
        await requestService.saveQuestion(user.uid, id)
      }
      setIsSaved(!isSaved)
    } catch (e) {
      // Optionally show error
    }
    setIsSaving(false)
  }

  return (
    // Card layout
    <Card className="hover:shadow-2xl transition-shadow p-6 pt-5 border-t-4 border-blue-200" bgColor={colors.card}>
      <div className="flex justify-between items-start mb-4">
        <div>
          {/* Title and author */}
          <h3 className="text-lg font-semibold mb-1" style={{ color: colors.text }}>{title}</h3>
          <div className="flex items-center gap-2 text-xs mb-1" style={{ color: colors.inputPlaceholder }}>
            <span>by <Link href={`/profile/${userId}`} className="hover:underline font-medium" style={{ color: colors.button }}>{author}</Link></span>
            <span>&middot;</span>
            <span>{createdAt ? format(createdAt.toDate ? createdAt.toDate() : createdAt, 'PPpp') : timeAgo}</span>
          </div>
        </div>
        {/* Bookmark button */}
        {user && (
          <button
            className={`transition-colors rounded-full p-1 border-none outline-none focus:ring-2 focus:ring-blue-200 ${
              isSaved ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'text-gray-400 hover:text-blue-600'
            }`}
            style={{ cursor: isSaving ? 'pointer' : '', color: isSaved ? colors.button : colors.inputPlaceholder, background: isSaved ? (colors.mode === 'dark' ? '#1e293b' : '#bfdbfe') : undefined }}
            title={isSaved ? 'Bookmarked' : 'Bookmark'}
            aria-label="Bookmark"
            onClick={handleSave}
            disabled={isSaving}
          >
            <BookmarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Description */}
      <p className="text-sm mb-4 line-clamp-2" style={{ color: colors.text }}>{description}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 text-xs rounded-full font-medium"
            style={{ background: colors.mode === 'dark' ? '#1e293b' : '#dbeafe', color: colors.button }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Answers count and view button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center text-sm" style={{ color: colors.inputPlaceholder }}>
          <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
          {pluralize(realAnswersCount, 'answer')}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/requests/${id}`}
            className="px-3 py-1 text-sm font-medium rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
            style={{ color: colors.button }}
            title="View details of this request"
            aria-label="View details"
          >
            View
          </Link>
        </div>
      </div>
    </Card>
  )
} 