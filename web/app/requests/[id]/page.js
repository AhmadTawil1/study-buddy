'use client'
import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/context/authContext'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/src/firebase/firebase'
import formatDate from '@/src/utils/formatDate'
import QuestionOverview from '@/src/components/common/QuestionOverview'
import FullDescription from '@/src/components/common/FullDescription'
import AnswerSection from '@/src/components/common/AnswerSection'
import Sidebar from '@/src/components/common/Sidebar'
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';

function AISuggestions({ question, description }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchSuggestions() {
      setLoading(true);
      const res = await fetch('/api/ai-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, description })
      });
      const data = await res.json();
      setSuggestions(data.suggestions || []);
      setLoading(false);
    }
    if (question && description) fetchSuggestions();
  }, [question, description]);

  if (loading) return <div className="mt-10">Loading AI suggestions...</div>;
  if (!suggestions.length) return null;

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold mb-4">AI Suggested Videos & Resources</h2>
      <div className="space-y-4">
        {suggestions.map((s, i) => (
          <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
            <div className="font-semibold text-blue-800">{s.title}</div>
            <div className="text-gray-700 text-sm">{s.description}</div>
            <div className="text-blue-600 text-xs mt-1">{s.url}</div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default function RequestDetails({ params }) {
  const { id } = use(params)
  const { user, loading } = useAuth()
  const router = useRouter()
  const [request, setRequest] = useState(null)
  const [requestLoading, setRequestLoading] = useState(true)
  const [error, setError] = useState(null)
  const [answers, setAnswers] = useState([])
  const [answersLoading, setAnswersLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && !loading && id) {
      // Real-time listener for the request
      const ref = doc(db, 'requests', id);
      const unsubRequest = onSnapshot(ref, (snap) => {
        if (!snap.exists()) {
          setError('Request not found');
          setRequest(null);
        } else {
          setRequest({ id: snap.id, ...snap.data(), createdAt: snap.data().createdAt?.toDate() });
        }
        setRequestLoading(false);
      }, (e) => {
        setError('Failed to load request');
        setRequest(null);
        setRequestLoading(false);
      });

      // Real-time listener for answers
      const q = query(collection(db, 'answers'), where('requestId', '==', id));
      const unsubAnswers = onSnapshot(q, (querySnapshot) => {
        const answersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate() }));
        setAnswers(answersData);
        setAnswersLoading(false);
      });

      return () => {
        unsubRequest();
        unsubAnswers();
      };
    }
  }, [user, loading, id]);

  if (loading || !user) {
    return <div className="min-h-screen py-12 px-4 text-center">Loading or redirecting...</div>
  }

  if (requestLoading) {
    return <div className="min-h-screen py-12 px-4 text-center">Loading request...</div>
  }

  if (error) {
    return <div className="min-h-screen py-12 px-4 text-center text-red-600">❌ {error}</div>
  }

  if (!request) {
     return <div className="min-h-screen py-12 px-4 text-center text-red-600">Request not found</div>
  }

  // Only ONE return below this line!
  return (
    <div className="flex gap-8 items-start max-w-6xl mx-auto py-12 px-4">
      <div className="flex-1">
        <a href="/requests" className="text-blue-600 hover:underline mb-4 block">← Back to Requests</a>
        <QuestionOverview request={{
          ...request,
          author: request.author || "Jane Doe",
          timeAgo: formatDate(request.createdAt)
        }} />
        <FullDescription description={request.description} files={request.fileURLs || []} aiSummary={request.aiSummary} />
        <AnswerSection answers={answers} requestId={request.id} />
        <AISuggestions question={request.title} description={request.description} />
      </div>
      <div className="w-80">
        <Sidebar relatedQuestions={[]} aiSuggestions="Consider clarifying if you need social login or just email/password." />
      </div>
    </div>
  )
}