'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PrintInspectionDocument from './PrintInspectionDocument';
import { PRINT_INSPECTION_STYLES } from './printInspectionStyles';

interface PrintInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspection: any;
  jobCard?: any;
  language?: string;
}

const PrintInspectionModal = ({
  isOpen,
  onClose,
  inspection,
  jobCard,
  language = 'ar'
}: PrintInspectionModalProps) => {
  const { t } = useTranslation('common');
  const [isPrinting, setIsPrinting] = useState(false);

  const previewTitle = t('inspections.preview_report', { defaultValue: 'معاينة تقرير الفحص' });
  const printLabel = t('inspections.print_report', { defaultValue: 'طباعة التقرير' });
  const cancelLabel = t('forms.cancel', { defaultValue: 'إلغاء' });
  const printingLabel = t('forms.creating', { defaultValue: 'جاري الطباعة...' });

  const handlePrint = () => {
    setIsPrinting(true);
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      const printContent = document.querySelector('.inspection-print-content')?.innerHTML;

      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Inspection Report</title>
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
              }

              .print-wrapper > * {
                box-shadow: none !important;
              }

              ${PRINT_INSPECTION_STYLES}
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
        <div className="fixed inset-0 bg-black/60" onClick={onClose} />

        <div className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{previewTitle}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="inspection-preview">
              <div className="inspection-preview-page">
                <div className="inspection-print-content">
                  <PrintInspectionDocument
                    inspection={inspection}
                    jobCard={jobCard}
                    language={language}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="print-actions flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
            >
              {cancelLabel}
            </button>
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#F97402] to-[#f96206] border border-transparent rounded-md shadow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F97402] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPrinting ? printingLabel : printLabel}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .inspection-preview {
          display: flex;
          justify-content: center;
          padding: 1.5rem;
          background: #f3f4f6;
        }

        .inspection-preview-page {
          width: 210mm;
          min-height: 297mm;
          background: white;
          border-radius: 18px;
          box-shadow: 0 25px 70px rgba(15, 23, 42, 0.15);
          display: flex;
          justify-content: center;
          border: 1px solid rgba(6, 52, 121, 0.06);
        }

        .inspection-print-content {
          width: 100%;
          display: flex;
          justify-content: center;
          padding: 6mm;
        }

        .inspection-print-content > :global(.print-inspection-container) {
          width: 100%;
          min-height: 285mm;
        }
      `}</style>
    </div>
  );
};

export default PrintInspectionModal;
