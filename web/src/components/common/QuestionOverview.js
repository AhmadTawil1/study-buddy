"use client"
import { FiBookmark, FiShare2, FiThumbsUp } from 'react-icons/fi'
import { useAuth } from '@/src/context/authContext';
import { requestService } from '@/src/services/requestService';
import { useState, useEffect } from 'react';

export default function QuestionOverview({ request }) {
  const { user } = useAuth();
  const [isRequestSaved, setIsRequestSaved] = useState(request.isSavedByCurrentUser);

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
    if (!request || !request.id || !user) return;
    try {
      const savedStatus = await requestService.saveRequestForUser(user.uid, request.id);
      console.log(`Request is now ${savedStatus ? 'saved' : 'unsaved'}`);
      setIsRequestSaved(savedStatus);
    } catch (error) {
      console.error('Error saving request:', error);
    }
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{request.title}</h1>
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">{request.subject}</span>
            <div className="flex items-center text-gray-500 text-sm">
              <span className="font-medium text-gray-700">{request.authorName || request.author || request.userEmail || "Unknown"}</span>
              <span className="mx-2">•</span>
              <span>{request.createdAtFullDate} at {request.createdAtFormatted}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4 border-t border-gray-100 pt-4">
        <button 
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${request.upvotedBy && user && request.upvotedBy.includes(user.uid) ? 'bg-blue-100 text-blue-700' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
          onClick={handleUpvote}
        >
          <FiThumbsUp className="w-4 h-4" /> 
          <span className="font-medium">Upvote</span>
          <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-sm">
            {request.upvotes || 0}
          </span>
        </button>
        
        <button 
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isRequestSaved ? 'bg-blue-100 text-blue-700' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
          onClick={handleSave}
        >
          <FiBookmark className="w-4 h-4" /> 
          <span className="font-medium">Save</span>
        </button>
        
        <button 
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors" 
          onClick={handleShare}
        >
          <FiShare2 className="w-4 h-4" /> 
          <span className="font-medium">Share</span>
        </button>
      </div>
    </div>
  )
}