"use client"
import { FiBookmark, FiShare2, FiThumbsUp } from 'react-icons/fi'
import { doc, updateDoc, increment, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/src/firebase/firebase';
import { useAuth } from '@/src/context/authContext';

export default function QuestionOverview({ request }) {
  const { user } = useAuth();

  const handleUpvote = async () => {
    if (!request || !request.id) return;
    try {
      const requestRef = doc(db, 'requests', request.id);
      await updateDoc(requestRef, {
        upvotes: increment(1)
      });
    } catch (error) {
      console.error('Error upvoting request:', error);
    }
  };

  const handleSave = async () => {
    if (!request || !request.id || !user) return;
    const userRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userRef, {
        bookmarks: arrayUnion(request.id)
      });
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
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{request.title}</h1>
      <div className="flex items-center gap-2 mb-2">
        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">{request.subject}</span>
        <span className="text-gray-600 text-xs">{request.author} • {request.timeAgo}</span>
      </div>
      <div className="flex gap-4 mb-4">
        <button className="flex items-center gap-1 text-blue-600 font-medium hover:underline" onClick={handleUpvote}>
          <FiThumbsUp /> Upvote ({request.upvotes || 0})
        </button>
        <button className="flex items-center gap-1 text-blue-600 font-medium hover:underline" onClick={handleSave}>
          <FiBookmark /> Save
        </button>
        <button className="flex items-center gap-1 text-blue-600 font-medium hover:underline" onClick={handleShare}>
          <FiShare2 /> Share
        </button>
      </div>
    </div>
  )
}