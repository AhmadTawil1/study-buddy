"use client"
import { useState, useEffect } from 'react';
import { useAuth } from '@/src/context/authContext';
import { questionService } from '@/src/services/questionService';
import { FiThumbsUp, FiTrash2, FiMessageSquare, FiPaperclip } from 'react-icons/fi';
import ReplySection from '../components/ReplySection';
import { useRouter } from 'next/navigation';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Link from 'next/link'
import { format } from 'date-fns'
import { useTheme } from '@/src/context/themeContext';
import FileUpload from '@/src/components/common/FileUpload';
import { uploadFiles } from '@/src/services/storageService';
import { notificationService } from '@/src/services/notificationService';
import { submitAnswer, submitReply } from '@/src/services/requests/answerService';

export default function AnswerSection({ answers, requestId, questionTitle, questionDescription, questionOwnerId }) {
  const { user } = useAuth();
  const [newAnswerContent, setNewAnswerContent] = useState('');
  const [showReplies, setShowReplies] = useState({});
  const [aiAnswer, setAiAnswer] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { colors } = useTheme();

  // Fetch AI answer if not present
  useEffect(() => {
    const hasAI = answers.some(ans => ans.author === 'AI Assistant');
    if (!hasAI && requestId && questionTitle) {
      const fetchAI = async () => {
        try {
          const res = await fetch(`/api/ai-answer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: `${questionTitle}\n\n${questionDescription || ''}` })
          });
          const data = await res.json();
          await questionService.addAnswer(requestId, {
            author: 'AI Assistant',
            badge: 'AI',
            content: data.answer,
            userId: 'ai-bot',
            requestId: requestId
          });
        } catch (e) {
          console.error('Error generating AI answer:', e);
        }
      };
      fetchAI();
    }
  }, [answers, requestId, questionTitle, questionDescription]);

  // Helper to combine AI answer and user answers
  const allAnswers = answers;

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!newAnswerContent.trim() || !user) return;

    setIsSubmitting(true);
    try {
      let attachments = [];
      if (files.length > 0) {
        const fileDownloadURLs = await uploadFiles(
          files,
          `users/${user.uid}/answers/${requestId}`,
          (index, progress) => {
            const fileName = files[index].name;
            setFiles(prev => prev.map(file => 
              file.name === fileName ? { ...file, uploadProgress: progress } : file
            ));
          }
        );
        attachments = fileDownloadURLs.map((url, index) => ({
          name: files[index].name,
          url
        }));
      }

      await questionService.addAnswer(requestId, {
        author: user.displayName || user.email,
        badge: 'Contributor',
        content: newAnswerContent,
        userId: user.uid,
        attachments
      });
      setNewAnswerContent('');
      setFiles([]);
    } catch (error) {
      console.error('Error adding answer:', error);
    }
    setIsSubmitting(false);
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

  // Stub for sending a chat request
  const sendChatRequest = async (toUserId) => {
    if (!user) return;
    await notificationService.createNotification({
      userId: toUserId,
      type: 'live_chat_request',
      fromUserId: user.uid,
      fromUserName: user.displayName || user.email,
      requestId,
      createdAt: new Date(),
      message: `You have a live chat request from ${user.displayName || user.email}`
    });
    alert('Live chat request sent!');
  };

  return (
    <div className="space-y-6" style={{ color: colors.text }}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold" style={{ color: colors.text }}>Answers (<span style={{ color: colors.button }}>{answers.length}</span>)</h2>
      </div>

      <div className="space-y-4">
        {/* {aiLoading && (
          <div className="rounded-lg shadow-sm border p-6" style={{ background: colors.card, borderColor: colors.inputBorder, color: colors.inputPlaceholder }}>
            Generating AI answer...
          </div>
        )} */}
        {allAnswers.map(ans => (
          <div
            key={ans.id}
            className={`rounded-lg shadow-sm border p-6`}
            style={{
              background: colors.card,
              borderColor: colors.inputBorder,
              color: colors.text
            }}
          >
            <div className="flex items-center gap-3 mb-4">
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

            <div className="mb-4">
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
                  return <span style={{ color: colors.text }}>{ans.content}</span>;
                }
              })()}
            </div>

            {/* Attachments */}
            {ans.attachments && ans.attachments.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2" style={{ color: colors.text }}>Attachments</h4>
                <div className="space-y-2">
                  {ans.attachments.map((attachment, idx) => (
                    <a
                      key={idx}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm hover:underline"
                      style={{ color: colors.button }}
                    >
                      <FiPaperclip className="w-4 h-4" />
                      {attachment.name}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Request Live Chat Button */}
            {user && user.uid !== 'ai-bot' && (
              ((user.uid === questionOwnerId && user.uid !== ans.userId) || (user.uid === ans.userId && user.uid !== questionOwnerId)) && (
                <button
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1 rounded shadow transition mb-2"
                  onClick={() => sendChatRequest(user.uid === questionOwnerId ? ans.userId : questionOwnerId)}
                >
                  Request Live Chat
                </button>
              )
            )}

            <div className="flex items-center gap-2 mt-4">
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

              {user && (ans.userId === user.uid || user.isAdmin) && (
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
            
            {/* File Upload */}
            <div className="mb-4">
              <FileUpload
                files={files}
                onFilesAdd={(newFiles) => setFiles(prev => [...prev, ...newFiles])}
                onFileRemove={(index) => setFiles(prev => prev.filter((_, i) => i !== index))}
                label="Attach Files"
                supportedTypes="Images, PDFs, and documents"
              />
            </div>

            <button 
              type="submit" 
              className="px-6 py-2.5 rounded-lg font-medium transition-colors"
              style={{ background: colors.button, color: colors.buttonSecondaryText }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Answer'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}