'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function VerifyEmailComponent() {
  const params = useSearchParams()
  const token = params.get('token') || ''
  const [status, setStatus] = useState<'pending'|'success'|'error'>('pending')

  useEffect(() => {
    async function run() {
      if (!token) { setStatus('error'); return }
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
      setStatus(res.ok ? 'success' : 'error')
    }
    run()
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white shadow rounded-lg p-6 text-center space-y-4">
        {status === 'pending' && <p className="text-gray-700">Verifying your email...</p>}
        {status === 'success' && (
          <>
            <p className="text-green-700">Email verified successfully.</p>
            <Link href="/login" className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-700">Go to login</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <p className="text-red-700">Invalid or expired verification link.</p>
            <Link href="/dashboard" className="inline-flex justify-center rounded-md bg-gray-600 px-4 py-2 text-white text-sm font-medium hover:bg-gray-700">Home</Link>
          </>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailComponent />
    </Suspense>
  )
}