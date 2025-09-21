'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ResetPasswordComponent() {
  const params = useSearchParams()
  const token = params.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    // could validate token existence here
  }, [token])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8 || password !== confirm) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })
      if (res.ok) setDone(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white shadow rounded-lg p-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-4">Reset Password</h1>
        {done ? (
          <div className="space-y-4">
            <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded p-3">Your password has been reset.</div>
            <Link href="/login" className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-700">Go to login</Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input type="password" required minLength={8} value={confirm} onChange={e => setConfirm(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <button disabled={submitting || password !== confirm} className="w-full inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {submitting ? 'Saving...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordComponent />
    </Suspense>
  )
}