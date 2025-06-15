'use client'
import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/context/authContext'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/src/firebase/firebase'
import formatDate from '@/src/utils/formatDate'
import QuestionOverview from '@/src/features/requests/QuestionOverview'
import FullDescription from '@/src/features/requests/FullDescription'
import AnswerSection from '@/src/features/requests/AnswerSection'
import Sidebar from '@/src/components/common/Sidebar'
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { requestService } from '@/src/services/requestService';
import { questionService } from '@/src/services/questionService';
import { FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import Card from '@/src/components/common/Card'
import { useTheme } from '@/src/context/themeContext';
import SidePanel from '@/src/features/requests/SidePanel';
import Link from 'next/link';

function AISuggestions({ question, description }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const { colors } = useTheme();

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, description })
      });
      const data = await res.json();
      setSuggestions(data.suggestions || []);
      setHasGenerated(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
    setLoading(false);
  };

  return (
    <Card className="p-6" bgColor={colors.card}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold" style={{ color: colors.text }}>AI Suggested Videos & Resources</h2>
        <button
          onClick={fetchSuggestions}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
          style={{ background: colors.button, color: colors.buttonSecondaryText }}
        >
          {hasGenerated ? 'Regenerate' : 'Generate'} <FiArrowRight className="w-4 h-4" />
        </button>
      </div>
      {loading && <div style={{ color: colors.inputPlaceholder }}>Loading suggestions...</div>}
      {!loading && hasGenerated && suggestions.length === 0 && (
        <div style={{ color: colors.inputPlaceholder }}>No suggestions found</div>
      )}
      {!loading && suggestions.length > 0 && (
        <div className="space-y-3">
          {suggestions.map((s, i) => (
            <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-lg transition" style={{ background: colors.inputBg, color: colors.text }}>
              <div className="font-semibold text-sm" style={{ color: colors.button }}>{s.title}</div>
              <div className="text-xs" style={{ color: colors.inputPlaceholder }}>{s.description}</div>
              <div className="text-xs mt-1 truncate" style={{ color: colors.button }}>{s.url}</div>
            </a>
          ))}
        </div>
      )}
    </Card>
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
  const [isSavedByCurrentUser, setIsSavedByCurrentUser] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && !loading && id) {
      console.log('[RequestDetails] User is authenticated and ID is available.');
       // Real-time listener for the request
       const ref = doc(db, 'requests', id);
       const unsubRequest = onSnapshot(ref, async (snap) => {
         if (!snap.exists()) {
           setError('Request not found');
           setRequest(null);
         } else {
           const requestData = snap.data();
           setRequest({
             id: snap.id,
             ...requestData,
             createdAtFormatted: requestData.createdAt ? requestService.formatTimestampWithHour(requestData.createdAt) : null,
             createdAtFullDate: requestData.createdAt ? requestData.createdAt.toDate().toLocaleDateString() : null,
           });
           console.log('[RequestDetails] Main request data set.');
         }
         setRequestLoading(false);
       }, (e) => {
         setError('Failed to load request');
         setRequest(null);
         setRequestLoading(false);
       });

      // Effect to check if the current user has saved this request
      const checkSavedStatus = async () => {
        if (user && id) {
          console.log(`[RequestDetails] Checking saved status (separate effect) for user: ${user.uid}, request: ${id}`);
          const savedRef = doc(db, 'users', user.uid, 'savedQuestions', id);
          const savedSnap = await getDoc(savedRef);
          const isSaved = savedSnap.exists();
          setIsSavedByCurrentUser(isSaved);
          console.log('[RequestDetails] isSavedByCurrentUser set to:', isSaved);
        }
      };
      checkSavedStatus();

      // Real-time listener for answers
      const q = query(collection(db, 'answers'), where('requestId', '==', id));
      const unsubAnswers = onSnapshot(q, (querySnapshot) => {
        const answersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt,
          createdAtFormatted: doc.data().createdAt ? questionService.formatTimestampWithHour(doc.data().createdAt) : null,
          createdAtFullDate: doc.data().createdAt ? doc.data().createdAt.toDate().toLocaleDateString() : null
        }));
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
    return <div className="min-h-screen flex items-center justify-center" style={{ background: colors.page, color: colors.text }}>Loading or redirecting...</div>
  }

  if (requestLoading) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: colors.page, color: colors.text }}>Loading request...</div>
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600" style={{ background: colors.page }}>❌ {error}</div>
  }

  if (!request) {
     return <div className="min-h-screen flex items-center justify-center text-red-600" style={{ background: colors.page }}>Request not found</div>
  }

  // Only ONE return below this line!
  return (
    <div className="min-h-screen py-8 px-2 transition-colors duration-300" style={{ background: colors.page, color: colors.text }}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8">
        {/* Main Content */}
        <div className="flex flex-col gap-8">
          <button
            onClick={() => router.push('/requests')}
            className="flex items-center gap-2 text-sm font-medium mb-2 self-start px-3 py-2 rounded-lg transition-colors"
            style={{ color: colors.button, background: colors.inputBg, border: `1px solid ${colors.inputBorder}` }}
          >
            <FiArrowLeft /> Back to Requests
          </button>
          <Link
            href={`/chat/${id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow transition mb-2 self-start"
          >
            Join Chat
          </Link>
          <Card bgColor={colors.card} className="p-6">
            <QuestionOverview request={{
              ...request,
              author: request.authorName || request.author || user?.email || "Unknown",
              isSavedByCurrentUser: isSavedByCurrentUser
            }} />
          </Card>
          <Card bgColor={colors.card} className="p-6">
            <FullDescription 
              description={request.description} 
              files={request.fileURLs || []} 
              aiSummary={request.aiSummary}
              codeSnippet={request.codeSnippet}
              codeLanguage={request.codeLanguage}
              isOwner={user && user.uid === request.userId}
              requestId={request.id}
            />
          </Card>
          <Card bgColor={colors.card} className="p-6">
            <AnswerSection answers={answers} requestId={request.id} questionTitle={request.title} questionDescription={request.description} questionOwnerId={request.userId} />
          </Card>
        </div>
        {/* Sidebar */}
        <Sidebar className="flex flex-col gap-8" style={{ border: '2px solid red', background: 'rgba(255, 0, 0, 0.1)' }}>
          <SidePanel />
          <AISuggestions question={request.title} description={request.description} />
          <Card bgColor={colors.card} className="p-6">
            <h3 style={{ color: colors.text, fontWeight: 600, fontSize: '1.1rem', marginBottom: 12 }}>Related Questions</h3>
            <div style={{ color: colors.inputPlaceholder, fontSize: '0.95rem' }}>
              {/* TODO: Replace with real related questions */}
              <div>No related questions yet.</div>
            </div>
          </Card>
        </Sidebar>
      </div>
    </div>
  )
}