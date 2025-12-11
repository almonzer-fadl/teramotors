'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { Wrench, ArrowLeft, Mail, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const { t } = useTranslation('common');
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      if (res.ok) setSent(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#063479] to-[#052a5f] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#F13F33]/20 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-full blur-3xl"></div>
      
      <div className="relative w-full max-w-md">
        {/* Back Button */}
        <Link 
          href="/login" 
          className="absolute -top-16 left-0 flex items-center text-white/80 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 me-2 group-hover:-translate-x-1 transition-transform" />
          {t('auth.back_to_login')}
        </Link>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-[#F13F33] to-[#d6352a] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Mail className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{t('auth.forgot_your_password')}</h1>
            <p className="text-gray-600 text-base">{t('auth.forgot_password_prompt')}</p>
          </div>

          {sent ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-green-700 bg-green-50/90 border border-green-200 rounded-2xl p-4 text-sm backdrop-blur-sm">
                  {t('auth.reset_link_sent')}
                </div>
              </div>
              <Link 
                href="/login" 
                className="w-full bg-gradient-to-r from-[#F13F33] to-[#d6352a] text-white py-4 px-6 rounded-2xl font-semibold hover:shadow-xl hover:shadow-[#F13F33]/25 transition-all duration-300 flex items-center justify-center hover:-translate-y-0.5"
              >
                {t('auth.back_to_login')}
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={onSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    {t('auth.email')}
                  </label>
                  <div className="relative">
                    <input 
                      type="email" 
                      required 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#F13F33]/20 focus:border-[#F13F33] transition-all duration-300 text-gray-900 placeholder-gray-500 bg-white/80 backdrop-blur-sm" 
                      placeholder={t('ui.enter_your_email_address')}
                    />
                  </div>
                </div>
                
                <button 
                  disabled={submitting} 
                  className="w-full bg-gradient-to-r from-[#F13F33] to-[#d6352a] text-white py-4 px-6 rounded-2xl font-semibold hover:shadow-xl hover:shadow-[#F13F33]/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center hover:-translate-y-0.5"
                >
                  {submitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white me-2"></div>
                      {t('auth.sending')}
                    </div>
                  ) : (
                    t('auth.send_reset_link')
                  )}
                </button>
              </form>
              
              <div className="mt-8 text-center">
                <Link 
                  href="/login" 
                  className="text-[#063479] hover:text-[#F13F33] font-semibold text-sm transition-colors duration-300"
                >
                  {t('auth.back_to_login')}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}


