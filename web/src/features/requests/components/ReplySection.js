"use client"
import { useState, useEffect } from 'react';
import { useAuth } from '@/src/context/authContext';
import { questionService } from '@/src/services/questionService';
import { FiThumbsUp, FiTrash2 } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { submitReply } from '@/src/services/requests/answerService';

export default function ReplySection({ answerId }) {
  const { user } = useAuth();
  const [replies, setReplies] = useState([]);
  const [newReplyContent, setNewReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const router = useRouter();

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

  const handleReplyUpvote = async (replyId) => {
    if (!replyId || !user) return;
    try {
      await questionService.voteReply(replyId, 'up', user.uid);
    } catch (error) {
      console.error('Error upvoting reply:', error);
    }
  };

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
      {replies.length > 0 && (
        <div className="space-y-3">
          {replies.map(reply => (
            <div key={reply.id} className="bg-gray-50 rounded-lg p-4 ml-8">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
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
                {user && (reply.userId === user.uid || reply.author === user.email) && (
                  <button
                    onClick={() => handleDeleteReply(reply.id)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="text-sm text-gray-700 mb-2">{reply.content}</div>
              
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
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={!newReplyContent.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  Submit Reply
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsReplying(false);
                    setNewReplyContent('');
                  }}
                  className="text-gray-600 hover:text-gray-700 text-sm font-medium"
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