/* eslint-disable jsx-a11y/alt-text */
'use client';

import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { 
    flexDirection: 'column', 
    backgroundColor: '#ffffff', 
    padding: 30,
    direction: 'rtl',
    fontFamily: 'Helvetica'
  },
  header: { fontSize: 24, marginBottom: 20, textAlign: 'center', color: '#111827', fontWeight: 'bold' },
  metaRow: { fontSize: 12, marginBottom: 4, color: '#374151' },
  sectionTitle: { fontSize: 14, marginTop: 16, marginBottom: 8, color: '#111827', fontWeight: 'bold' },
  text: { fontSize: 12, marginBottom: 4, color: '#374151' },
  table: { width: '100%', borderStyle: 'solid', borderWidth: 1, borderColor: '#e5e7eb', marginTop: 8 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  tableColHeader: { 
    width: '25%', 
    borderStyle: 'solid', 
    borderWidth: 1, 
    borderColor: '#e5e7eb', 
    backgroundColor: '#f9fafb', 
    padding: 8, 
    fontSize: 12, 
    fontWeight: 'bold',
    textAlign: 'center'
  },
  tableCol: { 
    width: '25%', 
    borderStyle: 'solid', 
    borderWidth: 1, 
    borderColor: '#e5e7eb', 
    padding: 8, 
    fontSize: 12,
    textAlign: 'center'
  },
  totalsRow: { marginTop: 16, padding: 8, backgroundColor: '#f9fafb' },
  qrContainer: { 
    position: 'absolute', 
    top: 30, 
    right: 30, 
    width: 120, 
    height: 120,
    alignItems: 'center',
    justifyContent: 'center'
  },
  qrCode: { width: 100, height: 100 },
  qrLabel: { fontSize: 10, marginTop: 4, textAlign: 'center', fontWeight: 'bold' },
});

function t(key: string) {
  const dict: Record<string, string> = {
    invoice: 'فاتورة',
    date: 'التاريخ',
    dueDate: 'تاريخ الاستحقاق',
    customerInformation: 'معلومات العميل',
    vehicleInformation: 'معلومات المركبة',
    services: 'الخدمات',
    service: 'الخدمة',
    qty: 'الكمية',
    laborCost: 'تكلفة العمل',
    total: 'الإجمالي',
    parts: 'القطع',
    part: 'القطعة',
    cost: 'التكلفة',
    notes: 'ملاحظات',
    subtotal: 'المجموع الفرعي',
    grandTotal: 'الإجمالي الكلي',
  };
  return dict[key] || key;
}

function formatCurrency(value: number) {
  return `${value.toFixed(2)}`;
}

interface InvoiceDocumentProps {
  invoice: any;
  jobCard?: any;
  qrCodeData?: string;
}

const InvoiceDocument = ({ invoice, jobCard, qrCodeData }: InvoiceDocumentProps) => {

  const services = jobCard?.services || [];
  const parts = jobCard?.partsUsed || [];
  const servicesTotal = services.reduce((sum: number, s: any) => sum + (s.laborHours * s.laborRate), 0);
  const partsTotal = parts.reduce((sum: number, p: any) => sum + (p.quantity * p.cost), 0);
  const subtotal = servicesTotal + partsTotal;
  const grandTotal = typeof invoice.totalAmount === 'number' ? invoice.totalAmount : subtotal;

  // Use ZATCA QR code image if available, otherwise generate from data
  const qrCodeUrl = qrCodeData ? 
    (qrCodeData.startsWith('data:') ? qrCodeData : `data:image/png;base64,${qrCodeData}`) : 
    null;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* QR Code in top right corner */}
        {qrCodeUrl && (
          <View style={styles.qrContainer}>
            <Image style={styles.qrCode} src={qrCodeUrl} />
            <Text style={styles.qrLabel}>ZATCA QR</Text>
          </View>
        )}

        <Text style={styles.header}>
          فاتورة #{String(invoice._id || '').slice(-6)}
        </Text>
        <Text style={styles.metaRow}>التاريخ: {new Date(invoice.createdAt || Date.now()).toLocaleDateString()}</Text>
        <Text style={styles.metaRow}>تاريخ الاستحقاق: {new Date(invoice.dueDate || Date.now()).toLocaleDateString()}</Text>

        <Text style={styles.sectionTitle}>معلومات العميل</Text>
        <Text style={styles.text}>
          {(invoice.customerId?.firstName || '') + ' ' + (invoice.customerId?.lastName || '')}
        </Text>
        {invoice.customerId?.email ? <Text style={styles.text}>{invoice.customerId.email}</Text> : null}
        {invoice.customerId?.phone ? <Text style={styles.text}>{invoice.customerId.phone}</Text> : null}

        <Text style={styles.sectionTitle}>معلومات المركبة</Text>
        {invoice.vehicleId ? (
          <>
            <Text style={styles.text}>{invoice.vehicleId.year} {invoice.vehicleId.make} {invoice.vehicleId.model}</Text>
            {invoice.vehicleId.licensePlate ? <Text style={styles.text}>{invoice.vehicleId.licensePlate}</Text> : null}
          </>
        ) : null}

        {services.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>الخدمات</Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={styles.tableColHeader}>الخدمة</Text>
                <Text style={styles.tableColHeader}>الكمية</Text>
                <Text style={styles.tableColHeader}>تكلفة العمل</Text>
                <Text style={styles.tableColHeader}>الإجمالي</Text>
              </View>
              {services.map((s: any, idx: number) => (
                <View style={styles.tableRow} key={idx}>
                  <Text style={styles.tableCol}>{s.serviceId?.name || ''}</Text>
                  <Text style={styles.tableCol}>{s.quantity}</Text>
                  <Text style={styles.tableCol}>{formatCurrency(s.laborHours * s.laborRate)}</Text>
                  <Text style={styles.tableCol}>{formatCurrency(s.laborHours * s.laborRate)}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {parts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>القطع</Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={styles.tableColHeader}>القطعة</Text>
                <Text style={styles.tableColHeader}>الكمية</Text>
                <Text style={styles.tableColHeader}>التكلفة</Text>
                <Text style={styles.tableColHeader}>الإجمالي</Text>
              </View>
              {parts.map((p: any, idx: number) => (
                <View style={styles.tableRow} key={idx}>
                  <Text style={styles.tableCol}>{p.partId?.name || ''}</Text>
                  <Text style={styles.tableCol}>{p.quantity}</Text>
                  <Text style={styles.tableCol}>{formatCurrency(p.cost)}</Text>
                  <Text style={styles.tableCol}>{formatCurrency(p.quantity * p.cost)}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={styles.totalsRow}>
          <Text style={styles.text}>المجموع الفرعي: {formatCurrency(subtotal)}</Text>
          <Text style={styles.text}>الإجمالي الكلي: {formatCurrency(grandTotal)}</Text>
        </View>

        {invoice.notes ? (
          <>
            <Text style={styles.sectionTitle}>ملاحظات</Text>
            <Text style={styles.text}>{invoice.notes}</Text>
          </>
        ) : null}
      </Page>
    </Document>
  );
};

export default InvoiceDocument;


