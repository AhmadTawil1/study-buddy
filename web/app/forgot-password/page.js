// Forgot Password Page Route: /forgot-password
// Purpose: Allows users to request a password reset email.
// Theme: Uses Tailwind for styling, light mode only by default.
// Features: Email input, error/success messages, link to login.

'use client'
import { useState } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/src/firebase/firebase'
import Link from 'next/link'
import { useTheme } from '@/src/context/themeContext'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { colors, mode } = useTheme();

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent! Check your inbox.');
      setEmail(''); // Clear the email field
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 transition-colors duration-300" style={{ background: colors.page, color: colors.text }}>
      <div className="max-w-md w-full p-8 rounded-xl shadow-xl" style={{ background: colors.card, color: colors.text, borderColor: colors.inputBorder }}>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2" style={{ color: colors.text }}>Forgot Password</h2>
          <p style={{ color: colors.inputPlaceholder }}>Enter your email address to receive a password reset link.</p>
        </div>

        {message && (
          <div className="mb-4 text-green-500 text-center fade-in">{message}</div>
        )}

        {error && (
          <div className="mb-4 text-red-500 text-center fade-in">{error}</div>
        )}

        <form onSubmit={handlePasswordReset} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
              Email
            </label>
            <input
              id="email"
              className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              style={{ background: colors.inputBg, color: colors.text, borderColor: colors.inputBorder }}
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ background: colors.button, color: colors.buttonSecondaryText }}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm" style={{ color: colors.inputPlaceholder }}>
            Remember your password?{' '}
            <Link href="/login" className="text-blue-600 hover:underline" style={{ color: colors.button }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 