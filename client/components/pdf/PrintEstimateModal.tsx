'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PrintEstimateDocument from './PrintEstimateDocument';
import { PRINT_ESTIMATE_STYLES } from './printEstimateStyles';

interface PrintEstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  estimate: any;
  jobCard?: any;
  language?: string;
}

const PrintEstimateModal = ({
  isOpen,
  onClose,
  estimate,
  jobCard,
  language = 'ar'
}: PrintEstimateModalProps) => {
  const isRTL = true; // Force Arabic RTL layout
  const { t } = useTranslation('common');
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const printStyles = document.createElement('style');
      printStyles.id = 'print-estimate-modal-styles';
      printStyles.textContent = `
        @media print {
          body * { visibility: hidden; }
          .print-content, .print-content * { visibility: visible; }
          .print-content { position: absolute; left: 0; top: 0; width: 100%; height: auto; }
          .print-actions { display: none !important; }
        }
      `;
      document.head.appendChild(printStyles);

      return () => {
        const existingStyles = document.getElementById('print-estimate-modal-styles');
        if (existingStyles) {
          existingStyles.remove();
        }
      };
    }
  }, [isOpen]);

  const handlePrint = () => {
    setIsPrinting(true);
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      const printContent = document.querySelector('.print-content')?.innerHTML;

      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Estimate Print</title>
          <style>
            html, body {
              margin: 0;
              padding: 0;
              background: #fff;
            }
            @page {
              size: A4;
              margin: 12mm;
            }
            .print-wrapper {
              display: flex;
              justify-content: center;
              padding: 12mm;
              background: #fff;
            }
            .print-wrapper > * {
              box-shadow: none !important;
            }
            ${PRINT_ESTIMATE_STYLES}
          </style>
        </head>
        <body>
          <div class="print-wrapper">
            ${printContent || ''}
          </div>
        </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
        setIsPrinting(false);
      };
    } else {
      setIsPrinting(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              طباعة التقدير
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="print-preview">
              <div className="print-preview-page">
                <div className="print-content">
                  <PrintEstimateDocument
                    estimate={estimate}
                    jobCard={jobCard}
                    language={language}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="print-actions flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              إلغاء
            </button>
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPrinting ? 'جاري الطباعة...' : 'طباعة'}
            </button>
          </div>
        </div>
      </div>
      <style jsx>{`
        .print-preview {
          display: flex;
          justify-content: center;
          padding: 1.5rem;
          background: #f7f7f5;
        }
        .print-preview-page {
          width: 210mm;
          min-height: 297mm;
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
          display: flex;
          justify-content: center;
          border: none;
        }
        .print-content {
          width: 100%;
          display: flex;
          justify-content: center;
          padding: 6mm;
        }
        .print-content > :global(.print-estimate-container) {
          width: 100%;
          min-height: 285mm;
        }
      `}</style>
    </div>
  );
};

export default PrintEstimateModal;
