'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PrintInvoiceDocument from './PrintInvoiceDocument';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any;
  jobCard?: any;
  language?: string;
}

const PrintModal = ({ 
  isOpen, 
  onClose, 
  invoice, 
  jobCard, 
  language = 'ar' 
}: PrintModalProps) => {
  const isRTL = true; // Force Arabic RTL layout
  const { t } = useTranslation('common');
  const [isPrinting, setIsPrinting] = useState(false);

  const qrSrc = useMemo(() => {
    // First try to get the QR code image if available
    const qrImage = invoice?.zatca?.qrCodeImage;
    if (qrImage) {
      if (typeof qrImage === 'string' && qrImage.startsWith('data:')) return qrImage;
      return `data:image/png;base64,${qrImage}`;
    }
    
    // Fallback to generating QR code from base64 data
    const qr = invoice?.zatca?.qrCode;
    if (!qr) return null;
    if (typeof qr === 'string' && qr.startsWith('data:')) return qr;
    return `data:image/png;base64,${qr}`;
  }, [invoice?.zatca?.qrCodeImage, invoice?.zatca?.qrCode]);

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
            
            .print-invoice-container {
              font-family: 'Cairo', 'Noto Sans Arabic', 'Segoe UI', Tahoma, sans-serif;
              line-height: 1.6;
              color: #333;
              direction: rtl;
              background: white;
              width: 210mm;
              min-height: 297mm;
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

            .invoice-title {
              font-size: 20px;
              font-weight: 600;
              color: #000;
              margin: 15px 0 0 0;
              text-align: center;
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

            .status-paid {
              background-color: #d1fae5;
              color: #065f46;
            }

            .status-cancelled {
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
                margin: 0;
                size: A4 portrait;
              }
              
              body { 
                margin: 0; 
                background: white;
              }
              .print-invoice-container { 
                padding: 8mm;
                width: 210mm;
                min-height: auto;
                max-height: 297mm;
                margin: 0;
                box-shadow: none;
                background: white;
                font-size: 12px;
                overflow: hidden;
              }
              .page-break { page-break-before: always; }
              
              /* Compress layout for single page */
              .header {
                padding: 8px 0;
                margin-bottom: 10px;
              }
              
              .logo-container {
                padding: 12px;
              }
              
              .company-name {
                font-size: 18px;
              }
              
              .invoice-title {
                font-size: 14px;
                margin: 8px 0 0 0;
              }
              
              .invoice-info {
                gap: 10px;
                margin-bottom: 10px;
              }
              
              .info-section h3 {
                font-size: 14px;
                margin-bottom: 8px;
              }
              
              .info-section p {
                margin: 4px 0;
                font-size: 11px;
              }
              
              .services-table, .parts-table {
                margin: 10px 0;
                font-size: 11px;
              }
              
              .services-table th, .parts-table th {
                padding: 8px 6px;
                font-size: 11px;
              }
              
              .services-table td, .parts-table td {
                padding: 6px;
                font-size: 11px;
              }
              
              .totals {
                margin-top: 15px;
              }
              
              .total-row {
                padding: 4px 0;
                font-size: 11px;
              }
              
              .grand-total {
                font-size: 14px;
                margin-top: 5px;
                padding-top: 5px;
              }
              
              .notes {
                margin-top: 15px;
                padding: 10px;
              }
              
              .footer {
                margin-top: 10px;
                font-size: 9px;
                padding-top: 5px;
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
              
              .status-paid {
                background-color: #d1fae5 !important;
                color: #065f46 !important;
              }
              
              .status-cancelled {
                background-color: #fee2e2 !important;
                color: #991b1b !important;
              }
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
                qrCodeData={qrSrc ?? undefined}
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
