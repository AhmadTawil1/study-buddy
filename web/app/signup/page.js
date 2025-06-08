'use client'
import { useState } from 'react'
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/src/firebase/firebase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { signInWithGoogle, signInWithGithub, signInWithMicrosoft } from '@/src/context/authContext'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [nickname, setNickname] = useState('')
  const [signupComplete, setSignupComplete] = useState(false)

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

      // Send email verification
      await sendEmailVerification(user);

      // Add user info to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        name: name,
        nickname: nickname,
        joinDate: serverTimestamp(),
        role: 'student', // Default role
        bio: '',
        subjects: [],
        rating: 0,
        totalRatings: 0,
        emailVerified: user.emailVerified || false, // Store email verification status
      })

      // Set signupComplete to true to show the success message
      setSignupComplete(true);

      // Instead of redirecting, we'll show a message prompting email verification.
      // router.push('/profile');

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
        <p className="text-gray-600">Join StudyBuddy and start learning together</p>
      </div>

      {/* Show success message after signup */}
      {signupComplete ? (
        <div className="text-center text-green-600 mb-4 fade-in">
          <p className="font-semibold">Successfully created account!</p>
          <p>Please check your email to verify your address before signing in.</p>
        </div>
      ) : (
        <>
          {error && (
            <div className="error-message fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
                Nickname (must be unique)
              </label>
              <input
                id="nickname"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                type="text"
                placeholder="Choose a unique nickname"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                required
              />
            </div>

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
                placeholder="Create a password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {/* Social Signup Buttons */}
            <div className="flex flex-col gap-3 mb-6">
              <button
                onClick={async () => { setLoading(true); setError(''); try { await signInWithGoogle(); router.push('/profile'); } catch (err) { setError(err.message); } finally { setLoading(false); } }}
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                <img src="/google.svg" alt="Google" className="h-5 w-5" /> Sign up with Google
              </button>
              <button
                onClick={async () => { setLoading(true); setError(''); try { await signInWithGithub(); router.push('/profile'); } catch (err) { setError(err.message); } finally { setLoading(false); } }}
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                <img src="/github.svg" alt="GitHub" className="h-5 w-5" /> Sign up with GitHub
              </button>
              <button
                onClick={async () => { setLoading(true); setError(''); try { await signInWithMicrosoft(); router.push('/profile'); } catch (err) { setError(err.message); } finally { setLoading(false); } }}
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                <img src="/microsoft.svg" alt="Microsoft" className="h-5 w-5" /> Sign up with Microsoft
              </button>
            </div>

            <button
              className={`w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </>
      )}

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
