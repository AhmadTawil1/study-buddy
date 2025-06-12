"use client"
import { useState, useEffect } from 'react';
import { useAuth } from '@/src/context/authContext';
import { questionService } from '@/src/services/questionService';
import { FiThumbsUp, FiTrash2, FiMessageSquare } from 'react-icons/fi';
import ReplySection from './ReplySection';
import { useRouter } from 'next/navigation';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Link from 'next/link'
import { format } from 'date-fns'
import { useTheme } from '@/src/context/themeContext';

export default function AnswerSection({ answers, requestId }) {
  const { user } = useAuth();
  const [newAnswerContent, setNewAnswerContent] = useState('');
  const [showReplies, setShowReplies] = useState({});
  const [aiAnswer, setAiAnswer] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const router = useRouter();
  const { colors } = useTheme();

  // Fetch AI answer if not present
  useEffect(() => {
    const hasAI = answers.some(ans => ans.author === 'AI Assistant');
    if (!hasAI && requestId) {
      const fetchAI = async () => {
        setAiLoading(true);
        try {
          // Fetch question details for AI
          const res = await fetch(`/api/ai-answer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: window?.questionTitleAndDescription || '' })
          });
          const data = await res.json();
          setAiAnswer({
            id: 'ai',
            author: 'AI Assistant',
            badge: 'AI Assistant',
            content: data.answer,
            createdAt: new Date(),
            upvotes: 0,
            upvotedBy: [],
            userId: null
          });
        } catch (e) {
          setAiAnswer(null);
        }
        setAiLoading(false);
      };
      fetchAI();
    }
  }, [answers, requestId]);

  // Helper to combine AI answer and user answers
  const allAnswers = aiAnswer ? [aiAnswer, ...answers] : answers;

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
    <div className="space-y-6" style={{ color: colors.text }}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold" style={{ color: colors.text }}>Answers (<span style={{ color: colors.button }}>{answers.length}</span>)</h2>
      </div>

      <div className="space-y-4">
        {aiLoading && (
          <div className="rounded-lg shadow-sm border p-6" style={{ background: colors.card, borderColor: colors.inputBorder, color: colors.inputPlaceholder }}>
            Generating AI answer...
          </div>
        )}
        {allAnswers.map(ans => (
          <div
            key={ans.id}
            className={`rounded-lg shadow-sm border p-6 ${ans.author === 'AI Assistant' ? 'bg-blue-100 dark:bg-gray-800' : ''}`}
            style={{
              background: ans.author === 'AI Assistant'
                ? (colors.mode === 'dark' ? undefined : '#e5ecf6')
                : colors.card,
              borderColor: colors.inputBorder,
              color: ans.author === 'AI Assistant' ? (colors.mode === 'dark' ? '#fff' : '#22304a') : colors.text
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity bg-blue-200 dark:bg-gray-700"
                  onClick={() => ans.userId && router.push(`/profile/${ans.userId}`)}
                >
                  <span className="font-semibold text-sm text-blue-600 dark:text-blue-400">
                    {ans.author.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  {ans.author === 'AI Assistant' ? (
                    <div className="flex items-center gap-2 font-medium text-blue-600 dark:text-blue-400">
                      <span>{ans.author}</span>
                      <span className="bg-blue-600 text-white dark:bg-blue-500 dark:text-white rounded-md px-2 py-0.5 text-xs font-semibold flex items-center">
                        🤖 AI
                      </span>
                    </div>
                  ) : (
                    <Link href={`/profile/${ans.userId}`} className="font-medium hover:underline text-blue-600 dark:text-blue-400">{ans.author}</Link>
                  )}
                  <div className="text-sm text-gray-500 dark:text-gray-400">{ans.badge}</div>
                  <div className="text-sm text-gray-400 dark:text-gray-500">
                    {ans.createdAt ? format(ans.createdAt.toDate ? ans.createdAt.toDate() : ans.createdAt, 'PPpp') : ''}
                  </div>
                </div>
              </div>
            </div>

            <div className="prose prose-sm max-w-none mb-4 text-gray-800 dark:text-gray-100" style={{ color: ans.author === 'AI Assistant' ? (colors.mode === 'dark' ? '#fff' : '#22304a') : colors.text }}>
              {/* Syntax highlighting for code blocks in answer content */}
              {(() => {
                const codeBlockMatch = ans.content && ans.content.match(/```(\w+)?\n([\s\S]*?)```/);
                if (codeBlockMatch) {
                  const lang = codeBlockMatch[1] || 'plaintext';
                  const code = codeBlockMatch[2];
                  return (
                    <SyntaxHighlighter language={lang} style={oneDark} customStyle={{ borderRadius: '0.5rem', fontSize: 15, color: colors.text }}>
                      {code}
                    </SyntaxHighlighter>
                  );
                } else {
                  return <span className="text-gray-800 dark:text-gray-100">{ans.content}</span>;
                }
              })()}
            </div>

            <div className="flex items-center gap-4 border-t pt-4" style={{ borderColor: colors.inputBorder }}>
              <button 
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 border dark:border-gray-600"
                style={{ background: ans.upvotedBy && user && ans.upvotedBy.includes(user.uid) ? (colors.mode === 'dark' ? '#1e293b' : '#bfdbfe') : undefined, color: ans.upvotedBy && user && ans.upvotedBy.includes(user.uid) ? colors.button : undefined }}
                onClick={() => handleAnswerUpvote(ans.id)}
              >
                <FiThumbsUp className="w-4 h-4" />
                <span className="font-medium">Upvote</span>
                <span className="px-2 py-0.5 rounded-full text-sm bg-gray-300 text-blue-600 dark:bg-gray-800 dark:text-blue-400">
                  {ans.upvotes || 0}
                </span>
              </button>

              <button 
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 border dark:border-gray-600"
                onClick={() => toggleReplies(ans.id)}
              >
                <FiMessageSquare className="w-4 h-4" />
                <span className="font-medium">Reply</span>
              </button>

              {user && (ans.userId === user.uid || ans.author === user.email || ans.authorEmail === user.email) && (
                <button 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors"
                  style={{ background: colors.mode === 'dark' ? '#7f1d1d' : '#fee2e2', color: colors.mode === 'dark' ? '#f87171' : '#b91c1c' }}
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
        <div className="rounded-lg shadow-sm border p-6" style={{ background: colors.card, borderColor: colors.inputBorder }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text }}>Add Your Answer</h3>
          <form onSubmit={handleSubmitAnswer}>
            <textarea
              placeholder="Write your answer here..."
              className="w-full border rounded-lg p-4 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              style={{ color: colors.text, background: colors.inputBg, borderColor: colors.inputBorder }}
              value={newAnswerContent}
              onChange={(e) => setNewAnswerContent(e.target.value)}
              rows="6"
            />
            <button 
              type="submit" 
              className="px-6 py-2.5 rounded-lg font-medium transition-colors"
              style={{ background: colors.button, color: colors.buttonSecondaryText }}
            >
              <span style={{ color: colors.buttonSecondaryText }}>Submit Answer</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}