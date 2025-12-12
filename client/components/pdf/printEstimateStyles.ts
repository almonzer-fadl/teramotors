export const PRINT_ESTIMATE_STYLES = `
  :root {
    --brand-orange: #F97402;
    --brand-navy: #063479;
    --brand-muted: #FFF6ED;
    --brand-muted-dark: #FFEAD8;
    --brand-border: #FFE0C2;
    --brand-note: rgba(249, 116, 2, 0.12);
  }

  .print-estimate-container {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
    line-height: 1.4;
    color: #333;
    direction: rtl;
    background: #fff;
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    padding: 12mm;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    font-size: 9pt;
  }

  .print-estimate-container.ltr {
    direction: ltr;
  }

  .print-estimate-container .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 10px;
    border-bottom: 2px solid #1a1a1a;
    margin-bottom: 15px;
  }

  .print-estimate-container .logo-container {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .print-estimate-container .logo-image {
    width: 45px;
    height: 45px;
    border-radius: 10px;
  }

  .print-estimate-container .company-name {
    font-size: 22px;
    font-weight: 700;
    color: #1a1a1a;
    line-height: 1.1;
  }

  .print-estimate-container .company-name .highlight {
    color: var(--brand-orange);
    font-weight: 800;
  }

  .print-estimate-container .company-subtitle {
    font-size: 12px;
    color: #555;
  }

  .print-estimate-container .company-details {
    text-align: left;
    font-size: 9pt;
    color: #444;
  }

  .print-estimate-container.ltr .company-details {
    text-align: right;
  }

  .print-estimate-container .company-details div {
    margin-bottom: 1px;
  }

  .print-estimate-container .company-details strong {
    font-weight: 600;
    color: #1a1a1a;
  }

  .print-estimate-container .document-title {
    text-align: center;
    margin-bottom: 20px;
  }

  .print-estimate-container .document-title h1 {
    font-size: 28px;
    font-weight: 800;
    color: var(--brand-orange);
    letter-spacing: 1px;
    margin: 0;
  }

  .print-estimate-container .document-title p {
    font-size: 14px;
    color: #888;
    margin: 0;
  }

  .print-estimate-container .estimate-note {
    text-align: center;
    padding: 8px;
    background: var(--brand-note);
    color: #92400e;
    border-radius: 8px;
    font-size: 10pt;
    font-weight: 500;
    margin: 0 auto 20px auto;
    max-width: 90%;
  }

  .print-estimate-container .info-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    margin-bottom: 25px;
  }

  .print-estimate-container .info-card {
    background: #fff;
    border-radius: 12px;
    padding: 14px;
    border: 1px solid rgba(0,0,0,0.05);
  }

  .print-estimate-container .info-card h3 {
    font-size: 11pt;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--brand-navy);
    margin: 0 0 8px 0;
    padding-bottom: 6px;
    border-bottom: 1px solid rgba(6, 52, 121, 0.08);
  }

  .print-estimate-container .info-card p {
    margin: 2px 0;
    color: #444;
    font-size: 9pt;
  }

  .print-estimate-container .info-card p strong {
    color: #111;
    font-weight: 600;
  }

  .print-estimate-container .table-container {
    margin-bottom: 15px;
    page-break-inside: avoid;
  }

  .print-estimate-container .table-title {
    font-size: 16px;
    font-weight: 700;
    color: #222;
    margin-bottom: 10px;
    padding-bottom: 4px;
    border-bottom: 1px solid var(--brand-border);
  }

  .print-estimate-container .custom-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 9pt;
  }

  .print-estimate-container .custom-table thead th {
    padding: 8px;
    text-align: right;
    font-weight: 600;
    color: var(--brand-navy);
    background-color: #f8f8f8;
    text-transform: uppercase;
    font-size: 8pt;
    border-bottom: 1px solid rgba(0,0,0,0.08);
  }

  .print-estimate-container.ltr .custom-table thead th {
    text-align: left;
  }

  .print-estimate-container .custom-table thead th:first-child {
    border-top-left-radius: 6px;
    border-bottom-left-radius: 6px;
  }

  .print-estimate-container .custom-table thead th:last-child {
    border-top-right-radius: 6px;
    border-bottom-right-radius: 6px;
  }

  .print-estimate-container .custom-table tbody tr {
    border-bottom: 1px solid rgba(0,0,0,0.05);
    page-break-inside: avoid;
  }

  .print-estimate-container .custom-table tbody tr:last-child {
    border-bottom: none;
  }

  .print-estimate-container .custom-table td {
    padding: 8px;
    color: #333;
  }

  .print-estimate-container .custom-table tbody tr:nth-child(even) td {
    background-color: #FFF8F1;
  }

  .print-estimate-container .totals-section {
    display: flex;
    justify-content: flex-end;
    margin-top: auto;
    padding-top: 15px;
    page-break-inside: avoid;
  }

  .print-estimate-container .totals-section .totals {
    width: 50%;
    font-size: 10pt;
    background: transparent;
    border-radius: 12px;
    border: none;
    box-shadow: none;
  }

  .print-estimate-container .total-row {
    display: flex;
    justify-content: space-between;
    padding: 6px 10px;
  }

  .print-estimate-container .total-row:nth-child(odd) {
    background-color: #f9f9f9;
  }

  .print-estimate-container .total-row span:last-child {
    font-weight: 600;
    color: #111;
  }

  .print-estimate-container .total-row.grand-total {
    border: 0;
    border-radius: 6px;
    margin-top: 8px;
    padding: 8px 10px;
    font-size: 14pt;
    font-weight: 700;
    color: var(--brand-orange);
    background-color: rgba(249, 116, 2, 0.08);
  }

  .print-estimate-container .grand-total span:last-child {
    color: var(--brand-orange);
  }

  .print-estimate-container .notes {
    margin-top: 20px;
    padding: 12px;
    background: var(--brand-muted);
    border-radius: 10px;
    border: 1px solid var(--brand-border);
    page-break-inside: avoid;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.4);
  }

  .print-estimate-container .notes h3 {
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 8px 0;
    font-size: 11pt;
  }

  .print-estimate-container .notes p {
    color: #555;
    font-size: 9pt;
    margin: 0;
  }

  .print-estimate-container .footer {
    padding-top: 15px;
    text-align: center;
    color: #777;
    font-size: 8pt;
    border-top: 1px dashed var(--brand-border);
    page-break-inside: avoid;
  }

  .print-estimate-container .status-badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 6px;
    font-size: 8pt;
    font-weight: 500;
  }

  .print-estimate-container .status-pending {
    background-color: #FEF0D9;
    color: #92400e;
  }

  .print-estimate-container .status-approved {
    background-color: #DAF5E7;
    color: #166534;
  }

  .print-estimate-container .status-rejected {
    background-color: rgba(249, 116, 2, 0.12);
    color: #b45309;
  }

  @media print {
    @page {
      size: A4;
      margin: 12mm;
    }

    html, body {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    .print-estimate-container {
      width: 100%;
      min-height: 100%;
      padding: 0;
      margin: 0;
      box-shadow: none;
      background: #fff;
    }
  }
`;
