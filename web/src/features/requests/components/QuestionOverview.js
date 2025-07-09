"use client"
import { FiBookmark, FiShare2, FiThumbsUp, FiMessageSquare, FiEdit, FiSave, FiX } from 'react-icons/fi'
import { useAuth } from '@/src/context/authContext';
import { requestService } from '@/src/services/requests/requestService';
import { useState, useEffect } from 'react';
import Link from 'next/link'
import { format } from 'date-fns'
import { useTheme } from '@/src/context/themeContext';

// Add fetch for AI answer
// Helper to regenerate AI answer after title/description edit
async function regenerateAIAnswer(requestId, title, description) {
  try {
    await fetch('/api/ai-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: `${title}\n${description}` })
    });
  } catch (e) {
    // Optionally handle error
  }
}

// Component for displaying the overview of a request/question
export default function QuestionOverview({ request }) {
  const { user } = useAuth();
  const [isRequestSaved, setIsRequestSaved] = useState(request.isSavedByCurrentUser);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(request.title);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { colors } = useTheme();

  // Determine if the current user is the owner of the request
  const isOwner = user && (user.uid === request.userId);

  // Update saved status if the prop changes
  useEffect(() => {
    console.log('[QuestionOverview] useEffect triggered.');
    console.log('[QuestionOverview] user (for reference in useEffect):', user);
    const newSavedStatus = request.isSavedByCurrentUser;
    console.log('[QuestionOverview] New saved status to set:', newSavedStatus);
    setIsRequestSaved(newSavedStatus);
  }, [request.isSavedByCurrentUser, user]);

  // Handle upvoting the request
  const handleUpvote = async () => {
    if (!request || !request.id || !user) return;
    try {
      await requestService.upvoteRequest(request.id, user.uid);
    } catch (error) {
      console.error('Error upvoting request:', error);
    }
  };

  // Handle saving/unsaving the request
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      if (isRequestSaved) {
        await requestService.unsaveQuestion(user.uid, request.id);
      } else {
        await requestService.saveQuestion(user.uid, request.id);
      }
      setIsRequestSaved(!isRequestSaved);
    } catch (error) {
      console.error('Error saving/unsaving question:', error);
    }
    setSaving(false);
  };

  // Cancel editing the title
  const handleCancel = () => {
    setEditing(false);
    setError("");
  };

  // Handle sharing the request (native share or copy link)
  const handleShare = async () => {
    if (!request || !request.id) return;
    const shareUrl = `${window.location.origin}/requests/${request.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: request.title || 'Request',
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      } catch (error) {
        console.error('Error copying link:', error);
        alert('Failed to copy link.');
      }
    }
  };

  // Start editing the title
  const handleEdit = () => {
    setEditing(true);
    setEditTitle(request.title);
    setError("");
  };

  // Save the edited title
  const handleSaveTitle = async () => {
    if (!editTitle.trim()) {
      setError("Title cannot be empty.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await requestService.updateRequest(request.id, { title: editTitle, title_lowercase: editTitle.toLowerCase() });
      setEditing(false);
      setSaving(false);
      // Regenerate AI answer after title edit
      await regenerateAIAnswer(request.id, editTitle, request.description);
    } catch (err) {
      console.error("Error updating title:", err);
      setError(`Failed to save title: ${err.message || 'An unexpected error occurred.'}`);
      setSaving(false);
    }
  };

  return (
    // Card for question overview
    <div className="rounded-xl shadow-lg p-6 mb-6" style={{ background: colors.card, color: colors.text }}>
      <div className="flex justify-between items-start mb-4">
        <div>
          {/* Title editing or display */}
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-2xl font-bold w-full border-b focus:border-blue-500 outline-none"
                style={{ color: colors.text, borderColor: colors.inputBorder }}
              />
              <button
                onClick={handleSaveTitle}
                disabled={saving}
                className="px-3 py-1 rounded-md text-sm disabled:opacity-50"
                style={{ background: colors.button, color: colors.buttonSecondaryText }}
              >
                {saving ? <FiSave className="animate-spin" /> : <FiSave />} Save
              </button>
              <button
                onClick={handleCancel}
                className="px-2 py-1 rounded-md text-sm"
                style={{ color: colors.inputPlaceholder }}
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold" style={{ color: colors.text }}>{request.title}</h1>
              {isOwner && (
                <button
                  onClick={handleEdit}
                  className="text-sm flex items-center gap-1"
                  style={{ color: colors.button }}
                >
                  <FiEdit className="w-4 h-4" /> Edit
                </button>
              )}
            </div>
          )}
          {error && <p className="text-sm mt-1" style={{ color: '#ef4444' }}>{error}</p>}
          {/* Author and date */}
          <div className="flex items-center gap-2 text-xs mt-1" style={{ color: colors.inputPlaceholder }}>
            <span>by <Link href={`/profile/${request.userId}`} className="hover:underline font-medium" style={{ color: colors.button }}>{request.author}</Link></span>
            <span>&middot;</span>
            <span>{request.createdAt ? format(request.createdAt.toDate ? request.createdAt.toDate() : request.createdAt, 'PPpp') : ''}</span>
          </div>
        </div>
        {/* Save and share buttons */}
        {user && (
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors`}
            style={{ background: isRequestSaved ? (colors.mode === 'dark' ? '#1e293b' : '#bfdbfe') : colors.inputBg, color: isRequestSaved ? colors.button : colors.inputPlaceholder }}
          >
            <FiBookmark className={`w-5 h-5 ${isRequestSaved ? 'fill-current' : ''}`} />
            <span style={{ color: isRequestSaved ? colors.button : colors.inputPlaceholder }}>{isRequestSaved ? 'Saved' : 'Save'}</span>
          </button>
        )}
        <button
          onClick={handleShare}
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium shadow hover:bg-blue-100 dark:hover:bg-gray-800 transition border border-blue-200"
          style={{ color: colors.button }}
        >
          <FiShare2 className="w-4 h-4" /> Share
        </button>
      </div>

      {/* Answers count and tags */}
      <div className="flex items-center gap-4 text-sm mb-4" style={{ color: colors.inputPlaceholder }}>
        <div className="flex items-center gap-1">
          <FiMessageSquare className="w-4 h-4" />
          <span style={{ color: colors.inputPlaceholder }}>{request.answersCount || 0} answers</span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {request.tags?.map((tag, index) => (
          <span
            key={index}
            className="px-3 py-1 rounded-full text-sm"
            style={{ background: colors.mode === 'dark' ? '#1e293b' : '#dbeafe', color: colors.button }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}