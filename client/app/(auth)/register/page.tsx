'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

export default function RegisterPage() {
  const { t } = useTranslation('common');
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    setIsLoading(false)
    if (response.ok) {
      setSuccess(true)
    } else {
      const data = await response.json().catch(() => ({} as any))
      setError(data?.error || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white shadow rounded-lg p-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">{t('auth.create_your_account')}</h1>
        {success ? (
          <div className="space-y-4">
            <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded p-3">{t('auth.account_created')}</div>
            <Link href="/login" className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-700">{t('auth.go_to_login')}</Link>
          </div>
        ) : (
          <>
            {error && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
                <input name="email" type="email" required className="w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label>
                <input name="password" type="password" required minLength={8} className="w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <button type="submit" disabled={isLoading} className="w-full inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                {isLoading ? t('auth.creating_account') : t('auth.create_account')}
              </button>
            </form>
            <div className="mt-6 text-sm">
              <Link href="/login" className="text-blue-600 hover:text-blue-700">{t('auth.already_have_account')}</Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}