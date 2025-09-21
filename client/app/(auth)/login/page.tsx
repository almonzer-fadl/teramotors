'use client'

import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const result = await signIn('credentials', { email, password, redirect: false })
    setIsLoading(false)
    if (result?.error) {
      setError('Invalid email or password')
    } else {
      window.location.href = '/dashboard'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white shadow rounded-lg p-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">Sign in to your account</h1>
        {error && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input name="email" type="email" required className="w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input name="password" type="password" required className="w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <button type="submit" disabled={isLoading} className="w-full inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <div className="mt-6 flex justify-between text-sm">
          <Link href="/register" className="text-blue-600 hover:text-blue-700">Create account</Link>
          <Link href="/forgot-password" className="text-blue-600 hover:text-blue-700">Forgot password?</Link>
        </div>
      </div>
    </div>
  )
}