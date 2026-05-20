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

  const handlePrint = () => {
    setIsPrinting(true);
    
    // Create a hidden iframe for printing
    let iframe = document.getElementById('print-iframe') as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'print-iframe';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    }

    const printContent = document.querySelector('.print-content')?.innerHTML;
    const iframeDoc = iframe.contentWindow?.document;

    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html dir="${isRTL ? 'rtl' : 'ltr'}" lang="${language}">
          <head>
            <meta charset="UTF-8" />
            <title>Invoice Print</title>
            <style>
              @page { size: A4; margin: 10mm; }
              * { box-sizing: border-box; }
              body {
                margin: 0;
                padding: 0;
                background: #fff;
                font-family: 'Cairo', 'Noto Sans Arabic', 'Segoe UI', Tahoma, sans-serif;
              }
              /* Add any additional styles needed for the print document here */
              img { max-width: 100%; }
            </style>
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
          </head>
          <body>
            ${printContent || ''}
            <script>
              // Wait for all images and resources to load before printing
              window.onload = () => {
                window.focus();
                window.print();
                // We don't remove the iframe immediately to allow the print dialog to finish
              };
            </script>
          </body>
        </html>
      `);
      iframeDoc.close();
      
      // Reset isPrinting state after a delay (approximate time for print dialog to appear)
      setTimeout(() => {
        setIsPrinting(false);
      }, 1000);
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
