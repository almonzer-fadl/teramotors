import { connectToDatabase } from './db';
import Customer from './models/Customer';
import Vehicle from './models/Vehicle';
import Appointment from './models/Appointment';
import JobCard from './models/JobCard';
import Invoice from './models/Invoice';
import Estimate from './models/Estimate';
import Part from './models/Part';

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  dateFrom?: Date;
  dateTo?: Date;
  status?: string[];
  includeInactive?: boolean;
}

export interface ExportResult {
  success: boolean;
  data?: any;
  filename?: string;
  error?: string;
}

export class ExportService {
  static async exportCustomers(options: ExportOptions): Promise<ExportResult> {
    try {
      await connectToDatabase();
      
      const query: any = {};
      if (!options.includeInactive) {
        query.isActive = true;
      }

      const customers = await Customer.find(query).sort({ createdAt: -1 });
      
      if (options.format === 'csv') {
        return this.exportToCSV(customers, 'customers', this.getCustomerCSVHeaders());
      } else if (options.format === 'excel') {
        return this.exportToExcel(customers, 'customers', this.getCustomerCSVHeaders());
      } else {
        return this.exportToPDF(customers, 'customers', 'Customer Report');
      }
    } catch (error) {
      return { success: false, error: 'Failed to export customers' };
    }
  }

  static async exportVehicles(options: ExportOptions): Promise<ExportResult> {
    try {
      await connectToDatabase();
      
      const query: any = {};
      if (!options.includeInactive) {
        query.isActive = true;
      }

      const vehicles = await Vehicle.find(query)
        .populate('customerId', 'firstName lastName email phone')
        .sort({ createdAt: -1 });
      
      if (options.format === 'csv') {
        return this.exportToCSV(vehicles, 'vehicles', this.getVehicleCSVHeaders());
      } else if (options.format === 'excel') {
        return this.exportToExcel(vehicles, 'vehicles', this.getVehicleCSVHeaders());
      } else {
        return this.exportToPDF(vehicles, 'vehicles', 'Vehicle Report');
      }
    } catch (error) {
      return { success: false, error: 'Failed to export vehicles' };
    }
  }

  static async exportAppointments(options: ExportOptions): Promise<ExportResult> {
    try {
      await connectToDatabase();
      
      const query: any = {};
      
      if (options.dateFrom || options.dateTo) {
        query.appointmentDate = {};
        if (options.dateFrom) query.appointmentDate.$gte = options.dateFrom;
        if (options.dateTo) query.appointmentDate.$lte = options.dateTo;
      }
      
      if (options.status) {
        query.status = { $in: options.status };
      }

      const appointments = await Appointment.find(query)
        .populate('customerId', 'firstName lastName email phone')
        .populate('vehicleId', 'make model licensePlate year')
        .populate('serviceId', 'name description')
        .sort({ appointmentDate: -1 });
      
      if (options.format === 'csv') {
        return this.exportToCSV(appointments, 'appointments', this.getAppointmentCSVHeaders());
      } else if (options.format === 'excel') {
        return this.exportToExcel(appointments, 'appointments', this.getAppointmentCSVHeaders());
      } else {
        return this.exportToPDF(appointments, 'appointments', 'Appointment Report');
      }
    } catch (error) {
      return { success: false, error: 'Failed to export appointments' };
    }
  }

  static async exportJobCards(options: ExportOptions): Promise<ExportResult> {
    try {
      await connectToDatabase();
      
      const query: any = {};
      
      if (options.dateFrom || options.dateTo) {
        query.createdAt = {};
        if (options.dateFrom) query.createdAt.$gte = options.dateFrom;
        if (options.dateTo) query.createdAt.$lte = options.dateTo;
      }
      
      if (options.status) {
        query.status = { $in: options.status };
      }

      const jobCards = await JobCard.find(query)
        .populate('customerId', 'firstName lastName email phone')
        .populate('vehicleId', 'make model licensePlate year')
        .populate('mechanicId', 'firstName lastName')
        .sort({ createdAt: -1 });
      
      if (options.format === 'csv') {
        return this.exportToCSV(jobCards, 'job-cards', this.getJobCardCSVHeaders());
      } else if (options.format === 'excel') {
        return this.exportToExcel(jobCards, 'job-cards', this.getJobCardCSVHeaders());
      } else {
        return this.exportToPDF(jobCards, 'job-cards', 'Job Card Report');
      }
    } catch (error) {
      return { success: false, error: 'Failed to export job cards' };
    }
  }

  static async exportInvoices(options: ExportOptions): Promise<ExportResult> {
    try {
      await connectToDatabase();
      
      const query: any = {};
      
      if (options.dateFrom || options.dateTo) {
        query.createdAt = {};
        if (options.dateFrom) query.createdAt.$gte = options.dateFrom;
        if (options.dateTo) query.createdAt.$lte = options.dateTo;
      }
      
      if (options.status) {
        query.status = { $in: options.status };
      }

      const invoices = await Invoice.find(query)
        .populate('customerId', 'firstName lastName email phone')
        .populate('vehicleId', 'make model licensePlate year')
        .sort({ createdAt: -1 });
      
      if (options.format === 'csv') {
        return this.exportToCSV(invoices, 'invoices', this.getInvoiceCSVHeaders());
      } else if (options.format === 'excel') {
        return this.exportToExcel(invoices, 'invoices', this.getInvoiceCSVHeaders());
      } else {
        return this.exportToPDF(invoices, 'invoices', 'Invoice Report');
      }
    } catch (error) {
      return { success: false, error: 'Failed to export invoices' };
    }
  }

  static async exportEstimates(options: ExportOptions): Promise<ExportResult> {
    try {
      await connectToDatabase();
      
      const query: any = {};
      
      if (options.dateFrom || options.dateTo) {
        query.createdAt = {};
        if (options.dateFrom) query.createdAt.$gte = options.dateFrom;
        if (options.dateTo) query.createdAt.$lte = options.dateTo;
      }
      
      if (options.status) {
        query.status = { $in: options.status };
      }

      const estimates = await Estimate.find(query)
        .populate('customerId', 'firstName lastName email phone')
        .populate('vehicleId', 'make model licensePlate year')
        .sort({ createdAt: -1 });
      
      if (options.format === 'csv') {
        return this.exportToCSV(estimates, 'estimates', this.getEstimateCSVHeaders());
      } else if (options.format === 'excel') {
        return this.exportToExcel(estimates, 'estimates', this.getEstimateCSVHeaders());
      } else {
        return this.exportToPDF(estimates, 'estimates', 'Estimate Report');
      }
    } catch (error) {
      return { success: false, error: 'Failed to export estimates' };
    }
  }

  static async exportInventory(options: ExportOptions): Promise<ExportResult> {
    try {
      await connectToDatabase();
      
      const query: any = {};
      if (!options.includeInactive) {
        query.isActive = true;
      }

      const parts = await Part.find(query).sort({ name: 1 });
      
      if (options.format === 'csv') {
        return this.exportToCSV(parts, 'inventory', this.getInventoryCSVHeaders());
      } else if (options.format === 'excel') {
        return this.exportToExcel(parts, 'inventory', this.getInventoryCSVHeaders());
      } else {
        return this.exportToPDF(parts, 'inventory', 'Inventory Report');
      }
    } catch (error) {
      return { success: false, error: 'Failed to export inventory' };
    }
  }

  // CSV Export Methods
  private static exportToCSV(data: any[], filename: string, headers: string[]): ExportResult {
    try {
      const csvContent = this.generateCSV(data, headers);
      const timestamp = new Date().toISOString().split('T')[0];
      const finalFilename = `${filename}-${timestamp}.csv`;
      
      return {
        success: true,
        data: csvContent,
        filename: finalFilename
      };
    } catch (error) {
      return { success: false, error: 'Failed to generate CSV' };
    }
  }

  private static generateCSV(data: any[], headers: string[]): string {
    const csvRows = [];
    
    // Add headers
    csvRows.push(headers.join(','));
    
    // Add data rows
    data.forEach(item => {
      const row = headers.map(header => {
        const value = this.getNestedValue(item, header);
        return this.escapeCSVValue(value);
      });
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  }

  private static escapeCSVValue(value: any): string {
    if (value === null || value === undefined) return '';
    
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    
    return stringValue;
  }

  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : '';
    }, obj);
  }

  // Excel Export Methods
  private static exportToExcel(data: any[], filename: string, headers: string[]): ExportResult {
    try {
      // This would use a library like xlsx to generate Excel files
      // For now, return CSV format
      return this.exportToCSV(data, filename, headers);
    } catch (error) {
      return { success: false, error: 'Failed to generate Excel file' };
    }
  }

  // PDF Export Methods
  private static exportToPDF(data: any[], filename: string, title: string): ExportResult {
    try {
      // This would use a PDF generation library
      // For now, return a placeholder
      return {
        success: true,
        data: `PDF export for ${title} with ${data.length} records`,
        filename: `${filename}-${new Date().toISOString().split('T')[0]}.pdf`
      };
    } catch (error) {
      return { success: false, error: 'Failed to generate PDF' };
    }
  }

  // CSV Headers
  private static getCustomerCSVHeaders(): string[] {
    return [
      'firstName',
      'lastName',
      'email',
      'phone',
      'address',
      'city',
      'state',
      'zipCode',
      'dateOfBirth',
      'createdAt',
      'isActive'
    ];
  }

  private static getVehicleCSVHeaders(): string[] {
    return [
      'make',
      'model',
      'year',
      'licensePlate',
      'vin',
      'color',
      'customerId.firstName',
      'customerId.lastName',
      'customerId.email',
      'customerId.phone',
      'createdAt',
      'isActive'
    ];
  }

  private static getAppointmentCSVHeaders(): string[] {
    return [
      'appointmentDate',
      'startTime',
      'endTime',
      'status',
      'customerId.firstName',
      'customerId.lastName',
      'customerId.email',
      'customerId.phone',
      'vehicleId.make',
      'vehicleId.model',
      'vehicleId.licensePlate',
      'serviceId.name',
      'notes',
      'createdAt'
    ];
  }

  private static getJobCardCSVHeaders(): string[] {
    return [
      'jobNumber',
      'description',
      'status',
      'priority',
      'customerId.firstName',
      'customerId.lastName',
      'customerId.email',
      'customerId.phone',
      'vehicleId.make',
      'vehicleId.model',
      'vehicleId.licensePlate',
      'mechanicId.firstName',
      'mechanicId.lastName',
      'estimatedHours',
      'actualHours',
      'createdAt'
    ];
  }

  private static getInvoiceCSVHeaders(): string[] {
    return [
      'invoiceNumber',
      'status',
      'totalAmount',
      'vatAmount',
      'customerId.firstName',
      'customerId.lastName',
      'customerId.email',
      'customerId.phone',
      'vehicleId.make',
      'vehicleId.model',
      'vehicleId.licensePlate',
      'dueDate',
      'createdAt'
    ];
  }

  private static getEstimateCSVHeaders(): string[] {
    return [
      'estimateNumber',
      'status',
      'totalAmount',
      'customerId.firstName',
      'customerId.lastName',
      'customerId.email',
      'customerId.phone',
      'vehicleId.make',
      'vehicleId.model',
      'vehicleId.licensePlate',
      'validUntil',
      'createdAt'
    ];
  }

  private static getInventoryCSVHeaders(): string[] {
    return [
      'name',
      'partNumber',
      'description',
      'category',
      'manufacturer',
      'stockQuantity',
      'minStockLevel',
      'costPrice',
      'sellingPrice',
      'location',
      'createdAt',
      'isActive'
    ];
  }
}

export default ExportService;
