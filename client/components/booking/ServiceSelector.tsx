'use client';

import { useState } from 'react';
import type { IService } from '@/lib/models/Service';

interface ServiceSelectorProps {
  services: IService[];
  onSelect: (serviceId: string) => void;
  language?: 'ar' | 'en';
}

export function ServiceSelector({ services, onSelect, language = 'en' }: ServiceSelectorProps) {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const isArabic = language === 'ar';

  const handleSelect = (serviceId: string) => {
    setSelectedService(serviceId);
  };

  const handleContinue = () => {
    if (selectedService) {
      onSelect(selectedService);
    }
  };

  // Group services by category
  const groupedServices = services.reduce((acc, service) => {
    const category = service.category || (isArabic ? 'عام' : 'General');
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(service);
    return acc;
  }, {} as Record<string, IService[]>);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">
        {isArabic ? 'اختر الخدمة' : 'Select Service'}
      </h2>

      <div className="space-y-6">
        {Object.entries(groupedServices).map(([category, categoryServices]) => (
          <div key={category}>
            <h3 className="text-lg font-medium text-gray-700 mb-3">{category}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryServices.map((service) => (
                <button
                  key={service._id?.toString()}
                  onClick={() => handleSelect(service._id?.toString() || '')}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedService === service._id?.toString()
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-lg">{service.name}</h4>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedService === service._id?.toString()
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedService === service._id?.toString() && (
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </div>

                  {service.description && (
                    <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    {service.estimatedDuration && (
                      <span className="text-gray-600">
                        {isArabic ? 'المدة: ' : 'Duration: '}
                        <span className="font-medium">
                          {service.estimatedDuration} {isArabic ? 'دقيقة' : 'min'}
                        </span>
                      </span>
                    )}
                    {service.laborRate && (
                      <span className="text-gray-900 font-semibold">
                        {service.laborRate} {isArabic ? 'ريال' : 'SAR'}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleContinue}
          disabled={!selectedService}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          {isArabic ? 'التالي' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
