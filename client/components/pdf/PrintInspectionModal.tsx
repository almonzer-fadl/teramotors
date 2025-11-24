'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PrintInspectionDocument from './PrintInspectionDocument';

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
  const isRTL = true; // Force Arabic RTL layout
  const { t } = useTranslation('common');
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Add print styles to head when modal opens
      const printStyles = document.createElement('style');
      printStyles.id = 'print-inspection-modal-styles';
      printStyles.textContent = `
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content, .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
          }
          .print-actions {
            display: none !important;
          }
          .print-inspection-container {
            visibility: visible !important;
            position: static !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `;
      document.head.appendChild(printStyles);

      return () => {
        const existingStyles = document.getElementById('print-inspection-modal-styles');
        if (existingStyles) {
          existingStyles.remove();
        }
      };
    }
  }, [isOpen]);

  const handlePrint = () => {
    setIsPrinting(true);

    // Create a new window for printing to avoid modal conflicts
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      const printContent = document.querySelector('.print-content')?.innerHTML;

      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Inspection Report Print</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap');
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap');

            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: 'Cairo', 'Noto Sans Arabic', 'Segoe UI', Tahoma, sans-serif;
              line-height: 1.6;
              color: #333;
              direction: rtl;
              background: white;
              padding: 20px;
            }

            .print-inspection-container {
              font-family: 'Cairo', 'Noto Sans Arabic', 'Segoe UI', Tahoma, sans-serif;
              line-height: 1.6;
              color: #333;
              direction: rtl;
              background: white;
              max-width: 100%;
              margin: 0 auto;
              padding: 20px;
            }

            .container {
              max-width: 100%;
              margin: 0 auto;
              padding: 20px;
            }

            .print-inspection-container {
              font-family: 'Cairo', 'Noto Sans Arabic', 'Segoe UI', Tahoma, sans-serif;
              line-height: 1.6;
              color: #333;
              direction: rtl;
              background: white;
              width: 210mm;
              margin: 0 auto;
              padding: 20mm;
              box-sizing: border-box;
            }

            .header {
              display: flex;
              align-items: center;
              justify-content: center;
              border-bottom: 2px solid #000;
              padding: 20px 0;
              margin-bottom: 30px;
              position: relative;
            }

            .logo-container {
              display: flex;
              align-items: center;
              flex-direction: column;
              background: linear-gradient(to right, #063479, #052a5f);
              border-radius: 12px;
              padding: 20px;
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }

            .logo-image {
              width: 48px;
              height: 48px;
              border-radius: 12px;
              object-fit: contain;
              background: white;
              padding: 4px;
              margin-bottom: 8px;
            }

            .company-name {
              font-size: 24px;
              font-weight: 800;
              color: white;
              margin: 0;
              letter-spacing: 0.04em;
              text-shadow: 0 1px 2px rgba(0,0,0,0.1);
            }

            .company-name .highlight {
              color: #F13F33;
            }

            .company-subtitle {
              font-size: 10px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.15em;
              color: white;
              background: rgba(0, 0, 0, 0.4);
              border-radius: 4px;
              padding: 2px 8px;
              margin-top: 4px;
            }

            .company-details {
              position: absolute;
              right: 20px;
              top: 50%;
              transform: translateY(-50%);
              text-align: right;
              color: #000;
              font-size: 14px;
              line-height: 1.6;
            }

            .inspection-title {
              font-size: 20px;
              font-weight: 600;
              color: #000;
              margin: 15px 0 0 0;
              text-align: center;
              font-family: "Cairo", sans-serif;
            }

            .inspection-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin-bottom: 30px;
            }

            .info-section h3 {
              font-size: 18px;
              font-weight: 600;
              color: #000;
              margin-bottom: 15px;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 5px;
              font-family: "Cairo", sans-serif;
            }

            .info-section p {
              margin: 8px 0;
              color: #666;
              font-family: "Cairo", sans-serif;
            }

            .inspection-items {
              margin: 20px 0;
            }

            .category-section {
              margin-bottom: 30px;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              overflow: hidden;
              page-break-inside: avoid;
            }

            .category-header {
              background: linear-gradient(to right, #1e3a8a, #1e40af);
              color: white;
              padding: 12px 16px;
              font-size: 16px;
              font-weight: 600;
              font-family: "Cairo", sans-serif;
            }

            .category-items {
              padding: 0;
            }

            .inspection-item {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 12px 16px;
              border-bottom: 1px solid #e5e7eb;
              background: white;
            }

            .inspection-item:nth-child(even) {
              background: #f9fafb;
            }

            .inspection-item:last-child {
              border-bottom: none;
            }

            .item-name {
              font-family: "Cairo", sans-serif;
              font-size: 14px;
              color: #374151;
              font-weight: 500;
              flex: 1;
            }

            .condition-indicators {
              display: flex;
              gap: 12px;
              align-items: center;
            }

            .condition-circle {
              width: 20px;
              height: 20px;
              border: 2px solid #d1d5db;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
            }

            .condition-circle.selected.good {
              background: #22c55e;
              border-color: #16a34a;
            }

            .condition-circle.selected.fair {
              background: #eab308;
              border-color: #ca8a04;
            }

            .condition-circle.selected.poor {
              background: #ef4444;
              border-color: #dc2626;
            }

            .condition-circle.selected::after {
              content: '';
              width: 10px;
              height: 10px;
              background: white;
              border-radius: 50%;
            }

            .condition-label {
              font-family: "Cairo", sans-serif;
              font-size: 11px;
              color: #6b7280;
              margin-top: 4px;
            }

            .notes {
              margin-top: 30px;
              padding: 20px;
              background: #f8f9fa;
              border-radius: 8px;
              border-right: 4px solid #000;
            }

            .notes h3 {
              font-family: "Cairo", sans-serif;
              font-weight: 600;
              color: #000;
              margin-bottom: 10px;
            }

            .notes p {
              font-family: "Cairo", sans-serif;
              color: #666;
            }

            .footer {
              margin-top: 40px;
              text-align: center;
              color: #666;
              font-size: 12px;
              font-family: "Cairo", sans-serif;
            }

            @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }

              @page {
                margin: 15mm;
                size: A4 portrait;
              }

              body {
                margin: 0;
                background: white;
              }
              .print-inspection-container {
                padding: 0;
                width: 100%;
                min-height: auto;
                max-height: none;
                margin: 0;
                box-shadow: none;
                background: white;
                font-size: 12px;
                overflow: visible;
              }
              .page-break { page-break-before: always; }

              /* Prevent breaking inside category sections */
              .category-section {
                page-break-inside: avoid;
              }

              /* Prevent breaking inside these elements */
              .header, .inspection-info, .info-section {
                page-break-inside: avoid;
              }

              .notes {
                page-break-inside: avoid;
              }

              /* Keep colors in print */
              .logo-container {
                background: linear-gradient(to right, #063479, #052a5f) !important;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important;
              }

              .company-name {
                color: white !important;
              }

              .company-name .highlight {
                color: #F13F33 !important;
              }

              .company-subtitle {
                color: white !important;
                background: rgba(0, 0, 0, 0.4) !important;
              }

              .category-header {
                background: linear-gradient(to right, #1e3a8a, #1e40af) !important;
                color: white !important;
              }

              .condition-circle.selected.good {
                background: #22c55e !important;
                border-color: #16a34a !important;
              }

              .condition-circle.selected.fair {
                background: #eab308 !important;
                border-color: #ca8a04 !important;
              }

              .condition-circle.selected.poor {
                background: #ef4444 !important;
                border-color: #dc2626 !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-inspection-container">
            ${printContent || ''}
          </div>
        </body>
        </html>
      `);

      printWindow.document.close();

      // Wait for content to load then print
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
              طباعة تقرير الفحص
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
            <div className="print-content">
              <PrintInspectionDocument
                inspection={inspection}
                jobCard={jobCard}
                language={language}
              />
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
    </div>
  );
};

export default PrintInspectionModal;
