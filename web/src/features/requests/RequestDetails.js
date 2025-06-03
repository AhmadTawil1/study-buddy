import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { requestService } from '@/src/services/requestService';

export default function RequestDetails() {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let unsubRequest = null;
    let unsubAnswers = null;
    setLoading(true);

    // Subscribe to the request document
    unsubRequest = requestService.subscribeToRequestById(id, (req) => {
      setRequest(req);
      setLoading(false);
    });

    // Subscribe to the answers for this request
    unsubAnswers = requestService.subscribeToAnswersByRequestId(id, (ans) => {
      setAnswers(ans);
    });

    return () => {
      if (unsubRequest) unsubRequest();
      if (unsubAnswers) unsubAnswers();
    };
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!request) return <div>Request not found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-2">{request.title}</h1>
      <p className="text-gray-700 mb-4">{request.description}</p>
      <div className="mb-6">
        <span className="text-xs text-gray-500">Asked by {request.authorName || 'Unknown'} on {request.createdAt?.toDate ? request.createdAt.toDate().toLocaleString() : ''}</span>
      </div>
      <h2 className="text-xl font-semibold mb-2">Answers ({answers.length})</h2>
      <div className="space-y-4">
        {answers.length === 0 ? (
          <div className="text-gray-500">No answers yet. Be the first to help!</div>
        ) : (
          answers.map(ans => (
            <div key={ans.id} className="border rounded p-3 bg-gray-50 text-sm sm:text-base">
              <div className="font-semibold text-gray-900">{ans.author} <span className="text-xs text-gray-500">({ans.badge})</span></div>
              <div className="mb-2 text-gray-800">{ans.content}</div>
              <div className="flex flex-col sm:flex-row gap-2 text-gray-600">
                <span>Upvotes: {ans.upvotes || 0}</span>
                {ans.isHelpful && <span className="text-green-600 font-semibold">Helpful</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
