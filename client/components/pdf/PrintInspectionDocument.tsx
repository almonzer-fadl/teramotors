/* eslint-disable @next/next/no-img-element */
'use client';

interface PrintInspectionDocumentProps {
  inspection: any;
  jobCard?: any;
  language?: string;
}

const PrintInspectionDocument = ({
  inspection,
  jobCard,
  language = 'ar'
}: PrintInspectionDocumentProps) => {
  const isRTL = true; // Force Arabic RTL layout

  // Group items by category
  const groupedItems = (inspection?.items || []).reduce((acc: any, item: any) => {
    const category = item.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  const translations = {
    ar: {
      title: "تقرير الفحص",
      company: "تيرا فيجنز",
      inspectionNumber: "رقم الفحص #",
      date: "التاريخ",
      customerInfo: "معلومات العميل",
      customer: "العميل",
      vehicleInfo: "معلومات المركبة",
      vehicle: "المركبة",
      year: "السنة",
      licensePlate: "رقم اللوحة",
      mechanicInfo: "معلومات الميكانيكي",
      mechanic: "الميكانيكي",
      template: "القالب",
      inspectionItems: "بنود الفحص",
      itemName: "البند",
      condition: "الحالة",
      good: "جيد",
      fair: "متوسط",
      poor: "سيء",
      notes: "ملاحظات",
      itemNotes: "ملاحظات البند",
      generalNotes: "ملاحظات عامة",
      generatedOn: "تم الإنشاء في",
      systemName: "نظام إدارة صيانة السيارات تيرا موتورز",
      noItems: "لا توجد بنود فحص"
    },
    en: {
      title: "Inspection Report",
      company: "TeraMotors Auto Repair",
      inspectionNumber: "Inspection #",
      date: "Date",
      customerInfo: "Customer Information",
      customer: "Customer",
      vehicleInfo: "Vehicle Information",
      vehicle: "Vehicle",
      year: "Year",
      licensePlate: "License Plate",
      mechanicInfo: "Mechanic Information",
      mechanic: "Mechanic",
      template: "Template",
      inspectionItems: "Inspection Items",
      itemName: "Item",
      condition: "Condition",
      good: "Good",
      fair: "Fair",
      poor: "Poor",
      notes: "Notes",
      itemNotes: "Item Notes",
      generalNotes: "General Notes",
      generatedOn: "Generated on",
      systemName: "TeraMotors Auto Repair Management System",
      noItems: "No inspection items"
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

  return (
    <div className="print-inspection-container">
      <style jsx>{`
        .print-inspection-container {
          font-family: ${isRTL ? "'Cairo', 'Noto Sans Arabic', 'Segoe UI', Tahoma, sans-serif" : "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"};
          line-height: 1.4;
          color: #333;
          direction: ${isRTL ? 'rtl' : 'ltr'};
          background: white;
          width: 210mm;
          margin: 0 auto;
          padding: 10mm;
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

        .inspection-title {
          font-size: 18px;
          font-weight: 600;
          color: #000;
          margin: 10px 0 0 0;
          text-align: center;
          ${isRTL ? 'font-family: "Cairo", sans-serif;' : ''}
        }

        .inspection-info {
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
          padding-bottom: 5px;
          ${isRTL ? 'font-family: "Cairo", sans-serif;' : ''}
        }

        .info-section p {
          margin: 4px 0;
          color: #666;
          font-size: 13px;
          ${isRTL ? 'font-family: "Cairo", sans-serif;' : ''}
        }

        .inspection-items {
          margin: 10px 0 0 0;
        }

        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #000;
          margin: 10px 0 10px 0;
          padding-bottom: 5px;
          border-bottom: 2px solid #e5e7eb;
          ${isRTL ? 'font-family: "Cairo", sans-serif;' : ''}
        }

        .category-section {
          margin-bottom: 15px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }

        .category-header {
          background: linear-gradient(to right, #1e3a8a, #1e40af);
          color: white;
          padding: 8px 12px;
          font-size: 14px;
          font-weight: 600;
          ${isRTL ? 'font-family: "Cairo", sans-serif;' : ''}
        }

        .category-items {
          padding: 0;
        }

        .inspection-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          border-bottom: 1px solid #e5e7eb;
          background: white;
        }

        .inspection-item:nth-child(even) {
          background: #f9fafb;
        }

        .inspection-item:last-child {
          border-bottom: none;
        }

        .item-content {
          flex: 1;
        }

        .item-name {
          ${isRTL ? 'font-family: "Cairo", sans-serif;' : ''}
          font-size: 14px;
          color: #374151;
          font-weight: 500;
          margin-bottom: 4px;
        }

        .item-note {
          ${isRTL ? 'font-family: "Cairo", sans-serif;' : ''}
          font-size: 12px;
          color: #6b7280;
          font-style: italic;
        }

        .condition-indicators {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .condition-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .condition-circle {
          width: 20px;
          height: 20px;
          border: 2px solid #d1d5db;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .condition-circle.selected.good {
          background: #22c55e;
          border-color: #16a34a;
        }

        .condition-circle.selected.fair {
          background: #eab308;
          border-color: #ca8a04;
        }

        .condition-circle.selected.poor {
          background: #ef4444;
          border-color: #dc2626;
        }

        .condition-circle.selected::after {
          content: '';
          width: 10px;
          height: 10px;
          background: white;
          border-radius: 50%;
        }

        .condition-label {
          ${isRTL ? 'font-family: "Cairo", sans-serif;' : ''}
          font-size: 10px;
          color: #6b7280;
        }

        .notes {
          margin-top: 30px;
          padding: 20px;
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

        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }

          body {
            margin: 0;
            background: white;
          }

          .print-inspection-container {
            padding: 0;
            width: 100%;
            margin: 0;
            box-shadow: none;
            background: white;
            min-height: auto;
            line-height: 1.4;
          }

          /* Compact all spacing in print */
          .header {
            padding: 5px 0 !important;
            margin-bottom: 5px !important;
          }

          .inspection-title {
            font-size: 16px !important;
            margin: 5px 0 !important;
          }

          .inspection-info {
            gap: 8px !important;
            margin-bottom: 8px !important;
          }

          .info-section {
            margin-bottom: 0 !important;
          }

          .info-section h3 {
            font-size: 13px !important;
            margin-bottom: 4px !important;
            padding-bottom: 3px !important;
          }

          .info-section p {
            margin: 2px 0 !important;
            font-size: 11px !important;
            line-height: 1.3 !important;
          }

          .inspection-items {
            margin: 5px 0 0 0 !important;
          }

          .section-title {
            font-size: 13px !important;
            margin: 5px 0 5px 0 !important;
            padding-bottom: 3px !important;
          }

          .category-section {
            margin-bottom: 8px !important;
          }

          .category-header {
            padding: 5px 8px !important;
            font-size: 12px !important;
          }

          .inspection-item {
            padding: 5px 8px !important;
            font-size: 11px !important;
            line-height: 1.3 !important;
          }

          .item-name {
            font-size: 11px !important;
          }

          .condition-circle {
            width: 16px !important;
            height: 16px !important;
          }

          .condition-label {
            font-size: 9px !important;
          }

          /* Allow page breaks */
          .page-break {
            page-break-before: always;
          }

          /* Prevent breaking inside these elements */
          .header, .inspection-info, .info-section {
            page-break-inside: avoid;
          }

          /* CRITICAL: Force categories to stay on first page */
          .inspection-items {
            page-break-before: avoid !important;
            break-before: avoid-page !important;
            margin-top: 0 !important;
          }

          .category-section {
            page-break-before: avoid !important;
            break-before: avoid-page !important;
            page-break-inside: auto;
          }

          .category-header {
            page-break-after: avoid;
          }

          .inspection-item {
            page-break-inside: avoid;
          }

          /* Prevent page break after info section */
          .inspection-info {
            page-break-after: avoid !important;
          }

          .info-section:last-child {
            page-break-after: avoid !important;
            margin-bottom: 5px !important;
          }

          .notes {
            page-break-inside: avoid;
            border-${isRTL ? 'right' : 'left'}: 4px solid #000 !important;
            margin-top: 20px;
            padding: 15px;
          }

          /* Ensure all text is black in print */
          * {
            color: #000 !important;
          }

          /* Ensure category headers are deep blue in print */
          .category-header {
            background: linear-gradient(to right, #1e3a8a, #1e40af) !important;
            color: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Ensure company details are black in print */
          .company-details {
            color: #000 !important;
          }

          /* Ensure info section headers are black in print */
          .info-section h3, .section-title {
            color: #000 !important;
          }

          /* Ensure condition circles maintain color */
          .condition-circle.selected.good {
            background: #22c55e !important;
            border-color: #16a34a !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .condition-circle.selected.fair {
            background: #eab308 !important;
            border-color: #ca8a04 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .condition-circle.selected.poor {
            background: #ef4444 !important;
            border-color: #dc2626 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .condition-circle.selected::after {
            background: white !important;
          }

          /* Prevent orphans and widows for maximum flexibility */
          p, li {
            orphans: 1;
            widows: 1;
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

      <h2 className="inspection-title">{t.title} #{String(inspection._id || '').slice(-6)}</h2>

      <div className="inspection-info">
        <div className="info-section">
          <h3>{t.date}</h3>
          <p><strong>{t.date}:</strong> {formatDate(inspection.inspectionDate || inspection.createdAt || Date.now(), isRTL)}</p>
          {inspection.templateId?.name && (
            <p><strong>{t.template}:</strong> {inspection.templateId.name}</p>
          )}
        </div>

        <div className="info-section">
          <h3>{t.customerInfo}</h3>
          {jobCard?.customerId ? (
            <>
              <p><strong>{t.customer}:</strong> {jobCard.customerId.companyName ? jobCard.customerId.companyName : (jobCard.customerId.firstName || '') + ' ' + (jobCard.customerId.lastName || '')}</p>
              {jobCard.customerId.email && <p><strong>Email:</strong> {jobCard.customerId.email}</p>}
              {jobCard.customerId.phone && <p><strong>Phone:</strong> {jobCard.customerId.phone}</p>}
            </>
          ) : (
            <p>No customer information</p>
          )}
        </div>

        <div className="info-section">
          <h3>{t.vehicleInfo}</h3>
          {jobCard?.vehicleId ? (
            <>
              <p><strong>{t.vehicle}:</strong> {jobCard.vehicleId.year} {jobCard.vehicleId.make} {jobCard.vehicleId.model}</p>
              {jobCard.vehicleId.licensePlate && <p><strong>{t.licensePlate}:</strong> {jobCard.vehicleId.licensePlate}</p>}
            </>
          ) : (
            <p>No vehicle information</p>
          )}
        </div>

        <div className="info-section">
          <h3>{t.mechanicInfo}</h3>
          {inspection.mechanicId ? (
            <p><strong>{t.mechanic}:</strong> {inspection.mechanicId.displayName || inspection.mechanicId.firstName + ' ' + (inspection.mechanicId.lastName || '')}</p>
          ) : (
            <p>No mechanic information</p>
          )}
        </div>
      </div>

      <div className="inspection-items">
        <h3 className="section-title">{t.inspectionItems}</h3>

        {Object.keys(groupedItems).length === 0 ? (
          <p style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>{t.noItems}</p>
        ) : (
          Object.entries(groupedItems).map(([category, items]: [string, any]) => (
            <div key={category} className="category-section">
              <div className="category-header">
                {category}
              </div>
              <div className="category-items">
                {items.map((item: any, index: number) => (
                  <div key={index} className="inspection-item">
                    <div className="item-content">
                      <div className="item-name">{item.name}</div>
                      {item.notes && (
                        <div className="item-note">{item.notes}</div>
                      )}
                    </div>
                    <div className="condition-indicators">
                      <div className="condition-group">
                        <div className={`condition-circle ${item.condition === 'good' ? 'selected good' : ''}`}></div>
                        <div className="condition-label">{t.good}</div>
                      </div>
                      <div className="condition-group">
                        <div className={`condition-circle ${item.condition === 'fair' ? 'selected fair' : ''}`}></div>
                        <div className="condition-label">{t.fair}</div>
                      </div>
                      <div className="condition-group">
                        <div className={`condition-circle ${item.condition === 'poor' ? 'selected poor' : ''}`}></div>
                        <div className="condition-label">{t.poor}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {inspection.notes && (
        <div className="notes">
          <h3>{t.generalNotes}</h3>
          <p>{inspection.notes}</p>
        </div>
      )}

      <div className="footer">
        <p>{t.generatedOn} {formatDate(new Date(), isRTL)}</p>
        <p>{t.systemName}</p>
      </div>
    </div>
  );
};

export default PrintInspectionDocument;
