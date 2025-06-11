"use client"
import { useState } from 'react';
import { useAuth } from '@/src/context/authContext';
import { questionService } from '@/src/services/questionService';
import { FiThumbsUp, FiTrash2, FiMessageSquare } from 'react-icons/fi';
import ReplySection from './ReplySection';
import { useRouter } from 'next/navigation';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Link from 'next/link'
import { format } from 'date-fns'

export default function AnswerSection({ answers, requestId }) {
  const { user } = useAuth();
  const [newAnswerContent, setNewAnswerContent] = useState('');
  const [showReplies, setShowReplies] = useState({});
  const router = useRouter();

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
                <div 
                  className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => ans.userId && router.push(`/profile/${ans.userId}`)}
                >
                  <span className="text-blue-600 font-semibold text-sm">
                    {ans.author.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <Link href={`/profile/${ans.userId}`} className="font-medium text-blue-700 hover:underline">{ans.author}</Link>
                  <div className="text-sm text-gray-500">{ans.badge}</div>
                  <div className="text-sm text-gray-500">
                    {ans.createdAt ? format(ans.createdAt.toDate ? ans.createdAt.toDate() : ans.createdAt, 'PPpp') : ''}
                  </div>
                </div>
              </div>
            </div>

            <div className="prose prose-sm max-w-none text-gray-700 mb-4">
              {/* Syntax highlighting for code blocks in answer content */}
              {(() => {
                const codeBlockMatch = ans.content && ans.content.match(/```(\w+)?\n([\s\S]*?)```/);
                if (codeBlockMatch) {
                  const lang = codeBlockMatch[1] || 'plaintext';
                  const code = codeBlockMatch[2];
                  return (
                    <SyntaxHighlighter language={lang} style={oneDark} customStyle={{ borderRadius: '0.5rem', fontSize: 15 }}>
                      {code}
                    </SyntaxHighlighter>
                  );
                } else {
                  return ans.content;
                }
              })()}
            </div>

            <div className="flex items-center gap-4 border-t border-gray-100 pt-4">
              <button 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${ans.upvotedBy && user && ans.upvotedBy.includes(user.uid) ? 'bg-blue-100 text-blue-700' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                onClick={() => handleAnswerUpvote(ans.id)}
              >
                <FiThumbsUp className="w-4 h-4" />
                <span className="font-medium">Upvote</span>
                <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-sm">
                  {ans.upvotes || 0}
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