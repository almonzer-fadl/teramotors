'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import EstimateForm from '@/components/forms/EstimateForm';

export default function EditEstimatePage() {
  const { t } = useTranslation('common');
  const params = useParams();
  const router = useRouter();
  const [estimateId, setEstimateId] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      setEstimateId(params.id as string);
    }
  }, [params.id]);

  if (!estimateId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-lg text-gray-700">{t('estimates.loading_estimate')}</p>
          </div>
        </div>
      </div>
    );
  }

  return <EstimateForm estimateId={estimateId} />;
}