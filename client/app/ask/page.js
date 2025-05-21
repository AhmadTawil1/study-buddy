'use client'
import AskForm from '@/src/features/ask/AskForm'

export default function AskPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-8">Ask a Question</h1>
      <AskForm />
    </div>
  )
}
