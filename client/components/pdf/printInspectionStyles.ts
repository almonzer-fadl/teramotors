export const PRINT_INSPECTION_STYLES = `
  :root {
    --inspection-brand: #F97402;
    --inspection-navy: #063479;
    --inspection-muted: #fdf8f4;
    --inspection-border: #e4e4e7;
    --inspection-card: #ffffff;
    --inspection-note: rgba(249, 116, 2, 0.08);
  }

  .print-inspection-container {
    font-family: 'Cairo', 'Noto Sans Arabic', 'TheSans', 'Segoe UI', Tahoma, sans-serif;
    line-height: 1.4;
    color: #1f2937;
    direction: rtl;
    background: var(--inspection-card);
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    padding: 8mm;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .print-inspection-container.ltr {
    direction: ltr;
    font-family: 'TheSans', 'Segoe UI', Tahoma, sans-serif;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--inspection-border);
    padding-bottom: 8px;
    margin-bottom: 6px;
  }

  .logo-container {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .logo-image {
    width: 45px;
    height: 45px;
    border-radius: 10px;
    object-fit: contain;
    background: #fff;
    padding: 4px;
  }

  .company-name {
    font-size: 20px;
    font-weight: 800;
    color: var(--inspection-navy);
    margin: 0;
  }

  .company-name .highlight {
    color: var(--inspection-brand);
  }

  .company-subtitle {
    font-size: 10px;
    color: #6b7280;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .company-details {
    text-align: right;
    font-size: 12px;
    color: #4b5563;
  }

  .print-inspection-container.ltr .company-details {
    text-align: left;
  }

  .company-details div {
    margin-bottom: 1px;
  }

  .inspection-title {
    text-align: center;
    font-size: 18px;
    font-weight: 700;
    color: var(--inspection-navy);
    margin: 0 0 6px 0;
  }

  .inspection-info {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .info-section {
    background: #fff;
    border: 1px solid var(--inspection-border);
    border-radius: 10px;
    padding: 10px;
  }

  .info-section h3 {
    font-size: 13px;
    font-weight: 700;
    color: var(--inspection-navy);
    margin-bottom: 4px;
  }

  .info-section p {
    margin: 1px 0;
    font-size: 11px;
    color: #4b5563;
  }

  .inspection-items {
    margin-top: 4px;
  }

  .section-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--inspection-navy);
    margin-bottom: 8px;
  }

  .category-section {
    border: 1px solid var(--inspection-border);
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 10px;
  }

  .category-header {
    background: #f5f7fb;
    color: var(--inspection-navy);
    padding: 8px 12px;
    font-weight: 600;
    font-size: 12px;
  }

  .inspection-item {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 12px;
    border-top: 1px solid var(--inspection-border);
  }

  .inspection-item:nth-child(even) {
    background: #fafafa;
  }

  .item-content {
    flex: 1;
  }

  .item-name {
    font-size: 13px;
    font-weight: 600;
    color: #1f2937;
  }

  .item-note {
    font-size: 11px;
    color: #6b7280;
    font-style: italic;
    margin-top: 2px;
  }

  .condition-indicators {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .condition-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .condition-circle {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 2px solid var(--inspection-border);
  }

  .condition-circle.selected.good {
    background: #22c55e;
    border-color: #16a34a;
  }

  .condition-circle.selected.fair {
    background: #facc15;
    border-color: #eab308;
  }

  .condition-circle.selected.poor {
    background: #ef4444;
    border-color: #dc2626;
  }

  .condition-label {
    font-size: 10px;
    color: #6b7280;
  }

  .notes {
    margin-top: 10px;
    padding: 12px;
    background: var(--inspection-muted);
    border-radius: 10px;
    border-right: 3px solid var(--inspection-navy);
  }

  .print-inspection-container.ltr .notes {
    border-right: none;
    border-left: 4px solid var(--inspection-navy);
  }

  .notes h3 {
    margin-bottom: 6px;
    font-size: 13px;
    font-weight: 700;
    color: #1f2937;
  }

  .notes p {
    margin: 0;
    color: #4b5563;
    font-size: 11px;
  }

  .footer {
    margin-top: 18px;
    text-align: center;
    font-size: 10px;
    color: #6b7280;
  }

  @media print {
    @page {
      size: A4;
      margin: 12mm;
    }

    .print-inspection-container {
      width: 100%;
      min-height: auto;
      padding: 0;
      margin: 0;
      box-shadow: none;
    }
  }
`;
