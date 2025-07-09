"use client"
import { useState, useEffect } from 'react';
import { useAuth } from '@/src/context/authContext';
import { questionService } from '@/src/services/questionService';
import { FiThumbsUp, FiTrash2 } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/src/context/themeContext';

// Component for displaying and managing replies to an answer
export default function ReplySection({ answerId }) {
  const { user } = useAuth();
  const [replies, setReplies] = useState([]);
  const [newReplyContent, setNewReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const router = useRouter();
  const { colors } = useTheme();

  // Subscribe to real-time updates for replies to this answer
  useEffect(() => {
    if (!answerId) return;
    const unsubscribe = questionService.subscribeToReplies(answerId, (updatedReplies) => {
      setReplies(updatedReplies);
      console.log('Replies updated (real-time):', updatedReplies);
    });
    return () => {
      if (unsubscribe) unsubscribe();
      console.log('Unsubscribed from replies for answerId:', answerId);
    };
  }, [answerId]);

  // Handle submitting a new reply
  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!newReplyContent.trim() || !user) return;

    try {
      await questionService.addReply(answerId, {
        author: user.displayName || user.email,
        content: newReplyContent,
        userId: user.uid,
      });
      setNewReplyContent('');
      setIsReplying(false);
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  // Handle upvoting a reply
  const handleReplyUpvote = async (replyId) => {
    if (!replyId || !user) return;
    try {
      await questionService.voteReply(replyId, 'up', user.uid);
    } catch (error) {
      console.error('Error upvoting reply:', error);
    }
  };

  // Handle deleting a reply
  const handleDeleteReply = async (replyId) => {
    if (!replyId) return;
    try {
      await questionService.deleteReply(replyId);
    } catch (error) {
      console.error('Error deleting reply:', error);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      {/* List of replies */}
      {replies.length > 0 && (
        <div className="space-y-3">
          {replies.map(reply => (
            <div key={reply.id} className="bg-gray-50 rounded-lg p-4 ml-8">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {/* Avatar and author */}
                  <div 
                    className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => reply.userId && router.push(`/profile/${reply.userId}`)}
                  >
                    <span className="text-blue-600 font-semibold text-xs">
                      {reply.author.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <Link href={`/profile/${reply.userId}`} className="font-medium text-blue-700 text-sm hover:underline">
                      {reply.author}
                    </Link>
                    <div className="text-xs text-gray-500">
                      {reply.createdAtFullDate} at {reply.createdAtFormatted}
                    </div>
                  </div>
                </div>
                {/* Delete button for owner */}
                {user && (reply.userId === user.uid || reply.author === user.email) && (
                  <button
                    onClick={() => handleDeleteReply(reply.id)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {/* Reply content */}
              <div className="text-sm text-gray-700 mb-2">{reply.content}</div>
              
              {/* Upvote button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleReplyUpvote(reply.id)}
                  disabled={reply.upvotedBy && user && reply.upvotedBy.includes(user.uid)}
                  className="flex items-center gap-1 text-gray-600 hover:text-blue-600 text-sm disabled:opacity-50"
                >
                  <FiThumbsUp className="w-4 h-4" />
                  <span>{reply.upvotes || 0}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply input for logged-in users */}
      {user && (
        <div className="ml-8">
          {!isReplying ? (
            <button
              onClick={() => setIsReplying(true)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Reply
            </button>
          ) : (
            <form onSubmit={handleSubmitReply} className="space-y-2">
              <textarea
                placeholder="Write your reply..."
                value={newReplyContent}
                onChange={(e) => setNewReplyContent(e.target.value)}
                className="w-full rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                style={{
                  color: colors.text,
                  background: colors.inputBg,
                  border: `1px solid ${colors.inputBorder}`
                }}
                rows="3"
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={!newReplyContent.trim()}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    background: colors.button,
                    color: colors.buttonSecondaryText,
                    opacity: !newReplyContent.trim() ? 0.5 : 1
                  }}
                >
                  Submit Reply
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsReplying(false);
                    setNewReplyContent('');
                  }}
                  className="text-sm font-medium transition-colors"
                  style={{ color: colors.inputPlaceholder }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
} 