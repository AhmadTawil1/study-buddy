"use client"
import { useState } from 'react';
import { useAuth } from '@/src/context/authContext';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/src/firebase/firebase';

export default function AnswerSection({ answers, requestId }) {
  const { user } = useAuth();
  const [newAnswerContent, setNewAnswerContent] = useState('');

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!newAnswerContent.trim() || !user) return;

    try {
      await addDoc(collection(db, 'answers'), {
        requestId: requestId,
        author: user.displayName || user.email,
        badge: 'Contributor',
        content: newAnswerContent,
        upvotes: 0,
        createdAt: serverTimestamp(),
      });
      setNewAnswerContent('');
    } catch (error) {
      console.error('Error adding answer:', error);
    }
  };

  const handleAnswerUpvote = async (answerId) => {
    if (!answerId) return;
    try {
      const answerRef = doc(db, 'answers', answerId);
      await updateDoc(answerRef, {
        upvotes: increment(1)
      });
      // TODO: Optionally, update local state or refetch answers to show the updated count
    } catch (error) {
      console.error('Error upvoting answer:', error);
      // TODO: Show an error message to the user
    }
  };

  const handleMarkAsHelpful = async (answerId) => {
    if (!answerId) return;
    try {
      const answerRef = doc(db, 'answers', answerId);
      await updateDoc(answerRef, {
        isHelpful: true // Set a field to indicate it's helpful
      });
      // TODO: Optionally, update local state to reflect the status
    } catch (error) {
      console.error('Error marking answer as helpful:', error);
      // TODO: Show an error message to the user
    }
  };

  return (
    <div>
      <h2 className="font-semibold text-lg text-gray-800 mb-4">Answers ({answers.length})</h2>
      {answers.map(ans => (
        <div key={ans.id} className="border rounded p-3 mb-3 bg-white">
          <div className="font-semibold text-gray-900">{ans.author} <span className="text-xs text-gray-500">({ans.badge})</span></div>
          <div className="mb-2 text-gray-800">{ans.content}</div>
          <div className="flex gap-2">
            <button className="text-blue-600 font-medium hover:underline" onClick={() => handleAnswerUpvote(ans.id)}>
              Upvote ({ans.upvotes || 0})
            </button>
            <button className="text-blue-600 font-medium hover:underline" onClick={() => handleMarkAsHelpful(ans.id)}>
              Mark as Helpful {ans.isHelpful && '✅'}
            </button>
            <button className="text-blue-600 font-medium hover:underline">Comment</button>
          </div>
        </div>
      ))}
      {user && (
        <form className="mt-4" onSubmit={handleSubmitAnswer}>
          <textarea
            placeholder="Add your answer..."
            className="w-full border rounded p-2 mb-2 text-gray-900"
            value={newAnswerContent}
            onChange={(e) => setNewAnswerContent(e.target.value)}
            rows="4"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700">Submit Answer</button>
        </form>
      )}
      {user && (
        <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700">I Can Help</button>
      )}
    </div>
  )
}