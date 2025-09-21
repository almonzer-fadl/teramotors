'use client'

import { useTranslation } from 'react-i18next'
import { Languages } from 'lucide-react'

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  return (
    <div className="flex items-center gap-x-2">
      <Languages className="h-5 w-5 text-gray-500" />
      <select
        onChange={(e) => changeLanguage(e.target.value)}
        value={i18n.language}
        className="text-sm text-gray-500 bg-transparent border-none focus:ring-0"
      >
        <option value="en">English</option>
        <option value="ar">العربية</option>
      </select>
    </div>
  )
}
