/* eslint-disable @next/next/no-img-element */
'use client';

import { PRINT_ESTIMATE_STYLES } from './printEstimateStyles';

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
  const isRTL = language !== 'en'; // default RTL unless explicitly English

  // Calculate totals with discount and tax only on parts
  const services = estimate?.services || [];
  const parts = estimate?.parts || [];
  const servicesTotal = services.reduce((sum: number, s: any) => sum + (s.laborHours * s.laborRate), 0);
  const partsTotal = parts.reduce((sum: number, p: any) => sum + (p.quantity * p.unitCost), 0);
  const subtotal = servicesTotal + partsTotal;
  const tax = partsTotal * 0.15; // Tax only on parts
  const discount = estimate?.discount || 0;
  const discountAmount = (subtotal + tax) * (discount / 100);
  const grandTotal = subtotal + tax - discountAmount;

  const translations = {
    ar: {
      title: "تقدير",
      company: "الشركة",
      crNumber: "رقم السجل التجاري",
      vatNumber: "الرقم الضريبي",
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
      parts: "قطع الغيار",
      partName: "اسم القطعة",
      partNumber: "رقم القطعة",
      unitCost: "تكلفة الوحدة",
      subtotal: "المجموع الفرعي",
      tax: "ضريبة القيمة المضافة (15%)",
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
      company: "Company",
      crNumber: "C.R. Number",
      vatNumber: "VAT Number",
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
      tax: "VAT (15%)",
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

  const formatDate = (date: any) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  };

  const formatCurrency = (amount: number) => {
    return `ر.س ${amount.toFixed(2)}`;
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      ar: { pending: 'معلق', approved: 'موافق عليه', rejected: 'مرفوض' },
      en: { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' }
    };
    return statusMap[isRTL ? 'ar' : 'en'][status as keyof typeof statusMap.ar] || status;
  };

  return (
    <div className={`print-estimate-container ${isRTL ? '' : 'ltr'}`}>
      <style>{PRINT_ESTIMATE_STYLES}</style>

      <div className="header">
        <div className="logo-container">
          <img src="/icon.png" alt="TeraMotors Logo" className="logo-image" />
          <div>
            <div className="company-name">Tera<span className="highlight">Visions</span></div>
            <div className="company-subtitle">Auto Repair Solutions</div>
          </div>
        </div>
        <div className="company-details">
          <div><strong>{t.company}:</strong> تيرا فيجنز</div>
          <div><strong>{t.crNumber}:</strong> 7051569718</div>
          <div><strong>{t.vatNumber}:</strong> 314211338900003</div>
          <div>الرياض، صناعيه الرمال، المملكة العربية السعودية</div>
        </div>
      </div>

      <div className="document-title">
        <h1>{t.title}</h1>
        <p>{t.estimateNumber}{String(estimate._id || '').slice(-6)}</p>
      </div>
      
      {estimate.notes && (
        <div className="estimate-note">{t.estimateNote}</div>
      )}

      <div className="info-grid">
        <div className="info-card">
          <h3>معلومات التقدير</h3>
          <p><strong>{t.date}:</strong> {formatDate(estimate.createdAt || Date.now())}</p>
          <p><strong>{t.validUntil}:</strong> {formatDate(estimate.validUntil || Date.now())}</p>
          <p><strong>{t.status}:</strong> <span className={`status-badge status-${estimate.status || 'pending'}`}>{getStatusText(estimate.status)}</span></p>
        </div>

        <div className="info-card">
          <h3>{t.customerInfo}</h3>
          <p><strong>{t.customer}:</strong> {estimate.customerId?.companyName || `${estimate.customerId?.firstName || ''} ${estimate.customerId?.lastName || ''}`}</p>
          {estimate.customerId?.email && <p><strong>Email:</strong> {estimate.customerId.email}</p>}
          {estimate.customerId?.phone && <p><strong>Phone:</strong> {estimate.customerId.phone}</p>}
        </div>

        <div className="info-card">
          <h3>{t.vehicleInfo}</h3>
          {estimate.vehicleId ? (
            <>
              <p><strong>{t.vehicle}:</strong> {estimate.vehicleId.year} {estimate.vehicleId.make} {estimate.vehicleId.model}</p>
              {estimate.vehicleId.licensePlate && <p><strong>{t.licensePlate}:</strong> {estimate.vehicleId.licensePlate}</p>}
            </>
          ) : <p>No vehicle information</p>}
        </div>
      </div>

      {services.length > 0 && (
        <div className="table-container">
          <h2 className="table-title">{t.services}</h2>
          <table className="custom-table">
            <thead>
              <tr><th>{t.service}</th><th>{t.quantity}</th><th>{t.laborHours}</th><th>{t.laborRate}</th><th>{t.total}</th></tr>
            </thead>
            <tbody>
              {services.map((s: any, index: number) => (
                <tr key={index}>
                  <td>{s.serviceId?.name || s.name || 'N/A'}</td><td>{s.quantity || 1}</td><td>{s.laborHours || 0}</td>
                  <td>{formatCurrency(s.laborRate || 0)}</td><td>{formatCurrency((s.laborHours || 0) * (s.laborRate || 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {parts.length > 0 && (
        <div className="table-container">
          <h2 className="table-title">{t.parts}</h2>
          <table className="custom-table">
            <thead>
              <tr><th>{t.partName}</th><th>{t.partNumber}</th><th>{t.quantity}</th><th>{t.unitCost}</th><th>{t.total}</th></tr>
            </thead>
            <tbody>
              {parts.map((p: any, index: number) => (
                <tr key={index}>
                  <td>{p.partId?.name || p.name || 'N/A'}</td><td>{p.partId?.partNumber || p.partNumber || 'N/A'}</td><td>{p.quantity}</td>
                  <td>{formatCurrency(p.unitCost)}</td><td>{formatCurrency(p.quantity * p.unitCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="totals-section">
        <div className="totals">
          <div className="total-row"><span>{t.subtotal}:</span><span>{formatCurrency(subtotal)}</span></div>
          <div className="total-row"><span>{t.tax}:</span><span>{formatCurrency(tax)}</span></div>
          {discount > 0 && <div className="total-row"><span>{t.discount} ({discount}%):</span><span>-{formatCurrency(discountAmount)}</span></div>}
          <div className="total-row grand-total"><span>{t.grandTotal}:</span><span>{formatCurrency(grandTotal)}</span></div>
        </div>
      </div>

      {estimate.notes && (
        <div className="notes"><h3>{t.notes}</h3><p>{estimate.notes}</p></div>
      )}

      <div className="footer">
        <p>{t.generatedOn} {formatDate(new Date())} - {t.systemName}</p>
        <p>{t.estimateNote}</p>
      </div>
    </div>
  );
};

export default PrintEstimateDocument;
