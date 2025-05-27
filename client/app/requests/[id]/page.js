'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/context/authContext'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/src/firebase/firebase'
import formatDate from '@/src/utils/formatDate'

export default function RequestDetails({ params }) {
  const { id } = params
  const { user, loading } = useAuth()
  const router = useRouter()
  const [request, setRequest] = useState(null)
  const [requestLoading, setRequestLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && !loading && id) { // Fetch data only if user is logged in and id is available
      const fetchRequest = async () => {
        setRequestLoading(true)
        setError(null)
        try {
          const ref = doc(db, 'requests', id)
          const snap = await getDoc(ref)

          if (!snap.exists()) {
            setError('Request not found')
            setRequest(null)
          } else {
            setRequest({ id: snap.id, ...snap.data(), createdAt: snap.data().createdAt?.toDate() })
          }
        } catch (e) {
          console.error('Error fetching request:', e)
          setError('Failed to load request')
          setRequest(null)
        } finally {
          setRequestLoading(false)
        }
      }

      fetchRequest()
    }
  }, [user, loading, id]) // Depend on user, loading, and id

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

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 bg-white rounded-xl shadow-md mt-10 border border-gray-100">
      <p className="text-sm text-gray-500 mb-2">Posted: {formatDate(request.createdAt)}</p>
      <h1 className="text-2xl font-bold text-blue-800 mb-4">{request.title}</h1>
      <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 text-sm rounded-full mb-6">
        {request.subject}
      </span>
      <div className="text-gray-800 leading-relaxed whitespace-pre-line">{request.description}</div>
    </div>
  )
}
