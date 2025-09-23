'use client';

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register a font that supports Arabic shaping (Amiri as an example if available in environment)
// Consumers can pass custom font family via props if needed
try {
  Font.register({ family: 'Amiri', src: 'https://fonts.gstatic.com/s/amiri/v22/J7aRnpd8CGxBHpUrtL8.woff2' });
} catch {}

const styles = StyleSheet.create({
  page: { flexDirection: 'column', backgroundColor: '#ffffff', padding: 30 },
  header: { fontSize: 20, marginBottom: 12, textAlign: 'center', color: '#111827' },
  metaRow: { fontSize: 10, marginBottom: 2, color: '#374151' },
  sectionTitle: { fontSize: 12, marginTop: 12, marginBottom: 6, color: '#111827' },
  text: { fontSize: 10, marginBottom: 2, color: '#374151' },
  table: { width: 'auto', borderStyle: 'solid', borderWidth: 1, borderColor: '#e5e7eb', marginTop: 6 },
  tableRow: { margin: 'auto', flexDirection: 'row' },
  tableColHeader: { width: '25%', borderStyle: 'solid', borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#f9fafb', padding: 6, fontSize: 10, fontWeight: 700 },
  tableCol: { width: '25%', borderStyle: 'solid', borderWidth: 1, borderColor: '#e5e7eb', padding: 6, fontSize: 10 },
  totalsRow: { marginTop: 8 },
  rtl: { direction: 'rtl', fontFamily: 'Amiri' },
});

type Language = 'en' | 'ar';

function tEn(key: string) {
  const dict: Record<string, string> = {
    invoice: 'Invoice',
    date: 'Date',
    dueDate: 'Due Date',
    customerInformation: 'Customer Information',
    vehicleInformation: 'Vehicle Information',
    services: 'Services',
    service: 'Service',
    qty: 'Quantity',
    laborCost: 'Labor Cost',
    total: 'Total',
    parts: 'Parts',
    part: 'Part',
    cost: 'Cost',
    notes: 'Notes',
    subtotal: 'Subtotal',
    grandTotal: 'Grand Total',
  };
  return dict[key] || key;
}

function tAr(key: string) {
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
  language?: Language;
}

const InvoiceDocument = ({ invoice, jobCard, language = 'en' }: InvoiceDocumentProps) => {
  const isArabic = language === 'ar';
  const tr = isArabic ? tAr : tEn;

  const services = jobCard?.services || [];
  const parts = jobCard?.partsUsed || [];
  const servicesTotal = services.reduce((sum: number, s: any) => sum + (s.laborHours * s.laborRate), 0);
  const partsTotal = parts.reduce((sum: number, p: any) => sum + (p.quantity * p.cost), 0);
  const subtotal = servicesTotal + partsTotal;
  const grandTotal = typeof invoice.totalAmount === 'number' ? invoice.totalAmount : subtotal;

  return (
    <Document>
      <Page size="A4" style={[styles.page, isArabic ? styles.rtl : {}] as any}>
        <Text style={styles.header}>
          {tr('invoice')} #{String(invoice._id || '').slice(-6)}
        </Text>
        <Text style={styles.metaRow}>{tr('date')}: {new Date(invoice.createdAt || Date.now()).toLocaleDateString()}</Text>
        <Text style={styles.metaRow}>{tr('dueDate')}: {new Date(invoice.dueDate || Date.now()).toLocaleDateString()}</Text>

        <Text style={styles.sectionTitle}>{tr('customerInformation')}</Text>
        <Text style={styles.text}>
          {(invoice.customerId?.firstName || '') + ' ' + (invoice.customerId?.lastName || '')}
        </Text>
        {invoice.customerId?.email ? <Text style={styles.text}>{invoice.customerId.email}</Text> : null}
        {invoice.customerId?.phone ? <Text style={styles.text}>{invoice.customerId.phone}</Text> : null}

        <Text style={styles.sectionTitle}>{tr('vehicleInformation')}</Text>
        {invoice.vehicleId ? (
          <>
            <Text style={styles.text}>{invoice.vehicleId.year} {invoice.vehicleId.make} {invoice.vehicleId.model}</Text>
            {invoice.vehicleId.licensePlate ? <Text style={styles.text}>{invoice.vehicleId.licensePlate}</Text> : null}
          </>
        ) : null}

        {services.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{tr('services')}</Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={styles.tableColHeader}>{tr('service')}</Text>
                <Text style={styles.tableColHeader}>{tr('qty')}</Text>
                <Text style={styles.tableColHeader}>{tr('laborCost')}</Text>
                <Text style={styles.tableColHeader}>{tr('total')}</Text>
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
            <Text style={styles.sectionTitle}>{tr('parts')}</Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={styles.tableColHeader}>{tr('part')}</Text>
                <Text style={styles.tableColHeader}>{tr('qty')}</Text>
                <Text style={styles.tableColHeader}>{tr('cost')}</Text>
                <Text style={styles.tableColHeader}>{tr('total')}</Text>
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
          <Text style={styles.text}>{tr('subtotal')}: {formatCurrency(subtotal)}</Text>
          <Text style={styles.text}>{tr('grandTotal')}: {formatCurrency(grandTotal)}</Text>
        </View>

        {invoice.notes ? (
          <>
            <Text style={styles.sectionTitle}>{tr('notes')}</Text>
            <Text style={styles.text}>{invoice.notes}</Text>
          </>
        ) : null}
      </Page>
    </Document>
  );
};

export default InvoiceDocument;


