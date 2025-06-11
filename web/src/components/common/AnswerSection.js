"use client"
import { useState } from 'react';
import { useAuth } from '@/src/context/authContext';
import { questionService } from '@/src/services/questionService';
import { FiThumbsUp, FiTrash2, FiMessageSquare } from 'react-icons/fi';
import ReplySection from './ReplySection';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function AnswerSection({ answers, requestId }) {
  const { user } = useAuth();
  const [newAnswerContent, setNewAnswerContent] = useState('');
  const [showReplies, setShowReplies] = useState({});

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!newAnswerContent.trim() || !user) return;

    try {
      await questionService.addAnswer(requestId, {
        author: user.displayName || user.email,
        badge: 'Contributor',
        content: newAnswerContent,
        userId: user.uid,
      });
      setNewAnswerContent('');
    } catch (error) {
      console.error('Error adding answer:', error);
    }
  };

  const handleAnswerUpvote = async (answerId) => {
    if (!answerId || !user) return;
    try {
      await questionService.voteAnswer(answerId, 'up', user.uid);
    } catch (error) {
      console.error('Error upvoting answer:', error);
    }
  };

  const handleMarkAsHelpful = async (answerId, currentStatus) => {
    if (!answerId) return;
    try {
      await questionService.updateAnswer(answerId, { isHelpful: !currentStatus });
    } catch (error) {
      console.error('Error marking answer as helpful:', error);
    }
  };

  const handleDeleteAnswer = async (answerId) => {
    if (!answerId) return;
    try {
      await questionService.deleteAnswer(answerId);
    } catch (error) {
      console.error('Error deleting answer:', error);
    }
  };

  const toggleReplies = (answerId) => {
    setShowReplies(prev => ({
      ...prev,
      [answerId]: !prev[answerId]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Answers ({answers.length})</h2>
      </div>

      <div className="space-y-4">
        {answers.map(ans => (
          <div key={ans.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">
                    {ans.author.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{ans.author}</div>
                  <div className="text-sm text-gray-500">{ans.badge}</div>
                </div>
              </div>
              {ans.isHelpful && (
                <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  ✓ Helpful
                </span>
              )}
            </div>

            <div className="prose prose-sm max-w-none text-gray-700 mb-4">
              <ReactMarkdown
                children={ans.content}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        children={String(children).replace(/\n$/, '')}
                        style={coldarkDark}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      />
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              />
            </div>

            <div className="flex items-center gap-4 border-t border-gray-100 pt-4">
              <button 
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handleAnswerUpvote(ans.id)}
                disabled={ans.upvotedBy && user && ans.upvotedBy.includes(user.uid)}
              >
                <FiThumbsUp className="w-4 h-4" />
                <span className="font-medium">Upvote</span>
                <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-sm">
                  {ans.upvotes || 0}
                </span>
              </button>

              <button 
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => handleMarkAsHelpful(ans.id, ans.isHelpful)}
              >
                <span className="font-medium">
                  {ans.isHelpful ? 'Unmark as Helpful' : 'Mark as Helpful'}
                </span>
              </button>

              <button 
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => toggleReplies(ans.id)}
              >
                <FiMessageSquare className="w-4 h-4" />
                <span className="font-medium">Reply</span>
              </button>

              {user && (ans.userId === user.uid || ans.author === user.email || ans.authorEmail === user.email) && (
                <button 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  onClick={() => handleDeleteAnswer(ans.id)}
                >
                  <FiTrash2 className="w-4 h-4" />
                  <span className="font-medium">Delete</span>
                </button>
              )}
            </div>

            {showReplies[ans.id] && (
              <ReplySection answerId={ans.id} />
            )}
          </div>
        ))}
      </div>

      {user && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Your Answer</h3>
          <form onSubmit={handleSubmitAnswer}>
            <textarea
              placeholder="Write your answer here..."
              className="w-full border border-gray-200 rounded-lg p-4 mb-4 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              value={newAnswerContent}
              onChange={(e) => setNewAnswerContent(e.target.value)}
              rows="6"
            />
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Submit Answer
            </button>
          </form>
        </div>
      )}
    </div>
  );
}