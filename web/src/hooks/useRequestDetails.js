import { useEffect, useState } from 'react';
import { requestService } from '@/src/services/requests/requestService';
import { subscribeToAnswersByRequestId } from '@/src/services/requests/answerService';

export default function useRequestDetails(user, id) {
  const [request, setRequest] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let unsubRequest = null;
    let unsubAnswers = null;
    setLoading(true);

    unsubRequest = requestService.subscribeToRequestById(id, (req) => {
      setRequest(req);
      setLoading(false);
    });

    unsubAnswers = subscribeToAnswersByRequestId(id, (ans) => {
      setAnswers(ans);
    });

    return () => {
      if (unsubRequest) unsubRequest();
      if (unsubAnswers) unsubAnswers();
    };
  }, [id]);

  return { request, answers, loading };
} 