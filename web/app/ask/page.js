'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/context/authContext'
import AskForm from '@/src/features/ask/AskForm'

export default function AskPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading || !user) {
    return <div className="min-h-screen bg-slate-50 py-12 px-4 text-center">Loading or redirecting...</div>
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-8">Ask a Question</h1>
      <AskForm />
    </div>
  )
}
