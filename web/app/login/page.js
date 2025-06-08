'use client'
import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/src/firebase/firebase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signInWithGoogle, signInWithGithub, signInWithMicrosoft } from '@/src/context/authContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push('/profile')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-gray-600">Sign in to your StudyBuddy account</p>
      </div>

      {/* Social Login Buttons */}
      <div className="flex flex-col gap-3 mb-6">
        <button
          onClick={async () => { setLoading(true); setError(''); try { await signInWithGoogle(); router.push('/profile'); } catch (err) { setError(err.message); } finally { setLoading(false); } }}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={loading}
        >
          <img src="/google.svg" alt="Google" className="h-5 w-5" /> Sign in with Google
        </button>
        <button
          onClick={async () => { setLoading(true); setError(''); try { await signInWithGithub(); router.push('/profile'); } catch (err) { setError(err.message); } finally { setLoading(false); } }}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={loading}
        >
          <img src="/github.svg" alt="GitHub" className="h-5 w-5" /> Sign in with GitHub
        </button>
        <button
          onClick={async () => { setLoading(true); setError(''); try { await signInWithMicrosoft(); router.push('/profile'); } catch (err) { setError(err.message); } finally { setLoading(false); } }}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={loading}
        >
          <img src="/microsoft.svg" alt="Microsoft" className="h-5 w-5" /> Sign in with Microsoft
        </button>
      </div>

      {error && (
        <div className="error-message fade-in">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>
          <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          className={`w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          type="submit"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
