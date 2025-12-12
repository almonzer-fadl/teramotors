export const PRINT_INVOICE_STYLES = `
  :root {
    --invoice-orange: #F97402;
    --invoice-navy: #063479;
    --invoice-muted: #FFF8F1;
    --invoice-border: #FAD8B0;
    --invoice-note: rgba(6, 52, 121, 0.06);
    --invoice-bg: #ffffff;
  }

  .print-invoice-container {
    font-family: 'Cairo', 'Noto Sans Arabic', 'TheSans', 'Segoe UI', Tahoma, sans-serif;
    line-height: 1.4;
    color: #1f2937;
    direction: rtl;
    background: var(--invoice-bg);
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    padding: 10mm;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 12px;
    font-size: 10pt;
  }

  .print-invoice-container.ltr {
    direction: ltr;
    font-family: 'TheSans', 'Segoe UI', Tahoma, sans-serif;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(0,0,0,0.08);
    padding-bottom: 8px;
    margin-bottom: 6px;
  }

  .logo-container {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .logo-image {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    object-fit: contain;
  }

  .company-name {
    font-size: 22px;
    font-weight: 800;
    color: var(--invoice-navy);
    margin: 0;
    line-height: 1.1;
  }

  .company-name .highlight {
    color: var(--invoice-orange);
  }

  .company-subtitle {
    font-size: 11px;
    color: #6b7280;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .company-details {
    text-align: right;
    font-size: 11px;
    color: #4b5563;
  }

  .print-invoice-container.ltr .company-details {
    text-align: left;
  }

  .company-details div {
    margin-bottom: 2px;
  }

  .document-title {
    text-align: center;
    margin-bottom: 8px;
  }

  .document-title h1 {
    font-size: 26px;
    font-weight: 800;
    color: var(--invoice-orange);
    margin: 0;
  }

  .document-title p {
    color: #6b7280;
    margin: 2px 0 0 0;
    font-size: 12px;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
  }

  .info-card {
    background: #fff;
    border-radius: 12px;
    border: 1px solid rgba(0,0,0,0.06);
    padding: 12px;
    min-height: 120px;
  }

  .info-card h3 {
    font-size: 12px;
    font-weight: 700;
    color: var(--invoice-navy);
    margin: 0 0 6px 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .info-card p {
    margin: 2px 0;
    font-size: 10px;
    color: #374151;
  }

  .qr-code-wrapper {
    width: 110px;
    height: 110px;
    border-radius: 12px;
    border: 1px solid rgba(0,0,0,0.08);
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
  }

  .qr-code-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .qr-label {
    font-size: 9px;
    color: #6b7280;
    text-align: center;
  }

  .table-container {
    margin-top: 10px;
    page-break-inside: avoid;
  }

  .table-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--invoice-navy);
    margin-bottom: 6px;
    border-bottom: 1px solid rgba(0,0,0,0.08);
    padding-bottom: 4px;
  }

  .custom-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 10px;
  }

  .custom-table thead th {
    padding: 7px;
    text-align: right;
    font-weight: 600;
    color: var(--invoice-navy);
    background: var(--invoice-note);
    border-bottom: 1px solid rgba(0,0,0,0.08);
    text-transform: uppercase;
  }

  .print-invoice-container.ltr .custom-table thead th {
    text-align: left;
  }

  .custom-table tbody tr {
    border-bottom: 1px solid rgba(0,0,0,0.04);
  }

  .custom-table tbody tr:nth-child(even) td {
    background: var(--invoice-muted);
  }

  .custom-table td {
    padding: 6px;
    color: #1f2937;
  }

  .totals-section {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
  }

  .totals {
    width: min(260px, 100%);
    background: #fff;
    border-radius: 12px;
    border: 1px solid rgba(0,0,0,0.06);
    padding: 10px 12px;
  }

  .bottom-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 16px;
    flex-wrap: wrap;
  }

  .bottom-row .totals-section {
    flex: 1;
    min-width: 220px;
  }

  .qr-card-inline {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .total-row {
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
    font-size: 11px;
  }

  .total-row span:last-child {
    font-weight: 600;
    color: #111;
  }

  .grand-total {
    margin-top: 6px;
    padding-top: 6px;
    border-top: 1px dashed rgba(0,0,0,0.12);
    font-size: 14px;
    font-weight: 700;
    color: var(--invoice-orange);
  }

  .notes {
    margin-top: 12px;
    padding: 12px;
    background: var(--invoice-muted);
    border-radius: 10px;
    border: 1px solid var(--invoice-border);
    color: #4b5563;
    page-break-inside: avoid;
  }

  .notes h3 {
    margin: 0 0 6px 0;
    font-size: 12px;
    color: var(--invoice-navy);
  }

  .footer {
    text-align: center;
    color: #6b7280;
    font-size: 9px;
    border-top: 1px dashed rgba(0,0,0,0.08);
    padding-top: 8px;
    margin-top: auto;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 9px;
    font-weight: 600;
  }

  .status-pending {
    background: #FEF3C7;
    color: #92400e;
  }

  .status-paid {
    background: #DCFCE7;
    color: #166534;
  }

  .status-cancelled {
    background: #FEE2E2;
    color: #991b1b;
  }

  @media print {
    @page {
      size: A4;
      margin: 10mm;
    }

    html, body {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    .print-invoice-container {
      width: 100%;
      min-height: auto;
      padding: 0;
      margin: 0;
      box-shadow: none;
      background: #fff;
    }
  }
`;
