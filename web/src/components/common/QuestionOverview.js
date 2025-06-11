"use client"
import { FiBookmark, FiShare2, FiThumbsUp, FiMessageSquare, FiEdit, FiSave, FiX } from 'react-icons/fi'
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
    } catch (err) {
      console.error("Error updating title:", err);
      setError(`Failed to save title: ${err.message || 'An unexpected error occurred.'}`);
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-2xl font-bold text-gray-900 w-full border-b border-gray-300 focus:border-blue-500 outline-none"
              />
              <button
                onClick={handleSaveTitle}
                disabled={saving}
                className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? <FiSave className="animate-spin" /> : <FiSave />} Save
              </button>
              <button
                onClick={handleCancel}
                className="text-gray-600 hover:text-gray-900 px-2 py-1 rounded-md text-sm"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{request.title}</h1>
              {isOwner && (
                <button
                  onClick={handleEdit}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                >
                  <FiEdit className="w-4 h-4" /> Edit
                </button>
              )}
            </div>
          )}
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
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