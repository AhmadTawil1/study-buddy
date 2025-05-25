// src/features/profile/ProfileView.js
'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/src/context/authContext'
import { db } from '@/src/firebase/firebase'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import formatDate from '@/src/utils/formatDate'

export default function ProfileView() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [myQuestions, setMyQuestions] = useState([])

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)
      const q = query(collection(db, 'requests'), where('userId', '==', user.uid))
      const reqSnap = await getDocs(q)

      setProfile(userSnap.data())
      setMyQuestions(reqSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    }

    fetchData()
  }, [user])

  if (!user || !profile) return <p>Loading...</p>

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded shadow">
      <h2 className="text-2xl font-bold text-blue-700 mb-2">{profile.name}</h2>
      <p className="text-sm text-gray-600 mb-4">Joined: {formatDate(profile.joinDate?.toDate())}</p>

      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-2">My Questions</h3>
        <ul className="space-y-2 text-sm text-gray-800">
          {myQuestions.length === 0 ? (
            <li className="text-gray-500">No questions asked yet.</li>
          ) : (
            myQuestions.map(q => <li key={q.id}>• {q.title}</li>)
          )}
        </ul>
      </div>
    </div>
  )
}
