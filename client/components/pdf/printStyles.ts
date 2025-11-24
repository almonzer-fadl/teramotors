// Complete print CSS templates from existing modals

export const getInvoicePrintCSS = () => `
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
    border-top: 2px solid #000;
    padding-top: 15px;
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
      margin: 15mm;
      size: A4 portrait;
    }

    body {
      margin: 0;
      background: white;
    }
    .print-invoice-container {
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

    /* Allow tables to break across pages */
    .services-table, .parts-table {
      page-break-inside: auto;
    }

    .services-table tr, .parts-table tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }

    .services-table thead, .parts-table thead {
      display: table-header-group;
    }

    /* Prevent breaking inside these elements */
    .header, .invoice-info, .info-section {
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
`;

export const getEstimatePrintCSS = () => getInvoicePrintCSS().replace(/print-invoice-container/g, 'print-estimate-container').replace(/invoice-title/g, 'estimate-title').replace(/invoice-info/g, 'estimate-info');

export const getInspectionPrintCSS = () => getInvoicePrintCSS().replace(/print-invoice-container/g, 'print-inspection-container').replace(/invoice-title/g, 'inspection-title').replace(/invoice-info/g, 'inspection-info');
