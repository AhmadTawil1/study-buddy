// Signup Page Route: /signup
// Purpose: Registers new users with email/password or social providers.
// Theme: Uses theme context for background, card, and text colors.
// Features: Registration form, password validation, nickname uniqueness, social signup, error handling.

'use client'
import { useState } from 'react'
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/src/firebase/firebase'
import Link from 'next/link'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { signInWithGoogle, signInWithGithub, signInWithMicrosoft } from '@/src/context/authContext'
import { useTheme } from '@/src/context/themeContext'
import { useRouter } from 'next/navigation'

function getPasswordChecks(password) {
  return {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
}

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [nickname, setNickname] = useState('')
  const { colors } = useTheme();
  const passwordChecks = getPasswordChecks(password);
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate passwords match
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        setLoading(false)
        return
      }

      // Validate password strength
      const passwordError = validatePassword(password)
      if (passwordError) {
        setError(passwordError)
        setLoading(false)
        return
      }

      // Check if nickname is unique
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('nickname', '==', nickname));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setError('Nickname already exists. Please choose a different one.');
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Add user info to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        name: name,
        nickname: nickname,
        joinDate: serverTimestamp(),
        role: 'student',
        subjects: [],
        rating: 0,
        totalRatings: 0,
        emailVerified: user.emailVerified || false,
      })
      router.push('/profile');
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const validatePassword = (password) => {
    const minLength = 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    if (password.length < minLength) {
      return 'Password must be at least 8 characters long'
    }
    if (!hasUpperCase) {
      return 'Password must contain at least one uppercase letter'
    }
    if (!hasLowerCase) {
      return 'Password must contain at least one lowercase letter'
    }
    if (!hasNumbers) {
      return 'Password must contain at least one number'
    }
    if (!hasSpecialChar) {
      return 'Password must contain at least one special character'
    }
    return ''
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 transition-colors duration-300" style={{ background: colors.page, color: colors.text }}>
      <div className="max-w-md w-full p-8 rounded-xl shadow-xl" style={{ background: colors.card, color: colors.text, borderColor: colors.inputBorder }}>
        <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: colors.text }}>Register</h2>
        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            style={{ background: colors.inputBg, color: colors.text, borderColor: colors.inputBorder }}
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Nickname"
            className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            style={{ background: colors.inputBg, color: colors.text, borderColor: colors.inputBorder }}
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            required
          />
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
          {/* Password guide/strength indicator */}
          <div className="mb-2 text-xs rounded-lg px-3 py-2" style={{ background: colors.inputBg, border: `1px solid ${colors.inputBorder}` }}>
            <div style={{ color: passwordChecks.length ? '#22c55e' : '#888', display: 'flex', alignItems: 'center', gap: 6 }}>
              {passwordChecks.length ? '✓' : '○'} <span>At least 8 characters</span>
            </div>
            <div style={{ color: passwordChecks.upper ? '#22c55e' : '#888', display: 'flex', alignItems: 'center', gap: 6 }}>
              {passwordChecks.upper ? '✓' : '○'} <span>At least one uppercase letter</span>
            </div>
            <div style={{ color: passwordChecks.lower ? '#22c55e' : '#888', display: 'flex', alignItems: 'center', gap: 6 }}>
              {passwordChecks.lower ? '✓' : '○'} <span>At least one lowercase letter</span>
            </div>
            <div style={{ color: passwordChecks.number ? '#22c55e' : '#888', display: 'flex', alignItems: 'center', gap: 6 }}>
              {passwordChecks.number ? '✓' : '○'} <span>At least one number</span>
            </div>
            <div style={{ color: passwordChecks.special ? '#22c55e' : '#888', display: 'flex', alignItems: 'center', gap: 6 }}>
              {passwordChecks.special ? '✓' : '○'} <span>At least one special character</span>
            </div>
          </div>
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            style={{ background: colors.inputBg, color: colors.text, borderColor: colors.inputBorder }}
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
          {error && <div className="mb-2 text-red-500 text-center">{error}</div>}
          <button
            type="submit"
            className="w-full py-3 rounded-lg font-semibold transition-colors"
            style={{ background: colors.button, color: colors.buttonSecondaryText }}
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" style={{ borderColor: colors.inputBorder }}></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2" style={{ background: colors.card, color: colors.text }}>or</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            className="w-full py-2 rounded-lg font-semibold border flex items-center justify-center gap-2 transition-colors"
            style={{ background: colors.inputBg, color: colors.text, borderColor: colors.inputBorder }}
            onClick={signInWithGoogle}
          >
            <img src="/google.svg" alt="Google" className="h-5 w-5" /> Sign up with Google
          </button>
          <button
            type="button"
            className="w-full py-2 rounded-lg font-semibold border flex items-center justify-center gap-2 transition-colors"
            style={{ background: colors.inputBg, color: colors.text, borderColor: colors.inputBorder }}
            onClick={signInWithGithub}
          >
            <img src="/github.svg" alt="GitHub" className="h-5 w-5" /> Sign up with GitHub
          </button>
          <button
            type="button"
            className="w-full py-2 rounded-lg font-semibold border flex items-center justify-center gap-2 transition-colors"
            style={{ background: colors.inputBg, color: colors.text, borderColor: colors.inputBorder }}
            onClick={signInWithMicrosoft}
          >
            <img src="/microsoft.svg" alt="Microsoft" className="h-5 w-5" /> Sign up with Microsoft
          </button>
        </div>
        <div className="mt-6 text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline" style={{ color: colors.button }}>Sign In</Link>
        </div>
      </div>
    </div>
  )
}
