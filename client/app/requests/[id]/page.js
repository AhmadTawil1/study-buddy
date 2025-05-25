// app/requests/[id]/page.js
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/src/firebase/firebase'
import formatDate from '@/src/utils/formatDate'

export default async function RequestDetails({ params }) {
  const { id } = params
  const ref = doc(db, 'requests', id)
  const snap = await getDoc(ref)

  if (!snap.exists()) {
    return <div className="text-center text-red-600 mt-20">❌ Request not found</div>
  }

  const request = snap.data()

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 bg-white rounded-xl shadow-md mt-10 border border-gray-100">
      <p className="text-sm text-gray-500 mb-2">Posted: {formatDate(request.createdAt?.toDate())}</p>
      <h1 className="text-2xl font-bold text-blue-800 mb-4">{request.title}</h1>
      <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 text-sm rounded-full mb-6">
        {request.subject}
      </span>
      <div className="text-gray-800 leading-relaxed whitespace-pre-line">{request.description}</div>
    </div>
  )
}
