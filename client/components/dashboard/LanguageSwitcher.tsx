'use client'

import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng).then(() => {
      window.location.reload();
    });
  }

  return (
    <div className="flex items-center gap-x-2">
      <Globe className="h-4 w-4 text-gray-500" />
      <select
        onChange={(e) => changeLanguage(e.target.value)}
        value={i18n.language}
        className="text-sm font-medium text-gray-700 bg-transparent border-none focus:ring-0 cursor-pointer hover:text-[#F13F33] transition-colors"
      >
        <option value="en">English</option>
        <option value="ar">العربية</option>
      </select>
    </div>
  )
}
