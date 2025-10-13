'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PrintInvoiceDocument from './PrintInvoiceDocument';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any;
  jobCard?: any;
  qrCodeData?: string;
  language?: string;
}

const PrintModal = ({ 
  isOpen, 
  onClose, 
  invoice, 
  jobCard, 
  qrCodeData, 
  language = 'ar' 
}: PrintModalProps) => {
  const isRTL = true; // Force Arabic RTL layout
  const { t } = useTranslation('common');
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Add print styles to head when modal opens
      const printStyles = document.createElement('style');
      printStyles.id = 'print-modal-styles';
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
          .print-invoice-container {
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
        const existingStyles = document.getElementById('print-modal-styles');
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
          <title>Invoice Print</title>
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
            
            .print-invoice-container {
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
            
            .header {
              text-align: right;
              border-bottom: 3px solid #F13F33;
              padding-bottom: 20px;
              margin-bottom: 30px;
              position: relative;
            }
            
            .company-name {
              font-size: 28px;
              font-weight: 700;
              color: #F13F33;
              margin: 0;
              font-family: "Cairo", sans-serif;
            }
            
            .invoice-title {
              font-size: 24px;
              font-weight: 600;
              color: #333;
              margin: 10px 0;
              font-family: "Cairo", sans-serif;
            }
            
            .qr-code {
              position: absolute;
              top: 0;
              left: 0;
              width: 120px;
              height: 120px;
              text-align: center;
              background: white;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 10px;
            }
            
            .qr-code img {
              width: 100px;
              height: 100px;
              border-radius: 4px;
            }
            
            .qr-label {
              font-size: 10px;
              color: #666;
              margin-top: 5px;
              font-family: "Cairo", sans-serif;
            }
            
            .invoice-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin-bottom: 30px;
            }
            
            .info-section h3 {
              font-size: 18px;
              font-weight: 600;
              color: #F13F33;
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
              background: #F13F33;
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
              color: #F13F33;
              border-top: 2px solid #F13F33;
              margin-top: 10px;
              padding-top: 10px;
              font-family: "Cairo", sans-serif;
            }
            
            .notes {
              margin-top: 30px;
              padding: 20px;
              background: #f8f9fa;
              border-radius: 8px;
              border-right: 4px solid #F13F33;
            }
            
            .notes h3 {
              font-family: "Cairo", sans-serif;
              font-weight: 600;
              color: #F13F33;
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
            
            .status-paid {
              background-color: #d1fae5;
              color: #065f46;
            }
            
            .status-cancelled {
              background-color: #fee2e2;
              color: #991b1b;
            }
            
            @media print {
              body { margin: 0; padding: 0; }
              .container { padding: 0; }
              .print-invoice-container { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="print-invoice-container">
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
              طباعة الفاتورة
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
              <PrintInvoiceDocument
                invoice={invoice}
                jobCard={jobCard}
                qrCodeData={qrCodeData}
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

export default PrintModal;
