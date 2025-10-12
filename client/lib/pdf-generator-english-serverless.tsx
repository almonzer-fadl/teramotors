/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import { LanguageHandler } from './language-handler';

// Register English font
Font.register({
  family: 'Roboto',
  src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf',
});

export interface EnglishPDFOptions {
  includeQRCode?: boolean;
  format?: 'A4' | 'Letter';
}

// Define styles for English
const createStyles = () => StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Roboto',
    direction: 'ltr',
  },
  header: {
    borderBottomWidth: 3,
    borderBottomColor: '#F13F33',
    paddingBottom: 20,
    marginBottom: 30,
    flexDirection: 'row',
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
    textAlign: 'left',
  },
  invoiceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
    textAlign: 'left',
  },
  qrCode: {
    width: 100,
    height: 100,
    marginLeft: 20,
  },
  infoSection: {
    flexDirection: 'row',
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
    textAlign: 'left',
  },
  infoText: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 5,
    textAlign: 'left',
    lineHeight: 1.5,
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F13F33',
    padding: 8,
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'left',
  },
  tableRow: {
    flexDirection: 'row',
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
    textAlign: 'left',
  },
  totals: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
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
    borderLeftWidth: 4,
    borderColor: '#F13F33',
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F13F33',
    marginBottom: 8,
    textAlign: 'left',
  },
  notesText: {
    fontSize: 10,
    color: '#666666',
    textAlign: 'left',
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

interface EnglishInvoicePDFDocumentProps {
  invoice: any;
  jobCard: any;
  options: EnglishPDFOptions;
  qrCodeDataUrl?: string;
}

const EnglishInvoicePDFDocument: React.FC<EnglishInvoicePDFDocumentProps> = ({
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
    return `SAR ${amount.toFixed(2)}`;
  };

  // Text function with proper Unicode handling and translation for English
  const getText = (text: string | undefined | null): string => {
    if (!text) return '';
    return LanguageHandler.translateText(text, { targetLanguage: 'en' });
  };

  const getStatusText = (status: string): string => {
    return LanguageHandler.translateStatus(status, 'en');
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.companyName}>TeraMotors Auto Repair</Text>
            <Text style={styles.invoiceTitle}>
              Invoice #{String(invoice?._id || '').slice(-6)}
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
              Invoice #{String(invoice?._id || '').slice(-6)}
            </Text>
            <Text style={styles.infoText}>
              <Text style={{ fontWeight: 'bold' }}>Date:</Text> {formatDate(invoice?.createdAt || Date.now())}
            </Text>
            <Text style={styles.infoText}>
              <Text style={{ fontWeight: 'bold' }}>Due Date:</Text> {formatDate(invoice?.dueDate || Date.now())}
            </Text>
            <Text style={styles.infoText}>
              <Text style={{ fontWeight: 'bold' }}>Status:</Text> {getStatusText(invoice?.status || 'pending')}
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Customer Information</Text>
            <Text style={styles.infoText}>
              <Text style={{ fontWeight: 'bold' }}>Customer:</Text>{' '}
              {LanguageHandler.translateCustomerName(
                invoice?.customerId?.firstName, 
                invoice?.customerId?.lastName, 
                'en'
              )}
            </Text>
            {invoice?.customerId?.email && (
              <Text style={styles.infoText}>
                <Text style={{ fontWeight: 'bold' }}>Email:</Text> {LanguageHandler.translateEmail(invoice.customerId.email, 'en')}
              </Text>
            )}
            {invoice?.customerId?.phone && (
              <Text style={styles.infoText}>
                <Text style={{ fontWeight: 'bold' }}>Phone:</Text> {LanguageHandler.translatePhone(invoice.customerId.phone, 'en')}
              </Text>
            )}
          </View>
        </View>

        {/* Vehicle Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Vehicle Information</Text>
            {invoice?.vehicleId ? (
              <>
                <Text style={styles.infoText}>
                  <Text style={{ fontWeight: 'bold' }}>Vehicle:</Text>{' '}
                  {invoice.vehicleId.year} {LanguageHandler.translateVehicleMake(invoice.vehicleId.make, 'en')} {getText(invoice.vehicleId.model)}
                </Text>
                {invoice.vehicleId.licensePlate && (
                  <Text style={styles.infoText}>
                    <Text style={{ fontWeight: 'bold' }}>License Plate:</Text> {LanguageHandler.translateLicensePlate(invoice.vehicleId.licensePlate, 'en')}
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
              <Text style={[styles.tableHeaderText, { flex: 3 }]}>Service</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Quantity</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Hours</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Rate</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Total</Text>
            </View>
            {services.map((s: any, index: number) => (
              <View key={index} style={[styles.tableRow, index % 2 === 0 ? styles.tableRowEven : {}]}>
                <Text style={[styles.tableCell, { flex: 3 }]}>{LanguageHandler.translateServiceName(s?.serviceId?.name || s?.name || '', 'en')}</Text>
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
              <Text style={[styles.tableHeaderText, { flex: 3 }]}>Part Name</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Quantity</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Unit Cost</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Total</Text>
            </View>
            {parts.map((p: any, index: number) => (
              <View key={index} style={[styles.tableRow, index % 2 === 0 ? styles.tableRowEven : {}]}>
                <Text style={[styles.tableCell, { flex: 3 }]}>{LanguageHandler.translatePartName(p?.partId?.name || p?.name || '', 'en')}</Text>
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
            <Text style={styles.totalText}>Subtotal:</Text>
            <Text style={styles.totalText}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalText}>Tax (15%):</Text>
            <Text style={styles.totalText}>{formatCurrency(tax)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.grandTotalText}>Grand Total:</Text>
            <Text style={styles.grandTotalText}>{formatCurrency(grandTotal)}</Text>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Generated on {formatDate(new Date())}</Text>
          <Text>TeraMotors Auto Repair Management System</Text>
        </View>
      </Page>
    </Document>
  );
};

export class EnglishServerlessPDFGenerator {
  async generateInvoicePDF(
    invoice: any,
    jobCard: any,
    options: EnglishPDFOptions = {}
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
        <EnglishInvoicePDFDocument
          invoice={invoice}
          jobCard={jobCard}
          options={options}
          qrCodeDataUrl={qrCodeDataUrl}
        />
      );

      return pdfBuffer;
    } catch (error) {
      console.error('Error generating English PDF:', error);
      throw new Error('Failed to generate English PDF: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
