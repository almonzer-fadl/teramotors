/* eslint-disable @next/next/no-img-element */
'use client';

import { PRINT_INSPECTION_STYLES } from './printInspectionStyles';

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
  const isRTL = language !== 'en';

  const groupedItems = (inspection?.items || []).reduce((acc: Record<string, any[]>, item: any) => {
    const category = item.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  const translations = {
    ar: {
      title: 'تقرير الفحص',
      companyLabel: 'الشركة',
      crNumber: 'رقم السجل التجاري',
      vatNumber: 'الرقم الضريبي',
      inspectionNumber: 'رقم الفحص #',
      date: 'التاريخ',
      customerInfo: 'معلومات العميل',
      customer: 'العميل',
      vehicleInfo: 'معلومات المركبة',
      vehicle: 'المركبة',
      year: 'السنة',
      licensePlate: 'رقم اللوحة',
      mechanicInfo: 'معلومات الميكانيكي',
      mechanic: 'الميكانيكي',
      template: 'القالب',
      inspectionItems: 'بنود الفحص',
      itemName: 'البند',
      condition: 'الحالة',
      good: 'جيد',
      fair: 'متوسط',
      poor: 'سيء',
      notes: 'ملاحظات',
      itemNotes: 'ملاحظات البند',
      generalNotes: 'ملاحظات عامة',
      noGeneralNotes: 'لا توجد ملاحظات إضافية',
      generatedOn: 'تم الإنشاء في',
      systemName: 'نظام إدارة صيانة السيارات تيرا موتورز',
      noItems: 'لا توجد بنود فحص',
      noCustomerInfo: 'لا توجد معلومات للعميل',
      noVehicleInfo: 'لا توجد معلومات للمركبة',
      noMechanicInfo: 'لا توجد معلومات للميكانيكي'
    },
    en: {
      title: 'Inspection Report',
      companyLabel: 'Company',
      crNumber: 'C.R. Number',
      vatNumber: 'VAT Number',
      inspectionNumber: 'Inspection #',
      date: 'Date',
      customerInfo: 'Customer Information',
      customer: 'Customer',
      vehicleInfo: 'Vehicle Information',
      vehicle: 'Vehicle',
      year: 'Year',
      licensePlate: 'License Plate',
      mechanicInfo: 'Mechanic Information',
      mechanic: 'Mechanic',
      template: 'Template',
      inspectionItems: 'Inspection Items',
      itemName: 'Item',
      condition: 'Condition',
      good: 'Good',
      fair: 'Fair',
      poor: 'Poor',
      notes: 'Notes',
      itemNotes: 'Item Notes',
      generalNotes: 'General Notes',
      noGeneralNotes: 'No additional notes',
      generatedOn: 'Generated on',
      systemName: 'TeraMotors Auto Repair Management System',
      noItems: 'No inspection items',
      noCustomerInfo: 'No customer information',
      noVehicleInfo: 'No vehicle information',
      noMechanicInfo: 'No mechanic information'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.ar;
  const containerClass = isRTL ? 'print-inspection-container' : 'print-inspection-container ltr';

  const formatDate = (date: any) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  };

  const renderCustomerName = () => {
    if (!jobCard?.customerId) return '';
    const customer = jobCard.customerId;
    if (customer.companyName) return customer.companyName;
    return `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
  };

  return (
    <div className={containerClass}>
      <style>{PRINT_INSPECTION_STYLES}</style>

      <div className="header">
        <div className="logo-container">
          <img src="/icon.png" alt="TeraMotors Logo" className="logo-image" />
          <div>
            <div className="company-name">
              Tera<span className="highlight">Visions</span>
            </div>
            <div className="company-subtitle">Auto Repair Solutions</div>
          </div>
        </div>
        <div className="company-details">
          <div><strong>{t.companyLabel}:</strong> تيرا فيجنز</div>
          <div><strong>{t.crNumber}:</strong> 7051569718</div>
          <div><strong>{t.vatNumber}:</strong> 314211338900003</div>
          <div>الرياض، صناعية الرمال</div>
          <div>+966 59 900 6314 · info@teramotors.com</div>
        </div>
      </div>

      <h2 className="inspection-title">
        {t.title} #{String(inspection._id || '').slice(-6)}
      </h2>

      <div className="inspection-info">
        <div className="info-section">
          <h3>{t.date}</h3>
          <p>
            <strong>{t.date}:</strong> {formatDate(inspection.inspectionDate || inspection.createdAt || Date.now())}
          </p>
          {inspection.templateId?.name && (
            <p>
              <strong>{t.template}:</strong> {inspection.templateId.name}
            </p>
          )}
        </div>

        <div className="info-section">
          <h3>{t.customerInfo}</h3>
          {jobCard?.customerId ? (
            <>
              <p><strong>{t.customer}:</strong> {renderCustomerName()}</p>
              {jobCard.customerId.email && <p><strong>Email:</strong> {jobCard.customerId.email}</p>}
              {jobCard.customerId.phone && <p><strong>Phone:</strong> {jobCard.customerId.phone}</p>}
            </>
          ) : (
            <p>{t.noCustomerInfo}</p>
          )}
        </div>

        <div className="info-section">
          <h3>{t.vehicleInfo}</h3>
          {jobCard?.vehicleId ? (
            <>
              <p>
                <strong>{t.vehicle}:</strong> {jobCard.vehicleId.year} {jobCard.vehicleId.make} {jobCard.vehicleId.model}
              </p>
              {jobCard.vehicleId.licensePlate && (
                <p>
                  <strong>{t.licensePlate}:</strong> {jobCard.vehicleId.licensePlate}
                </p>
              )}
            </>
          ) : (
            <p>{t.noVehicleInfo}</p>
          )}
        </div>

        <div className="info-section">
          <h3>{t.mechanicInfo}</h3>
          {inspection.mechanicId ? (
            <>
              <p>
                <strong>{t.mechanic}:</strong> {inspection.mechanicId.displayName || `${inspection.mechanicId.firstName || ''} ${inspection.mechanicId.lastName || ''}`}
              </p>
              {inspection.mechanicId.email && <p><strong>Email:</strong> {inspection.mechanicId.email}</p>}
            </>
          ) : (
            <p>{t.noMechanicInfo}</p>
          )}
        </div>
      </div>

      <div className="inspection-items">
          <h3 className="section-title">{t.inspectionItems}</h3>
          {Object.keys(groupedItems).length === 0 ? (
            <p style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>{t.noItems}</p>
          ) : (
            Object.keys(groupedItems).map((category) => (
              <div key={category} className="category-section">
                <div className="category-header">
                  {category}
                </div>
                <div className="category-items">
                  {groupedItems[category].map((item: any, index: number) => (
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

      <div className="notes">
        <h3>{t.generalNotes}</h3>
        <p>{inspection.notes || t.noGeneralNotes}</p>
      </div>

      <div className="footer">
        <p>{t.generatedOn} {formatDate(new Date())}</p>
        <p>{t.systemName}</p>
      </div>
    </div>
  );
};

export default PrintInspectionDocument;
