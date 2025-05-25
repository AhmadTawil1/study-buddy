// src/features/requests/RequestFeed.js
'use client'
import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '@/src/firebase/firebase'
import Link from 'next/link'
import formatDate from '@/src/utils/formatDate'

export default function RequestFeed() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'requests'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setRequests(data)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse h-24 bg-gray-200 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {requests.map((req) => (
        <div key={req.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-500">{formatDate(req.createdAt?.toDate())}</span>
            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">{req.subject}</span>
          </div>
          <h3 className="text-lg font-semibold text-blue-700 mb-2">{req.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-3">{req.description}</p>
          <Link href={`/requests/${req.id}`} className="mt-4 inline-block text-sm text-blue-600 hover:underline">
            View Details →
          </Link>
        </div>
      ))}
    </div>
  )
}
