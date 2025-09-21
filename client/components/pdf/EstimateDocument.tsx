'use client';

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { flexDirection: 'column', backgroundColor: '#E4E4E4', padding: 30 },
  section: { margin: 10, padding: 10, flexGrow: 1 },
  header: { fontSize: 24, marginBottom: 20, textAlign: 'center', color: '#333' },
  subHeader: { fontSize: 18, marginBottom: 10, color: '#555' },
  text: { fontSize: 12, marginBottom: 5 },
  table: { width: 'auto', borderStyle: 'solid', borderWidth: 1, borderColor: '#bfbfbf', marginBottom: 10 },
  tableRow: { margin: 'auto', flexDirection: 'row' },
  tableColHeader: { width: '25%', borderStyle: 'solid', borderWidth: 1, borderColor: '#bfbfbf', backgroundColor: '#f0f0f0', padding: 5 },
  tableCol: { width: '25%', borderStyle: 'solid', borderWidth: 1, borderColor: '#bfbfbf', padding: 5 },
});

const EstimateDocument = ({ estimate }: { estimate: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.header}>Estimate #{estimate._id.slice(-6)}</Text>
        <Text style={styles.text}>Date: {new Date(estimate.createdAt).toLocaleDateString()}</Text>
        <Text style={styles.text}>Valid Until: {new Date(estimate.validUntil).toLocaleDateString()}</Text>

        <Text style={styles.subHeader}>Customer Information</Text>
        <Text style={styles.text}>Name: {estimate.customerId.firstName} {estimate.customerId.lastName}</Text>
        <Text style={styles.text}>Email: {estimate.customerId.email}</Text>
        <Text style={styles.text}>Phone: {estimate.customerId.phone}</Text>

        <Text style={styles.subHeader}>Vehicle Information</Text>
        <Text style={styles.text}>Make: {estimate.vehicleId.make}</Text>
        <Text style={styles.text}>Model: {estimate.vehicleId.model}</Text>
        <Text style={styles.text}>Year: {estimate.vehicleId.year}</Text>
        <Text style={styles.text}>License Plate: {estimate.vehicleId.licensePlate}</Text>

        <Text style={styles.subHeader}>Services</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableColHeader}>Service</Text>
            <Text style={styles.tableColHeader}>Quantity</Text>
            <Text style={styles.tableColHeader}>Labor Cost</Text>
            <Text style={styles.tableColHeader}>Total</Text>
          </View>
          {estimate.services.map((service: any, index: number) => (
            <View style={styles.tableRow} key={index}>
              <Text style={styles.tableCol}>{service.serviceId.name}</Text>
              <Text style={styles.tableCol}>{service.quantity}</Text>
              <Text style={styles.tableCol}>${service.laborCost.toFixed(2)}</Text>
              <Text style={styles.tableCol}>${service.totalCost.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.text}>Subtotal: ${estimate.subtotal.toFixed(2)}</Text>
        <Text style={styles.text}>Tax: ${estimate.tax.toFixed(2)}</Text>
        <Text style={styles.text}>Total: ${estimate.total.toFixed(2)}</Text>

        {estimate.notes && <Text style={styles.text}>Notes: {estimate.notes}</Text>}
      </View>
    </Page>
  </Document>
);

export default EstimateDocument;
