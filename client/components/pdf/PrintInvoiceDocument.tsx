/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { PRINT_INVOICE_STYLES } from './printInvoiceStyles';

interface PrintInvoiceDocumentProps {
  invoice: any;
  jobCard?: any;
  qrCodeData?: string;
  language?: string;
}

const PrintInvoiceDocument = ({
  invoice,
  jobCard,
  qrCodeData,
  language = 'ar'
}: PrintInvoiceDocumentProps) => {
  const isRTL = language !== 'en';
  const services = jobCard?.services || invoice?.services || [];
  const parts = jobCard?.partsUsed || invoice?.parts || [];
  const servicesTotal = services.reduce((sum: number, service: any) => {
    const laborHours = Number(service.laborHours || 0);
    const laborRate = Number(service.laborRate || 0);
    return sum + laborHours * laborRate;
  }, 0);
  const partsTotal = parts.reduce((sum: number, part: any) => {
    const quantity = Number(part.quantity || 0);
    const unitCost = Number(part.cost ?? part.unitCost ?? 0);
    return sum + quantity * unitCost;
  }, 0);
  const subtotal = servicesTotal + partsTotal;
  const tax = partsTotal * 0.15;
  const discount = typeof jobCard?.discount === 'number' ? jobCard.discount : (invoice?.discount || 0);
  const discountAmount = (subtotal + tax) * (discount / 100);
  const grandTotal = subtotal + tax - discountAmount;

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

  useEffect(() => {
    if (qrCodeData) {
      setQrCodeDataUrl(qrCodeData);
    }
  }, [qrCodeData]);

  const translations = {
    ar: {
      title: 'فاتورة',
      invoiceInfo: 'تفاصيل الفاتورة',
      companyLabel: 'الشركة',
      crNumber: 'رقم السجل التجاري',
      vatNumber: 'الرقم الضريبي',
      invoiceNumber: 'رقم الفاتورة #',
      date: 'التاريخ',
      dueDate: 'تاريخ الاستحقاق',
      customerInfo: 'معلومات العميل',
      customer: 'العميل',
      noCustomerInfo: 'لا توجد معلومات للعميل',
      vehicleInfo: 'معلومات المركبة',
      vehicle: 'المركبة',
      year: 'السنة',
      licensePlate: 'رقم اللوحة',
      noVehicleInfo: 'لا توجد معلومات للمركبة',
      services: 'الخدمات',
      service: 'الخدمة',
      quantity: 'الكمية',
      laborHours: 'الساعات',
      laborRate: 'المعدل',
      total: 'المجموع',
      parts: 'القطع',
      partName: 'اسم القطعة',
      partNumber: 'رقم القطعة',
      unitCost: 'تكلفة الوحدة',
      servicesTotal: 'مجموع الخدمات',
      partsTotal: 'مجموع القطع',
      tax: 'ضريبة القطع (15%)',
      discount: 'الخصم',
      grandTotal: 'المجموع الإجمالي',
      notes: 'ملاحظات',
      generatedOn: 'تم الإنشاء في',
      systemName: 'نظام إدارة صيانة السيارات تيرا موتورز',
      status: 'الحالة',
      zatcaCompliant: 'متوافق مع ZATCA'
    },
    en: {
      title: 'Invoice',
      invoiceInfo: 'Invoice Details',
      companyLabel: 'Company',
      crNumber: 'C.R. Number',
      vatNumber: 'VAT Number',
      invoiceNumber: 'Invoice #',
      date: 'Date',
      dueDate: 'Due Date',
      customerInfo: 'Customer Information',
      customer: 'Customer',
      noCustomerInfo: 'No customer information',
      vehicleInfo: 'Vehicle Information',
      vehicle: 'Vehicle',
      year: 'Year',
      licensePlate: 'License Plate',
      noVehicleInfo: 'No vehicle information',
      services: 'Services',
      service: 'Service',
      quantity: 'Qty',
      laborHours: 'Hours',
      laborRate: 'Rate',
      total: 'Total',
      parts: 'Parts',
      partName: 'Part Name',
      partNumber: 'Part #',
      unitCost: 'Unit Cost',
      servicesTotal: 'Services Total',
      partsTotal: 'Parts Total',
      tax: 'VAT on Parts (15%)',
      discount: 'Discount',
      grandTotal: 'Grand Total',
      notes: 'Notes',
      generatedOn: 'Generated on',
      systemName: 'TeraMotors Auto Repair Management System',
      status: 'Status',
      zatcaCompliant: 'ZATCA Compliant'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.ar;
  const containerClass = isRTL ? 'print-invoice-container' : 'print-invoice-container ltr';

  const formatDate = (date?: string | number | Date) => {
    if (!date) return '--/--/----';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  };

  const formatCurrency = (amount: number) => {
    return isRTL ? `ر.س ${amount.toFixed(2)}` : `SAR ${amount.toFixed(2)}`;
  };

  const getStatusText = (status?: string) => {
    const statusMap = {
      ar: {
        pending: 'معلق',
        paid: 'مدفوع',
        cancelled: 'ملغي'
      },
      en: {
        pending: 'Pending',
        paid: 'Paid',
        cancelled: 'Cancelled'
      }
    };

    const dictionary = statusMap[isRTL ? 'ar' : 'en'];
    return status ? (dictionary[status as keyof typeof dictionary] || status) : dictionary.pending;
  };

  const renderCustomerName = () => {
    if (!invoice?.customerId) return '';
    const customer = invoice.customerId;
    if (customer.companyName) return customer.companyName;
    const fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
    return fullName || customer.name || '';
  };

  return (
    <div className={containerClass}>
      <style>{PRINT_INVOICE_STYLES}</style>

      <div className="header">
        <div className="logo-container">
          <img src="/icon.png" alt="TeraMotors Logo" className="logo-image" />
          <div>
            <div className="company-name">Tera<span className="highlight">Visions</span></div>
            <div className="company-subtitle">Auto Repair Solutions</div>
          </div>
        </div>
        <div className="company-details">
          <div><strong>{t.companyLabel}:</strong> تيرا فيجنز</div>
          <div><strong>{t.crNumber}:</strong> 7051569718</div>
          <div><strong>{t.vatNumber}:</strong> 314211338900003</div>
          <div>الرياض، صناعية الرمال، المملكة العربية السعودية</div>
          <div>+966 59 900 6314 · info@teramotors.com</div>
        </div>
      </div>

      <div className="document-title">
        <h1>{t.title}</h1>
        <p>{t.invoiceNumber}{invoice?.invoiceNumber || String(invoice?._id || '').slice(-6)}</p>
      </div>

      <div className="info-grid">
        <div className="info-card">
          <h3>{t.invoiceInfo}</h3>
          <p><strong>{t.date}:</strong> {formatDate(invoice?.createdAt || Date.now())}</p>
          <p><strong>{t.dueDate}:</strong> {formatDate(invoice?.dueDate || invoice?.createdAt)}</p>
          <p>
            <strong>{t.status}:</strong> <span className={`status-badge status-${invoice?.status || 'pending'}`}>{getStatusText(invoice?.status)}</span>
          </p>
        </div>

        <div className="info-card">
          <h3>{t.customerInfo}</h3>
          {invoice?.customerId ? (
            <>
              <p><strong>{t.customer}:</strong> {renderCustomerName()}</p>
              {invoice.customerId.email && <p><strong>Email:</strong> {invoice.customerId.email}</p>}
              {invoice.customerId.phone && <p><strong>Phone:</strong> {invoice.customerId.phone}</p>}
              {invoice.customerId.vatNumber && <p><strong>{t.vatNumber}:</strong> {invoice.customerId.vatNumber}</p>}
            </>
          ) : (
            <p>{t.noCustomerInfo}</p>
          )}
        </div>

        <div className="info-card">
          <h3>{t.vehicleInfo}</h3>
          {invoice?.vehicleId ? (
            <>
              <p><strong>{t.vehicle}:</strong> {invoice.vehicleId.year} {invoice.vehicleId.make} {invoice.vehicleId.model}</p>
              {invoice.vehicleId.licensePlate && <p><strong>{t.licensePlate}:</strong> {invoice.vehicleId.licensePlate}</p>}
            </>
          ) : jobCard?.vehicleId ? (
            <>
              <p><strong>{t.vehicle}:</strong> {jobCard.vehicleId.year} {jobCard.vehicleId.make} {jobCard.vehicleId.model}</p>
              {jobCard.vehicleId.licensePlate && <p><strong>{t.licensePlate}:</strong> {jobCard.vehicleId.licensePlate}</p>}
            </>
          ) : (
            <p>{t.noVehicleInfo}</p>
          )}
        </div>

      </div>

      {services.length > 0 && (
        <div className="table-container">
          <h2 className="table-title">{t.services}</h2>
          <table className="custom-table">
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
              {services.map((service: any, index: number) => {
                const quantity = Number(service.quantity || 1);
                const laborHours = Number(service.laborHours || 0);
                const laborRate = Number(service.laborRate || 0);
                return (
                  <tr key={index}>
                    <td>{service.serviceId?.name || service.name || '—'}</td>
                    <td>{quantity}</td>
                    <td>{laborHours.toFixed(2)}</td>
                    <td>{formatCurrency(laborRate)}</td>
                    <td>{formatCurrency(laborHours * laborRate)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {parts.length > 0 && (
        <div className="table-container">
          <h2 className="table-title">{t.parts}</h2>
          <table className="custom-table">
            <thead>
              <tr>
                <th>{t.partName}</th>
                <th>{t.quantity}</th>
                <th>{t.unitCost}</th>
                <th>{t.total}</th>
              </tr>
            </thead>
            <tbody>
              {parts.map((part: any, index: number) => {
                const quantity = Number(part.quantity || 1);
                const unitCost = Number(part.cost ?? part.unitCost ?? 0);
                return (
                  <tr key={index}>
                    <td>{part.partId?.name || part.name || '—'}</td>
                    <td>{quantity}</td>
                    <td>{formatCurrency(unitCost)}</td>
                    <td>{formatCurrency(quantity * unitCost)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="bottom-row">
        <div className="totals-section">
          <div className="totals">
            <div className="total-row">
              <span>{t.servicesTotal}:</span>
              <span>{formatCurrency(servicesTotal)}</span>
            </div>
            <div className="total-row">
              <span>{t.partsTotal}:</span>
              <span>{formatCurrency(partsTotal)}</span>
            </div>
            <div className="total-row">
              <span>{t.tax}:</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            {discount > 0 && (
              <div className="total-row">
                <span>{t.discount} ({discount}%):</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="total-row grand-total">
              <span>{t.grandTotal}:</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>

        {qrCodeDataUrl && (
          <div className="qr-card-inline">
            <div className="qr-code-wrapper">
              <img src={qrCodeDataUrl} alt="ZATCA QR" />
            </div>
            <div className="qr-label">{t.zatcaCompliant}</div>
          </div>
        )}
      </div>

      {invoice?.notes && (
        <div className="notes">
          <h3>{t.notes}</h3>
          <p>{invoice.notes}</p>
        </div>
      )}

      <div className="footer">
        <p>{t.generatedOn} {formatDate(new Date())}</p>
        <p>{t.systemName}</p>
      </div>
    </div>
  );
};

export default PrintInvoiceDocument;
