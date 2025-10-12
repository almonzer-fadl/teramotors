/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import { LanguageHandler } from './language-handler';

// Register Arabic font
Font.register({
  family: 'Noto Sans Arabic',
  src: 'https://fonts.gstatic.com/s/notosansarabic/v18/nwpxtLGrOAZMl5nJ_wfgRg3DrWFZWsnVBJ_sS6tlqHHFlhQ5l3sQWIHPqzCfyGyvu3CBFQLaig.ttf',
});

export interface ArabicPDFOptions {
  includeQRCode?: boolean;
  format?: 'A4' | 'Letter';
}

// Define styles for Arabic
const createStyles = () => StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Noto Sans Arabic',
    direction: 'rtl',
  },
  header: {
    borderBottomWidth: 3,
    borderBottomColor: '#F13F33',
    paddingBottom: 20,
    marginBottom: 30,
    flexDirection: 'row-reverse',
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
    textAlign: 'right',
  },
  invoiceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
    textAlign: 'right',
  },
  qrCode: {
    width: 100,
    height: 100,
    marginRight: 20,
  },
  infoSection: {
    flexDirection: 'row-reverse',
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
    textAlign: 'right',
  },
  infoText: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 5,
    textAlign: 'right',
    lineHeight: 1.5,
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row-reverse',
    backgroundColor: '#F13F33',
    padding: 8,
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row-reverse',
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
    textAlign: 'right',
  },
  totals: {
    marginTop: 20,
    alignItems: 'flex-start',
  },
  totalRow: {
    flexDirection: 'row-reverse',
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
    borderRightWidth: 4,
    borderColor: '#F13F33',
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F13F33',
    marginBottom: 8,
    textAlign: 'right',
  },
  notesText: {
    fontSize: 10,
    color: '#666666',
    textAlign: 'right',
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

interface ArabicInvoicePDFDocumentProps {
  invoice: any;
  jobCard: any;
  options: ArabicPDFOptions;
  qrCodeDataUrl?: string;
}

const ArabicInvoicePDFDocument: React.FC<ArabicInvoicePDFDocumentProps> = ({
  invoice,
  jobCard,
  options,
  qrCodeDataUrl
}) => {
  const styles = createStyles();

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

  // Text function with proper Unicode handling and translation for Arabic
  const getText = (text: string | undefined | null): string => {
    if (!text) return '';
    return LanguageHandler.translateText(text, { targetLanguage: 'ar' });
  };

  const getStatusText = (status: string): string => {
    return LanguageHandler.translateStatus(status, 'ar');
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.companyName}>تيرا موتورز لصيانة السيارات</Text>
            <Text style={styles.invoiceTitle}>
              فاتورة #{String(invoice?._id || '').slice(-6)}
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
              رقم الفاتورة #{String(invoice?._id || '').slice(-6)}
            </Text>
            <Text style={styles.infoText}>
              <Text style={{ fontWeight: 'bold' }}>التاريخ:</Text> {formatDate(invoice?.createdAt || Date.now())}
            </Text>
            <Text style={styles.infoText}>
              <Text style={{ fontWeight: 'bold' }}>تاريخ الاستحقاق:</Text> {formatDate(invoice?.dueDate || Date.now())}
            </Text>
            <Text style={styles.infoText}>
              <Text style={{ fontWeight: 'bold' }}>الحالة:</Text> {getStatusText(invoice?.status || 'pending')}
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>معلومات العميل</Text>
            <Text style={styles.infoText}>
              <Text style={{ fontWeight: 'bold' }}>العميل:</Text>{' '}
              {LanguageHandler.translateCustomerName(
                invoice?.customerId?.firstName, 
                invoice?.customerId?.lastName, 
                'ar'
              )}
            </Text>
            {invoice?.customerId?.email && (
              <Text style={styles.infoText}>
                <Text style={{ fontWeight: 'bold' }}>البريد الإلكتروني:</Text> {LanguageHandler.translateEmail(invoice.customerId.email, 'ar')}
              </Text>
            )}
            {invoice?.customerId?.phone && (
              <Text style={styles.infoText}>
                <Text style={{ fontWeight: 'bold' }}>الهاتف:</Text> {LanguageHandler.translatePhone(invoice.customerId.phone, 'ar')}
              </Text>
            )}
          </View>
        </View>

        {/* Vehicle Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>معلومات المركبة</Text>
            {invoice?.vehicleId ? (
              <>
                <Text style={styles.infoText}>
                  <Text style={{ fontWeight: 'bold' }}>المركبة:</Text>{' '}
                  {invoice.vehicleId.year} {LanguageHandler.translateVehicleMake(invoice.vehicleId.make, 'ar')} {getText(invoice.vehicleId.model)}
                </Text>
                {invoice.vehicleId.licensePlate && (
                  <Text style={styles.infoText}>
                    <Text style={{ fontWeight: 'bold' }}>رقم اللوحة:</Text> {LanguageHandler.translateLicensePlate(invoice.vehicleId.licensePlate, 'ar')}
                  </Text>
                )}
              </>
            ) : (
              <Text style={styles.infoText}>لا توجد معلومات عن المركبة</Text>
            )}
          </View>
        </View>

        {/* Services Table */}
        {services.length > 0 && (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 3 }]}>الخدمة</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>الكمية</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>الساعات</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>المعدل</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>المجموع</Text>
            </View>
            {services.map((s: any, index: number) => (
              <View key={index} style={[styles.tableRow, index % 2 === 0 ? styles.tableRowEven : {}]}>
                <Text style={[styles.tableCell, { flex: 3 }]}>{LanguageHandler.translateServiceName(s?.serviceId?.name || s?.name || '', 'ar')}</Text>
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
              <Text style={[styles.tableHeaderText, { flex: 3 }]}>اسم القطعة</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>الكمية</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>تكلفة الوحدة</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>المجموع</Text>
            </View>
            {parts.map((p: any, index: number) => (
              <View key={index} style={[styles.tableRow, index % 2 === 0 ? styles.tableRowEven : {}]}>
                <Text style={[styles.tableCell, { flex: 3 }]}>{LanguageHandler.translatePartName(p?.partId?.name || p?.name || '', 'ar')}</Text>
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
            <Text style={styles.totalText}>المجموع الفرعي:</Text>
            <Text style={styles.totalText}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalText}>الضريبة (15%):</Text>
            <Text style={styles.totalText}>{formatCurrency(tax)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.grandTotalText}>المجموع الإجمالي:</Text>
            <Text style={styles.grandTotalText}>{formatCurrency(grandTotal)}</Text>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesTitle}>ملاحظات</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>تم الإنشاء في {formatDate(new Date())}</Text>
          <Text>نظام إدارة صيانة السيارات تيرا موتورز</Text>
        </View>
      </Page>
    </Document>
  );
};

export class ArabicServerlessPDFGenerator {
  async generateInvoicePDF(
    invoice: any,
    jobCard: any,
    options: ArabicPDFOptions = {}
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
        <ArabicInvoicePDFDocument
          invoice={invoice}
          jobCard={jobCard}
          options={options}
          qrCodeDataUrl={qrCodeDataUrl}
        />
      );

      return pdfBuffer;
    } catch (error) {
      console.error('Error generating Arabic PDF:', error);
      throw new Error('Failed to generate Arabic PDF: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
