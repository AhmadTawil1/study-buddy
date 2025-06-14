'use client'
import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/src/firebase/firebase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signInWithGoogle, signInWithGithub, signInWithMicrosoft } from '@/src/context/authContext'
import { useTheme } from '@/src/context/themeContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { colors, mode } = useTheme();

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
    <div className="min-h-screen flex items-center justify-center p-4 transition-colors duration-300" style={{ background: colors.page, color: colors.text }}>
      <div className="max-w-md w-full p-8 rounded-xl shadow-xl" style={{ background: colors.card, color: colors.text, borderColor: colors.inputBorder }}>
        <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: colors.text }}>Sign In</h2>
        {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            style={{ background: colors.inputBg, color: colors.text, borderColor: colors.inputBorder }}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            style={{ background: colors.inputBg, color: colors.text, borderColor: colors.inputBorder }}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full py-3 rounded-lg font-semibold transition-colors"
            style={{ background: colors.button, color: colors.buttonSecondaryText }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
          <span className="mx-4 text-gray-500 dark:text-gray-400" style={{ color: colors.inputPlaceholder }}>or</span>
          <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
        </div>
        <div className="flex flex-col gap-2 mt-6">
          <button
            type="button"
            className="w-full py-2 rounded-lg font-semibold border flex items-center justify-center gap-2 transition-colors"
            style={{ background: colors.inputBg, color: colors.text, borderColor: colors.inputBorder }}
            onClick={signInWithGoogle}
          >
            <img src="/google.svg" alt="Google" className="h-5 w-5" /> Sign in with Google
          </button>
          <button
            type="button"
            className="w-full py-2 rounded-lg font-semibold border flex items-center justify-center gap-2 transition-colors"
            style={{ background: colors.inputBg, color: colors.text, borderColor: colors.inputBorder }}
            onClick={signInWithGithub}
          >
            <img src="/github.svg" alt="GitHub" className="h-5 w-5" /> Sign in with GitHub
          </button>
          <button
            type="button"
            className="w-full py-2 rounded-lg font-semibold border flex items-center justify-center gap-2 transition-colors"
            style={{ background: colors.inputBg, color: colors.text, borderColor: colors.inputBorder }}
            onClick={signInWithMicrosoft}
          >
            <img src="/microsoft.svg" alt="Microsoft" className="h-5 w-5" /> Sign in with Microsoft
          </button>
        </div>
        <div className="mt-6 text-center">
          <Link href="/forgot-password" className="text-blue-600 hover:underline" style={{ color: colors.button }}>Forgot password?</Link>
        </div>
        <div className="mt-2 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-blue-600 hover:underline" style={{ color: colors.button }}>Register</Link>
        </div>
      </div>
    </div>
  )
}
