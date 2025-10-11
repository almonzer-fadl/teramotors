import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import QRCode from 'qrcode';

// Register Arabic fonts with better encoding support
Font.register({
  family: 'Noto Sans Arabic',
  src: 'https://fonts.gstatic.com/s/notosansarabic/v18/nwpxtLGrOAZMl5nJ_wfgRg3DrWFZWsnVBJ_sS6tlqHHFlhQ5l3sQWIHPqzCfyGyvu3CBFQLaig.ttf',
  fontStyle: 'normal',
  fontWeight: 'normal',
});

Font.register({
  family: 'Roboto',
  src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf',
  fontStyle: 'normal',
  fontWeight: 'normal',
});

// Register additional Arabic font for better character support
Font.register({
  family: 'Amiri',
  src: 'https://fonts.gstatic.com/s/amiri/v27/J7aRnpd8CGxBHqUpvrIw5_WN.ttf',
  fontStyle: 'normal',
  fontWeight: 'normal',
});

export interface ServerlessPDFOptions {
  language: 'ar' | 'en';
  includeQRCode?: boolean;
  format?: 'A4' | 'Letter';
}

// Define styles
const createStyles = (isRTL: boolean) => StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: isRTL ? 'Amiri' : 'Roboto',
    direction: isRTL ? 'rtl' : 'ltr',
  },
  header: {
    borderBottomWidth: 3,
    borderBottomColor: '#F13F33',
    paddingBottom: 20,
    marginBottom: 30,
    flexDirection: isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F13F33',
    marginBottom: 8,
    textAlign: isRTL ? 'right' : 'left',
  },
  invoiceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
    textAlign: isRTL ? 'right' : 'left',
  },
  qrCode: {
    width: 100,
    height: 100,
    marginLeft: isRTL ? 0 : 20,
    marginRight: isRTL ? 20 : 0,
  },
  infoSection: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoBox: {
    width: '48%',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F13F33',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
    textAlign: isRTL ? 'right' : 'left',
  },
  infoText: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 5,
    textAlign: isRTL ? 'right' : 'left',
    lineHeight: 1.5,
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    backgroundColor: '#F13F33',
    padding: 8,
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: isRTL ? 'right' : 'left',
  },
  tableRow: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    padding: 8,
  },
  tableRowEven: {
    backgroundColor: '#F8F9FA',
  },
  tableCell: {
    fontSize: 9,
    color: '#333333',
    textAlign: isRTL ? 'right' : 'left',
  },
  totals: {
    marginTop: 20,
    alignItems: isRTL ? 'flex-start' : 'flex-end',
  },
  totalRow: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    width: 250,
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  totalText: {
    fontSize: 11,
    color: '#333333',
  },
  grandTotal: {
    borderTopWidth: 2,
    borderTopColor: '#F13F33',
    marginTop: 10,
    paddingTop: 10,
  },
  grandTotalText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F13F33',
  },
  notes: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderLeftWidth: isRTL ? 0 : 4,
    borderRightWidth: isRTL ? 4 : 0,
    borderColor: '#F13F33',
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F13F33',
    marginBottom: 8,
    textAlign: isRTL ? 'right' : 'left',
  },
  notesText: {
    fontSize: 10,
    color: '#666666',
    textAlign: isRTL ? 'right' : 'left',
    lineHeight: 1.5,
  },
  footer: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 9,
    color: '#666666',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: 9,
    marginTop: 5,
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  },
  statusPaid: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
  },
  statusCancelled: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
  },
});

interface InvoicePDFDocumentProps {
  invoice: any;
  jobCard: any;
  options: ServerlessPDFOptions;
  qrCodeDataUrl?: string;
}

const InvoicePDFDocument: React.FC<InvoicePDFDocumentProps> = ({
  invoice,
  jobCard,
  options,
  qrCodeDataUrl
}) => {
  const isRTL = options.language === 'ar';
  const styles = createStyles(isRTL);
  const t = getTranslations(options.language);

  // Calculate totals with better error handling
  const services = jobCard?.services || [];
  const parts = jobCard?.partsUsed || [];
  const servicesTotal = services.reduce((sum: number, s: any) => {
    const laborHours = s?.laborHours || 0;
    const laborRate = s?.laborRate || 0;
    return sum + (laborHours * laborRate);
  }, 0);
  const partsTotal = parts.reduce((sum: number, p: any) => {
    const quantity = p?.quantity || 0;
    const cost = p?.cost || 0;
    return sum + (quantity * cost);
  }, 0);
  const subtotal = servicesTotal + partsTotal;
  const tax = subtotal * 0.15;
  const grandTotal = subtotal + tax;

  const formatDate = (date: Date | string | number): string => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  };

  const formatCurrency = (amount: number): string => {
    return `${amount.toFixed(2)} ر.س`;
  };

  const getStatusText = (status: string): string => {
    const statusMap = {
      ar: { pending: 'معلق', paid: 'مدفوع', cancelled: 'ملغي' },
      en: { pending: 'Pending', paid: 'Paid', cancelled: 'Cancelled' }
    };
    return statusMap[options.language][status as keyof typeof statusMap.ar] || status;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.companyName}>{t.company}</Text>
            <Text style={styles.invoiceTitle}>
              {t.title} #{String(invoice?._id || '').slice(-6)}
            </Text>
          </View>
          {qrCodeDataUrl && (
            <Image style={styles.qrCode} src={qrCodeDataUrl} />
          )}
        </View>

        {/* Invoice Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>
              {t.invoiceNumber}{String(invoice?._id || '').slice(-6)}
            </Text>
            <Text style={styles.infoText}>
              <Text style={{ fontWeight: 'bold' }}>{t.date}:</Text> {formatDate(invoice?.createdAt || Date.now())}
            </Text>
            <Text style={styles.infoText}>
              <Text style={{ fontWeight: 'bold' }}>{t.dueDate}:</Text> {formatDate(invoice?.dueDate || Date.now())}
            </Text>
            <Text style={styles.infoText}>
              <Text style={{ fontWeight: 'bold' }}>{t.status}:</Text> {getStatusText(invoice?.status || 'pending')}
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>{t.customerInfo}</Text>
            <Text style={styles.infoText}>
              <Text style={{ fontWeight: 'bold' }}>{t.customer}:</Text>{' '}
              {(invoice?.customerId?.firstName || '') + ' ' + (invoice?.customerId?.lastName || '')}
            </Text>
            {invoice?.customerId?.email && (
              <Text style={styles.infoText}>
                <Text style={{ fontWeight: 'bold' }}>Email:</Text> {invoice.customerId.email}
              </Text>
            )}
            {invoice?.customerId?.phone && (
              <Text style={styles.infoText}>
                <Text style={{ fontWeight: 'bold' }}>Phone:</Text> {invoice.customerId.phone}
              </Text>
            )}
          </View>
        </View>

        {/* Vehicle Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>{t.vehicleInfo}</Text>
            {invoice?.vehicleId ? (
              <>
                <Text style={styles.infoText}>
                  <Text style={{ fontWeight: 'bold' }}>{t.vehicle}:</Text>{' '}
                  {invoice.vehicleId.year} {invoice.vehicleId.make} {invoice.vehicleId.model}
                </Text>
                {invoice.vehicleId.licensePlate && (
                  <Text style={styles.infoText}>
                    <Text style={{ fontWeight: 'bold' }}>{t.licensePlate}:</Text> {invoice.vehicleId.licensePlate}
                  </Text>
                )}
              </>
            ) : (
              <Text style={styles.infoText}>No vehicle information</Text>
            )}
          </View>
        </View>

        {/* Services Table */}
        {services.length > 0 && (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 3 }]}>{t.service}</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>{t.quantity}</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>{t.laborHours}</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>{t.laborRate}</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>{t.total}</Text>
            </View>
            {services.map((s: any, index: number) => (
              <View key={index} style={[styles.tableRow, index % 2 === 0 ? styles.tableRowEven : {}]}>
                <Text style={[styles.tableCell, { flex: 3 }]}>{s?.serviceId?.name || s?.name || ''}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{s?.quantity || 0}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{s?.laborHours || 0}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{(s?.laborRate || 0).toFixed(2)}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{((s?.laborHours || 0) * (s?.laborRate || 0)).toFixed(2)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Parts Table */}
        {parts.length > 0 && (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 3 }]}>{t.partName}</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>{t.quantity}</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>{t.unitCost}</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>{t.total}</Text>
            </View>
            {parts.map((p: any, index: number) => (
              <View key={index} style={[styles.tableRow, index % 2 === 0 ? styles.tableRowEven : {}]}>
                <Text style={[styles.tableCell, { flex: 3 }]}>{p?.partId?.name || p?.name || ''}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{p?.quantity || 0}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{(p?.cost || 0).toFixed(2)}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{((p?.quantity || 0) * (p?.cost || 0)).toFixed(2)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalText}>{t.subtotal}:</Text>
            <Text style={styles.totalText}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalText}>{t.tax}:</Text>
            <Text style={styles.totalText}>{formatCurrency(tax)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.grandTotalText}>{t.grandTotal}:</Text>
            <Text style={styles.grandTotalText}>{formatCurrency(grandTotal)}</Text>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesTitle}>{t.notes}</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>{t.generatedOn} {formatDate(new Date())}</Text>
          <Text>{t.systemName}</Text>
        </View>
      </Page>
    </Document>
  );
};

function getTranslations(language: 'ar' | 'en') {
  return {
    ar: {
      title: "فاتورة",
      company: "تيرا لصيانه السيارات",
      invoiceNumber: "رقم الفاتورة #",
      date: "التاريخ",
      dueDate: "تاريخ الاستحقاق",
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
      tax: "الضريبة (15%)",
      grandTotal: "المجموع الإجمالي",
      notes: "ملاحظات",
      generatedOn: "تم الإنشاء في",
      systemName: "نظام إدارة صيانة السيارات تيرا موتورز",
      status: "الحالة",
      zatcaCompliant: "متوافق مع ZATCA"
    },
    en: {
      title: "Invoice",
      company: "TeraMotors Auto Repair",
      invoiceNumber: "Invoice #",
      date: "Date",
      dueDate: "Due Date",
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
      tax: "Tax (15%)",
      grandTotal: "Grand Total",
      notes: "Notes",
      generatedOn: "Generated on",
      systemName: "TeraMotors Auto Repair Management System",
      status: "Status",
      zatcaCompliant: "ZATCA Compliant"
    }
  }[language];
}

export class ServerlessPDFGenerator {
  async generateInvoicePDF(
    invoice: any,
    jobCard: any,
    options: ServerlessPDFOptions = { language: 'ar' }
  ): Promise<Buffer> {
    try {
      // Generate QR code if needed
      let qrCodeDataUrl: string | undefined;
      if (options.includeQRCode && invoice.zatca?.qrCode) {
        qrCodeDataUrl = await this.generateQRCodeImage(invoice.zatca.qrCode);
      }

      // Render the PDF document
      const { renderToBuffer } = await import('@react-pdf/renderer');
      const pdfBuffer = await renderToBuffer(
        <InvoicePDFDocument
          invoice={invoice}
          jobCard={jobCard}
          options={options}
          qrCodeDataUrl={qrCodeDataUrl}
        />
      );

      return pdfBuffer;
    } catch (error) {
      console.error('Error generating serverless PDF:', error);
      throw new Error('Failed to generate PDF: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  private async generateQRCodeImage(qrCodeBase64: string): Promise<string> {
    try {
      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(qrCodeBase64, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      return qrCodeDataUrl;
    } catch (error) {
      console.error('Error generating QR code image:', error);
      return '';
    }
  }
}
