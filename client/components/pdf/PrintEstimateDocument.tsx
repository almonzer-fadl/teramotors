/* eslint-disable @next/next/no-img-element */
'use client';

interface PrintEstimateDocumentProps {
  estimate: any;
  jobCard?: any;
  language?: string;
}

const PrintEstimateDocument = ({
  estimate,
  jobCard,
  language = 'ar'
}: PrintEstimateDocumentProps) => {
  const isRTL = true; // Force Arabic RTL layout

  // Calculate totals with discount and tax only on parts
  const services = estimate?.services || [];
  const parts = estimate?.parts || [];
  const servicesTotal = services.reduce((sum: number, s: any) => sum + (s.laborHours * s.laborRate), 0);
  const partsTotal = parts.reduce((sum: number, p: any) => sum + (p.quantity * p.cost), 0);
  const subtotal = servicesTotal + partsTotal;
  const tax = partsTotal * 0.15; // Tax only on parts
  const discount = estimate?.discount || 0;
  const discountAmount = (subtotal + tax) * (discount / 100);
  const grandTotal = subtotal + tax - discountAmount;

  const translations = {
    ar: {
      title: "تقدير",
      company: "تيرا فيجنز",
      estimateNumber: "رقم التقدير #",
      date: "التاريخ",
      validUntil: "صالح حتى",
      customerInfo: "معلومات العميل",
      customer: "العميل",
      vehicleInfo: "معلومات المركبة",
      vehicle: "المركبة",
      year: "السنة",
      licensePlate: "رقم اللوحة",
      services: "الخدمات",
      service: "الخدمة",
      quantity: "الكمية",
      laborHours: "الساعات",
      laborRate: "المعدل",
      total: "المجموع",
      parts: "القطع",
      partName: "اسم القطعة",
      partNumber: "رقم القطعة",
      unitCost: "تكلفة الوحدة",
      subtotal: "المجموع الفرعي",
      tax: "ضريبة القطع (15%)",
      discount: "الخصم",
      grandTotal: "المجموع الإجمالي",
      notes: "ملاحظات",
      generatedOn: "تم الإنشاء في",
      systemName: "نظام إدارة صيانة السيارات تيرا موتورز",
      status: "الحالة",
      estimateNote: "هذا تقدير أولي وليس فاتورة نهائية"
    },
    en: {
      title: "Estimate",
      company: "TeraMotors Auto Repair",
      estimateNumber: "Estimate #",
      date: "Date",
      validUntil: "Valid Until",
      customerInfo: "Customer Information",
      customer: "Customer",
      vehicleInfo: "Vehicle Information",
      vehicle: "Vehicle",
      year: "Year",
      licensePlate: "License Plate",
      services: "Services",
      service: "Service",
      quantity: "Quantity",
      laborHours: "Hours",
      laborRate: "Rate",
      total: "Total",
      parts: "Parts",
      partName: "Part Name",
      partNumber: "Part #",
      unitCost: "Unit Cost",
      subtotal: "Subtotal",
      tax: "Tax on Parts (15%)",
      discount: "Discount",
      grandTotal: "Grand Total",
      notes: "Notes",
      generatedOn: "Generated on",
      systemName: "TeraMotors Auto Repair Management System",
      status: "Status",
      estimateNote: "This is a preliminary estimate and not a final invoice"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.ar;

  const formatDate = (date: any, isRTL: boolean) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  };

  const formatCurrency = (amount: number, isRTL: boolean) => {
    return `ر.س ${amount.toFixed(2)}`;
  };

  const getStatusText = (status: string, isRTL: boolean) => {
    const statusMap = {
      ar: {
        pending: 'معلق',
        approved: 'موافق عليه',
        rejected: 'مرفوض'
      },
      en: {
        pending: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected'
      }
    };

    return statusMap[isRTL ? 'ar' : 'en'][status as keyof typeof statusMap.ar] || status;
  };

  return (
    <div className="print-estimate-container">
      <style jsx>{`
        .print-estimate-container {
          font-family: ${isRTL ? "'Cairo', 'Noto Sans Arabic', 'Segoe UI', Tahoma, sans-serif" : "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"};
          line-height: 1.6;
          color: #333;
          direction: ${isRTL ? 'rtl' : 'ltr'};
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
          padding: 10px 0;
          margin-bottom: 15px;
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
          ${isRTL ? 'font-family: "Cairo", sans-serif;' : ''}
        }

        .estimate-note {
          text-align: center;
          color: #f59e0b;
          font-size: 14px;
          font-weight: 600;
          margin: 10px 0;
          padding: 10px;
          background: #fffbeb;
          border-radius: 8px;
          border: 1px solid #f59e0b;
          ${isRTL ? 'font-family: "Cairo", sans-serif;' : ''}
        }

        .estimate-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 15px;
        }

        .info-section h3 {
          font-size: 16px;
          font-weight: 600;
          color: #000;
          margin-bottom: 8px;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 3px;
          ${isRTL ? 'font-family: "Cairo", sans-serif;' : ''}
        }

        .info-section p {
          margin: 4px 0;
          color: #666;
          font-size: 13px;
          ${isRTL ? 'font-family: "Cairo", sans-serif;' : ''}
        }

        .services-table, .parts-table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
          font-size: 13px;
        }

        .services-table th, .parts-table th {
          background: #1e3a8a;
          color: white;
          padding: 8px 6px;
          text-align: ${isRTL ? 'right' : 'left'};
          font-weight: 600;
          ${isRTL ? 'font-family: "Cairo", sans-serif;' : ''}
        }

        .services-table td, .parts-table td {
          padding: 6px 6px;
          border-bottom: 1px solid #e5e7eb;
          text-align: ${isRTL ? 'right' : 'left'};
          ${isRTL ? 'font-family: "Cairo", sans-serif;' : ''}
        }

        .services-table tr:nth-child(even), .parts-table tr:nth-child(even) {
          background-color: #f8f9fa;
        }

        .totals {
          margin-top: 15px;
          text-align: ${isRTL ? 'left' : 'right'};
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          border-bottom: 1px solid #e5e7eb;
          font-size: 14px;
          ${isRTL ? 'font-family: "Cairo", sans-serif;' : ''}
        }

        .grand-total {
          font-weight: 700;
          font-size: 16px;
          color: #000;
          border-top: 2px solid #000;
          margin-top: 6px;
          padding-top: 6px;
          ${isRTL ? 'font-family: "Cairo", sans-serif;' : ''}
        }

        .notes {
          margin-top: 15px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 8px;
          border-${isRTL ? 'right' : 'left'}: 4px solid #000;
        }

        .notes h3 {
          ${isRTL ? 'font-family: "Cairo", sans-serif;' : ''}
          font-weight: 600;
          color: #000;
          margin-bottom: 10px;
        }

        .notes p {
          ${isRTL ? 'font-family: "Cairo", sans-serif;' : ''}
          color: #666;
        }

        .footer {
          margin-top: 40px;
          text-align: center;
          color: #666;
          font-size: 12px;
          ${isRTL ? 'font-family: "Cairo", sans-serif;' : ''}
        }

        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          ${isRTL ? 'font-family: "Cairo", sans-serif;' : ''}
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
          @page {
            size: A4;
            margin: 10mm;
          }

          body {
            margin: 0;
            background: white;
          }

          .print-estimate-container {
            padding: 0;
            width: 100%;
            margin: 0;
            box-shadow: none;
            background: white;
            min-height: auto;
            line-height: 1.4;
          }

          .header {
            padding: 8px 0;
            margin-bottom: 10px;
          }

          .estimate-title {
            margin: 8px 0 0 0;
          }

          .estimate-note {
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

          /* Allow page breaks */
          .page-break {
            page-break-before: always;
          }

          /* Prevent breaking inside header only */
          .header {
            page-break-inside: avoid;
            page-break-after: avoid;
          }

          .estimate-title {
            page-break-inside: avoid;
            page-break-after: avoid;
          }

          .estimate-note {
            page-break-inside: avoid;
            page-break-after: auto;
          }

          /* Allow estimate-info to break if needed */
          .estimate-info {
            page-break-inside: auto;
            page-break-after: auto;
          }

          .info-section {
            page-break-inside: avoid;
            page-break-after: auto;
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

          .services-table tfoot, .parts-table tfoot {
            display: table-footer-group;
          }

          /* Ensure info sections don't push tables to next page */
          .estimate-info {
            page-break-after: avoid !important;
          }

          .info-section:last-child {
            page-break-after: avoid !important;
            margin-bottom: 5px !important;
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

          /* Ensure all text is black in print */
          * {
            color: #000 !important;
          }

          /* Ensure table headers are deep blue in print */
          .services-table th, .parts-table th {
            background: #1e3a8a !important;
            color: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Ensure company details are black in print */
          .company-details {
            color: #000 !important;
          }

          /* Ensure info section headers are black in print */
          .info-section h3 {
            color: #000 !important;
          }

          /* Ensure grand total is black in print */
          .grand-total {
            color: #000 !important;
            border-top: 2px solid #000 !important;
          }

          /* Ensure notes border is black in print */
          .notes {
            border-${isRTL ? 'right' : 'left'}: 4px solid #000 !important;
            page-break-inside: avoid;
            page-break-before: auto;
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

          /* Ensure estimate note styling is preserved */
          .estimate-note {
            background: #fffbeb !important;
            border: 1px solid #f59e0b !important;
            color: #f59e0b !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      <div className="header">
          <div className="logo-container">
            <img
              src="/icon.png"
              alt="TeraMotors Logo"
              className="logo-image"
            />
            <div className="company-name">
              Tera<span className="highlight">Visions</span>
            </div>
            <div className="company-subtitle">Auto Repair</div>
          </div>

          <div className="company-details">
            <div>الرياض، صناعيه الرمال <br/>المملكه العربيه السعوديه</div>
            <div>+966599006314</div>
            <div>info@teramotors.com</div>
          </div>
        </div>

        <h2 className="estimate-title">{t.title} #{String(estimate._id || '').slice(-6)}</h2>
        <div className="estimate-note">{t.estimateNote}</div>

        <div className="estimate-info">
          <div className="info-section">
            <h3>{t.date}</h3>
            <p><strong>{t.date}:</strong> {formatDate(estimate.createdAt || Date.now(), isRTL)}</p>
            <p><strong>{t.validUntil}:</strong> {formatDate(estimate.validUntil || Date.now(), isRTL)}</p>
            <p><strong>{t.status}:</strong> <span className={`status-badge status-${estimate.status || 'pending'}`}>{getStatusText(estimate.status, isRTL)}</span></p>
          </div>

          <div className="info-section">
            <h3>{t.customerInfo}</h3>
            <p><strong>{t.customer}:</strong> {estimate.customerId?.companyName ? estimate.customerId.companyName : (estimate.customerId?.firstName || '') + ' ' + (estimate.customerId?.lastName || '')}</p>
            {estimate.customerId?.email && <p><strong>Email:</strong> {estimate.customerId.email}</p>}
            {estimate.customerId?.phone && <p><strong>Phone:</strong> {estimate.customerId.phone}</p>}
          </div>

          <div className="info-section">
            <h3>{t.vehicleInfo}</h3>
            {estimate.vehicleId ? (
              <>
                <p><strong>{t.vehicle}:</strong> {estimate.vehicleId.year} {estimate.vehicleId.make} {estimate.vehicleId.model}</p>
                {estimate.vehicleId.licensePlate && <p><strong>{t.licensePlate}:</strong> {estimate.vehicleId.licensePlate}</p>}
              </>
            ) : (
              <p>No vehicle information</p>
            )}
          </div>
        </div>

        {services.length > 0 && (
          <table className="services-table">
            <thead>
              <tr>
                <th>{t.service}</th>
                <th>{t.quantity}</th>
                <th>{t.laborHours}</th>
                <th>{t.laborRate}</th>
                <th>{t.total}</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s: any, index: number) => (
                <tr key={index}>
                  <td>{s.serviceId?.name || s.name || ''}</td>
                  <td>{s.quantity || 1}</td>
                  <td>{s.laborHours || 0}</td>
                  <td>{(s.laborRate || 0).toFixed(2)}</td>
                  <td>{((s.laborHours || 0) * (s.laborRate || 0)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {parts.length > 0 && (
          <table className="parts-table">
            <thead>
              <tr>
                <th>{t.partName}</th>
                <th>{t.quantity}</th>
                <th>{t.unitCost}</th>
                <th>{t.total}</th>
              </tr>
            </thead>
            <tbody>
              {parts.map((p: any, index: number) => (
                <tr key={index}>
                  <td>{p.partId?.name || p.name || ''}</td>
                  <td>{p.quantity}</td>
                  <td>{p.cost.toFixed(2)}</td>
                  <td>{(p.quantity * p.cost).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="totals">
          <div className="total-row">
            <span>{t.subtotal}:</span>
            <span>{formatCurrency(subtotal, isRTL)}</span>
          </div>
          <div className="total-row">
            <span>{t.tax}:</span>
            <span>{formatCurrency(tax, isRTL)}</span>
          </div>
          {discount > 0 && (
            <div className="total-row">
              <span>{t.discount} ({discount}%):</span>
              <span>-{formatCurrency(discountAmount, isRTL)}</span>
            </div>
          )}
          <div className="total-row grand-total">
            <span>{t.grandTotal}:</span>
            <span>{formatCurrency(grandTotal, isRTL)}</span>
          </div>
        </div>

        {estimate.notes && (
          <div className="notes">
            <h3>{t.notes}</h3>
            <p>{estimate.notes}</p>
          </div>
        )}

        <div className="footer">
          <p>{t.generatedOn} {formatDate(new Date(), isRTL)}</p>
          <p>{t.systemName}</p>
        </div>
    </div>
  );
};

export default PrintEstimateDocument;
