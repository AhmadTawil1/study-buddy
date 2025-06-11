"use client"
import { FiBookmark, FiShare2, FiThumbsUp, FiMessageSquare, FiEye } from 'react-icons/fi'
import { useAuth } from '@/src/context/authContext';
import { requestService } from '@/src/services/requestService';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link'
import { format } from 'date-fns'

export default function QuestionOverview({ request }) {
  const { user } = useAuth();
  const [isRequestSaved, setIsRequestSaved] = useState(request.isSavedByCurrentUser);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(request.title);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isOwner = user && (user.uid === request.userId);

  useEffect(() => {
    console.log('[QuestionOverview] useEffect triggered.');
    console.log('[QuestionOverview] user (for reference in useEffect):', user);
    const newSavedStatus = request.isSavedByCurrentUser;
    console.log('[QuestionOverview] New saved status to set:', newSavedStatus);
    setIsRequestSaved(newSavedStatus);
  }, [request.isSavedByCurrentUser, user]);

  const handleUpvote = async () => {
    if (!request || !request.id || !user) return;
    try {
      await requestService.upvoteRequest(request.id, user.uid);
    } catch (error) {
      console.error('Error upvoting request:', error);
    }
  };

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

  const handleCancel = () => {
    setEditing(false);
    setError("");
  };

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

  const handleEdit = () => {
    setEditing(true);
    setEditTitle(request.title);
    setError("");
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{request.title}</h1>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
            <span>by <Link href={`/profile/${request.userId}`} className="hover:underline text-blue-700 font-medium">{request.author}</Link></span>
            <span>&middot;</span>
            <span>{request.createdAt ? format(request.createdAt.toDate ? request.createdAt.toDate() : request.createdAt, 'PPpp') : ''}</span>
          </div>
        </div>
        {user && (
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isRequestSaved 
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FiBookmark className={`w-5 h-5 ${isRequestSaved ? 'fill-current' : ''}`} />
            {isRequestSaved ? 'Saved' : 'Save'}
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-1">
          <FiMessageSquare className="w-4 h-4" />
          <span>{request.answersCount || 0} answers</span>
        </div>
        <div className="flex items-center gap-1">
          <FiEye className="w-4 h-4" />
          <span>{request.views || 0} views</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {request.tags?.map((tag, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}