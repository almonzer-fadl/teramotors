'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PrintEstimateDocument from './PrintEstimateDocument';

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
      // Add print styles to head when modal opens
      const printStyles = document.createElement('style');
      printStyles.id = 'print-estimate-modal-styles';
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
          .print-estimate-container {
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
        const existingStyles = document.getElementById('print-estimate-modal-styles');
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
          <title>Estimate Print</title>
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

            .print-estimate-container {
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

            .print-estimate-container {
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

            .estimate-title {
              font-size: 20px;
              font-weight: 600;
              color: #000;
              margin: 15px 0 0 0;
              text-align: center;
              font-family: "Cairo", sans-serif;
            }

            .estimate-info {
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

            .services-table, .parts-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              font-size: 14px;
            }

            .services-table th, .parts-table th {
              background: #1e3a8a;
              color: white;
              padding: 12px 8px;
              text-align: right;
              font-weight: 600;
              font-family: "Cairo", sans-serif;
            }

            .services-table td, .parts-table td {
              padding: 10px 8px;
              border-bottom: 1px solid #e5e7eb;
              text-align: right;
              font-family: "Cairo", sans-serif;
            }

            .services-table tr:nth-child(even), .parts-table tr:nth-child(even) {
              background-color: #f8f9fa;
            }

            .totals {
              margin-top: 30px;
              text-align: left;
            }

            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #e5e7eb;
              font-family: "Cairo", sans-serif;
            }

            .grand-total {
              font-weight: 700;
              font-size: 18px;
              color: #000;
              border-top: 2px solid #000;
              margin-top: 10px;
              padding-top: 10px;
              font-family: "Cairo", sans-serif;
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

            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 500;
              font-family: "Cairo", sans-serif;
            }

            .status-pending {
              background-color: #fef3c7;
              color: #92400e;
            }

            .status-approved {
              background-color: #d1fae5;
              color: #065f46;
            }

            .status-rejected {
              background-color: #fee2e2;
              color: #991b1b;
            }

            @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }

              @page {
                margin: 10mm;
                size: A4 portrait;
              }

              body {
                margin: 0;
                background: white;
              }
              .print-estimate-container {
                padding: 0;
                width: 100%;
                min-height: auto;
                max-height: none;
                margin: 0;
                box-shadow: none;
                background: white;
                font-size: 11px;
                overflow: visible;
                line-height: 1.4;
              }
              .page-break { page-break-before: always; }

              /* Compact spacing for print */
              .header {
                page-break-inside: avoid;
                page-break-after: avoid;
                padding: 8px 0;
                margin-bottom: 10px;
              }

              .estimate-title {
                page-break-inside: avoid;
                page-break-after: avoid;
                margin: 8px 0 0 0;
              }

              .estimate-note {
                page-break-inside: avoid;
                page-break-after: auto;
                margin: 6px 0;
                padding: 6px;
                font-size: 12px;
              }

              .estimate-info {
                gap: 10px;
                margin-bottom: 10px;
              }

              .info-section h3 {
                font-size: 14px;
                margin-bottom: 6px;
                padding-bottom: 2px;
              }

              .info-section p {
                margin: 2px 0;
                font-size: 12px;
              }

              .services-table, .parts-table {
                margin: 8px 0;
                font-size: 11px;
              }

              .services-table th, .parts-table th {
                padding: 6px 4px;
                font-size: 11px;
              }

              .services-table td, .parts-table td {
                padding: 4px 4px;
                font-size: 11px;
              }

              .totals {
                margin-top: 10px;
              }

              .total-row {
                padding: 3px 0;
                font-size: 12px;
              }

              .grand-total {
                font-size: 14px;
                margin-top: 4px;
                padding-top: 4px;
              }

              .notes {
                margin-top: 10px;
                padding: 8px;
                font-size: 11px;
              }

              .notes h3 {
                font-size: 12px;
                margin-bottom: 4px;
              }

              .footer {
                margin-top: 15px;
                font-size: 10px;
              }

              /* Ensure info sections don't push tables to next page */
              .estimate-info {
                page-break-inside: auto;
                page-break-after: avoid !important;
              }

              .info-section {
                page-break-inside: avoid;
                page-break-after: auto;
              }

              .info-section:last-child {
                page-break-after: avoid !important;
                margin-bottom: 5px !important;
              }

              /* FORCE tables to start on same page - NEVER break before */
              .services-table, .parts-table {
                page-break-inside: auto !important;
                page-break-before: avoid !important;
                page-break-after: auto !important;
                break-inside: auto !important;
                break-before: avoid-page !important;
                break-after: auto !important;
                margin-top: 0 !important;
              }

              .services-table tr, .parts-table tr {
                page-break-inside: avoid !important;
                page-break-after: auto !important;
                page-break-before: auto !important;
                break-inside: avoid-page !important;
                break-after: auto !important;
                break-before: auto !important;
              }

              .services-table tbody tr, .parts-table tbody tr {
                orphans: 1;
                widows: 1;
              }

              .services-table thead, .parts-table thead {
                display: table-header-group;
                page-break-after: avoid !important;
              }

              .notes {
                page-break-inside: avoid;
                page-break-before: auto;
              }

              /* Allow totals to flow and fill page */
              .totals {
                page-break-inside: auto !important;
                page-break-before: auto !important;
                break-inside: auto !important;
                break-before: auto !important;
              }

              .total-row {
                page-break-inside: avoid;
                page-break-after: auto;
              }

              /* Minimize orphans and widows - allow more breaks */
              p, li {
                orphans: 1;
                widows: 1;
              }

              h3 {
                orphans: 2;
                widows: 2;
                page-break-after: avoid;
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

              .services-table th, .parts-table th {
                background: #1e3a8a !important;
                color: white !important;
              }

              /* Status badge colors */
              .status-pending {
                background-color: #fef3c7 !important;
                color: #92400e !important;
              }

              .status-approved {
                background-color: #d1fae5 !important;
                color: #065f46 !important;
              }

              .status-rejected {
                background-color: #fee2e2 !important;
                color: #991b1b !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-estimate-container">
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
            <div className="print-content">
              <PrintEstimateDocument
                estimate={estimate}
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

export default PrintEstimateModal;
