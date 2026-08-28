'use client';

import { useState, useEffect } from 'react';
import { X, Printer, ChevronRight, ChevronLeft } from 'lucide-react';
import PrintInspectionDocument from './PrintInspectionDocument';
import PrintEstimateDocument from './PrintEstimateDocument';
import PrintInvoiceDocument from './PrintInvoiceDocument';
import { getInvoicePrintCSS, getEstimatePrintCSS, getInspectionPrintCSS } from './printStyles';

interface PrintAllReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspection: any;
  estimate: any;
  invoice: any;
  jobCard?: any;
  language?: string;
}

type DocumentType = 'inspection' | 'estimate' | 'invoice';

const PrintAllReportsModal = ({
  isOpen,
  onClose,
  inspection,
  estimate,
  invoice,
  jobCard,
  language = 'ar'
}: PrintAllReportsModalProps) => {
  const [isPrinting, setIsPrinting] = useState<string | null>(null);
  const [activeDocument, setActiveDocument] = useState<DocumentType>('inspection');

  // Compute QR code data for invoice
  const qrCodeData = invoice?.zatca?.qrCodeImage
    ? (typeof invoice.zatca.qrCodeImage === 'string' && invoice.zatca.qrCodeImage.startsWith('data:')
        ? invoice.zatca.qrCodeImage
        : `data:image/png;base64,${invoice.zatca.qrCodeImage}`)
    : (invoice?.zatca?.qrCode
        ? (typeof invoice.zatca.qrCode === 'string' && invoice.zatca.qrCode.startsWith('data:')
            ? invoice.zatca.qrCode
            : `data:image/png;base64,${invoice.zatca.qrCode}`)
        : undefined);

  const documents = [
    {
      type: 'inspection' as DocumentType,
      title: 'تقرير الفحص',
      color: 'from-blue-600 to-blue-500',
      component: <PrintInspectionDocument inspection={inspection} jobCard={jobCard} language={language} />
    },
    {
      type: 'estimate' as DocumentType,
      title: 'التقدير',
      color: 'from-green-600 to-green-500',
      component: <PrintEstimateDocument estimate={estimate} language={language} />
    },
    {
      type: 'invoice' as DocumentType,
      title: 'الفاتورة',
      color: 'from-red-600 to-red-500',
      component: <PrintInvoiceDocument invoice={invoice} jobCard={jobCard} qrCodeData={qrCodeData} language={language} />
    }
  ];

  const activeDoc = documents.find(d => d.type === activeDocument)!;
  const otherDocs = documents.filter(d => d.type !== activeDocument);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handlePrint = () => {
    setIsPrinting(activeDocument);

    const contentSelector = `.print-${activeDocument}-content`;
    const printContent = document.querySelector(contentSelector)?.innerHTML;

    if (!printContent) {
      setIsPrinting(null);
      return;
    }

    // Create a hidden iframe for printing
    let iframe = document.getElementById('print-iframe') as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'print-iframe';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    }

    const iframeDoc = iframe.contentWindow?.document;
    if (iframeDoc) {
      let title = 'Print';
      let containerClass = 'print-container';
      let cssContent = '';

      if (activeDocument === 'inspection') {
        title = 'Inspection Report Print';
        containerClass = 'print-inspection-container';
        cssContent = getInspectionPrintCSS();
      } else if (activeDocument === 'estimate') {
        title = 'Estimate Print';
        containerClass = 'print-estimate-container';
        cssContent = getEstimatePrintCSS();
      } else if (activeDocument === 'invoice') {
        title = 'Invoice Print';
        containerClass = 'print-invoice-container';
        cssContent = getInvoicePrintCSS();
      }

      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <style>
            ${cssContent}
          </style>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
        </head>
        <body>
          <div class="${containerClass}">
            ${printContent}
          </div>
          <script>
            window.onload = () => {
              window.focus();
              window.print();
            };
          </script>
        </body>
        </html>
      `);
      iframeDoc.close();
      
      setTimeout(() => {
        setIsPrinting(null);
      }, 1000);
    } else {
      setIsPrinting(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Main Content - Card Carousel */}
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div className="relative w-full h-full max-w-7xl flex items-center gap-6">

          {/* Main Card (Center) */}
          <div className="flex-1 h-full flex flex-col animate-fadeInScale">
            {/* Main Card Header */}
            <div className={`bg-gradient-to-r ${activeDoc.color} text-white px-6 py-4 rounded-t-2xl shadow-2xl flex items-center justify-between`}>
              <h3 className="font-bold text-2xl">{activeDoc.title}</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  disabled={isPrinting === activeDocument}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200 disabled:opacity-50"
                >
                  <Printer className="w-5 h-5" />
                  {isPrinting === activeDocument ? 'جاري الطباعة...' : 'طباعة'}
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 hover:rotate-90"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Main Card Content */}
            <div className="flex-1 bg-white rounded-b-2xl shadow-2xl overflow-y-auto p-8">
              <div className={`print-${activeDocument}-content`}>
                {activeDoc.component}
              </div>
            </div>
          </div>

          {/* Side Stack (Right) */}
          <div className="w-80 h-full flex flex-col gap-4 justify-center">
            {otherDocs.map((doc, index) => (
              <button
                key={doc.type}
                onClick={() => setActiveDocument(doc.type)}
                className="group relative h-48 bg-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden hover:scale-105 animate-slideInRight"
                style={{
                  animationDelay: `${0.2 + index * 0.1}s`
                }}
              >
                {/* Card Header Preview */}
                <div className={`bg-gradient-to-r ${doc.color} text-white px-4 py-3 flex items-center justify-between`}>
                  <h4 className="font-bold text-lg">{doc.title}</h4>
                  <ChevronLeft className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>

                {/* Card Content Preview */}
                <div className="p-4 text-right">
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300 flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 text-gray-700 font-bold text-lg transition-opacity duration-300">
                    اضغط للعرض
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fadeInScale {
          animation: fadeInScale 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-slideInRight {
          opacity: 0;
          animation: slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Hide scrollbar for Chrome, Safari and Opera */
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
};

export default PrintAllReportsModal;
