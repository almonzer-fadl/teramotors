import { connectToDatabase } from './db';
import Customer from './models/Customer';
import Vehicle from './models/Vehicle';
import Appointment from './models/Appointment';
import JobCard from './models/JobCard';
import Invoice from './models/Invoice';
import Estimate from './models/Estimate';
import Part from './models/Part';
import { cacheService } from './cache';

// Database query optimization
export class DatabaseOptimizer {
  static async optimizeCustomerQueries() {
    try {
      await connectToDatabase();
      
      // Create indexes for frequently queried fields
      await Customer.collection.createIndex({ email: 1 }, { unique: true });
      await Customer.collection.createIndex({ phone: 1 });
      await Customer.collection.createIndex({ firstName: 1, lastName: 1 });
      await Customer.collection.createIndex({ createdAt: -1 });
      await Customer.collection.createIndex({ isActive: 1 });
      
      if (process.env.NODE_ENV === 'development') {
      }
    } catch (error) {
    }
  }

  static async optimizeVehicleQueries() {
    try {
      await connectToDatabase();
      
      await Vehicle.collection.createIndex({ licensePlate: 1 }, { unique: true });
      await Vehicle.collection.createIndex({ vin: 1 });
      await Vehicle.collection.createIndex({ customerId: 1 });
      await Vehicle.collection.createIndex({ make: 1, model: 1 });
      await Vehicle.collection.createIndex({ year: 1 });
      await Vehicle.collection.createIndex({ createdAt: -1 });
      await Vehicle.collection.createIndex({ isActive: 1 });
      
      if (process.env.NODE_ENV === 'development') {
      }
    } catch (error) {
    }
  }

  static async optimizeAppointmentQueries() {
    try {
      await connectToDatabase();
      
      await Appointment.collection.createIndex({ appointmentDate: 1 });
      await Appointment.collection.createIndex({ customerId: 1 });
      await Appointment.collection.createIndex({ vehicleId: 1 });
      await Appointment.collection.createIndex({ serviceId: 1 });
      await Appointment.collection.createIndex({ status: 1 });
      await Appointment.collection.createIndex({ createdAt: -1 });
      await Appointment.collection.createIndex({ 
        appointmentDate: 1, 
        status: 1 
      });
      
      if (process.env.NODE_ENV === 'development') {
      }
    } catch (error) {
    }
  }

  static async optimizeJobCardQueries() {
    try {
      await connectToDatabase();
      
      await JobCard.collection.createIndex({ jobNumber: 1 }, { unique: true });
      await JobCard.collection.createIndex({ customerId: 1 });
      await JobCard.collection.createIndex({ vehicleId: 1 });
      await JobCard.collection.createIndex({ mechanicId: 1 });
      await JobCard.collection.createIndex({ status: 1 });
      await JobCard.collection.createIndex({ priority: 1 });
      await JobCard.collection.createIndex({ createdAt: -1 });
      await JobCard.collection.createIndex({ 
        status: 1, 
        createdAt: -1 
      });
      
      if (process.env.NODE_ENV === 'development') {
      }
    } catch (error) {
    }
  }

  static async optimizeInvoiceQueries() {
    try {
      await connectToDatabase();
      
      await Invoice.collection.createIndex({ invoiceNumber: 1 }, { unique: true });
      await Invoice.collection.createIndex({ customerId: 1 });
      await Invoice.collection.createIndex({ vehicleId: 1 });
      await Invoice.collection.createIndex({ status: 1 });
      await Invoice.collection.createIndex({ createdAt: -1 });
      await Invoice.collection.createIndex({ dueDate: 1 });
      await Invoice.collection.createIndex({ 
        status: 1, 
        createdAt: -1 
      });
      
      if (process.env.NODE_ENV === 'development') {
      }
    } catch (error) {
    }
  }

  static async optimizeEstimateQueries() {
    try {
      await connectToDatabase();
      
      await Estimate.collection.createIndex({ estimateNumber: 1 }, { unique: true });
      await Estimate.collection.createIndex({ customerId: 1 });
      await Estimate.collection.createIndex({ vehicleId: 1 });
      await Estimate.collection.createIndex({ status: 1 });
      await Estimate.collection.createIndex({ createdAt: -1 });
      await Estimate.collection.createIndex({ validUntil: 1 });
      
      if (process.env.NODE_ENV === 'development') {
      }
    } catch (error) {
    }
  }

  static async optimizePartQueries() {
    try {
      await connectToDatabase();
      
      await Part.collection.createIndex({ partNumber: 1 }, { unique: true });
      await Part.collection.createIndex({ name: 1 });
      await Part.collection.createIndex({ category: 1 });
      await Part.collection.createIndex({ manufacturer: 1 });
      await Part.collection.createIndex({ stockQuantity: 1 });
      await Part.collection.createIndex({ isActive: 1 });
      await Part.collection.createIndex({ createdAt: -1 });
      await Part.collection.createIndex({ 
        category: 1, 
        isActive: 1 
      });
      
      if (process.env.NODE_ENV === 'development') {
      }
    } catch (error) {
    }
  }

  static async createAllIndexes() {
    if (process.env.NODE_ENV === 'development') {
    }
    
    await Promise.all([
      this.optimizeCustomerQueries(),
      this.optimizeVehicleQueries(),
      this.optimizeAppointmentQueries(),
      this.optimizeJobCardQueries(),
      this.optimizeInvoiceQueries(),
      this.optimizeEstimateQueries(),
      this.optimizePartQueries()
    ]);
    
    if (process.env.NODE_ENV === 'development') {
    }
  }
}

// Query optimization utilities
export class QueryOptimizer {
  static async getCustomersWithPagination(
    page: number = 1,
    limit: number = 20,
    search?: string,
    filters?: any
  ) {
    const cacheKey = `customers:${page}:${limit}:${search || 'all'}:${JSON.stringify(filters || {})}`;
    
    return await cacheService.withCache(
      cacheKey,
      async () => {
        await connectToDatabase();
        
        const query: any = { isActive: true };
        
        if (search) {
          query.$or = [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } }
          ];
        }
        
        if (filters) {
          Object.assign(query, filters);
        }
        
        const skip = (page - 1) * limit;
        
        const [customers, total] = await Promise.all([
          Customer.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
          Customer.countDocuments(query)
        ]);
        
        return {
          customers,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        };
      },
      { ttl: 300, tags: ['customers'] } // 5 minutes cache
    );
  }

  static async getVehiclesWithPagination(
    page: number = 1,
    limit: number = 20,
    search?: string,
    filters?: any
  ) {
    const cacheKey = `vehicles:${page}:${limit}:${search || 'all'}:${JSON.stringify(filters || {})}`;
    
    return await cacheService.withCache(
      cacheKey,
      async () => {
        await connectToDatabase();
        
        const query: any = { isActive: true };
        
        if (search) {
          query.$or = [
            { make: { $regex: search, $options: 'i' } },
            { model: { $regex: search, $options: 'i' } },
            { licensePlate: { $regex: search, $options: 'i' } },
            { vin: { $regex: search, $options: 'i' } }
          ];
        }
        
        if (filters) {
          Object.assign(query, filters);
        }
        
        const skip = (page - 1) * limit;
        
        const [vehicles, total] = await Promise.all([
          Vehicle.find(query)
            .populate('customerId', 'firstName lastName email phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
          Vehicle.countDocuments(query)
        ]);
        
        return {
          vehicles,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        };
      },
      { ttl: 300, tags: ['vehicles'] }
    );
  }

  static async getAppointmentsWithPagination(
    page: number = 1,
    limit: number = 20,
    search?: string,
    filters?: any
  ) {
    const cacheKey = `appointments:${page}:${limit}:${search || 'all'}:${JSON.stringify(filters || {})}`;
    
    return await cacheService.withCache(
      cacheKey,
      async () => {
        await connectToDatabase();
        
        const query: any = {};
        
        if (search) {
          query.$or = [
            { notes: { $regex: search, $options: 'i' } }
          ];
        }
        
        if (filters) {
          Object.assign(query, filters);
        }
        
        const skip = (page - 1) * limit;
        
        const [appointments, total] = await Promise.all([
          Appointment.find(query)
            .populate('customerId', 'firstName lastName email phone')
            .populate('vehicleId', 'make model licensePlate year')
            .populate('serviceId', 'name description')
            .sort({ appointmentDate: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
          Appointment.countDocuments(query)
        ]);
        
        return {
          appointments,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        };
      },
      { ttl: 180, tags: ['appointments'] } // 3 minutes cache
    );
  }

  static async getDashboardStats() {
    const cacheKey = 'dashboard:stats';
    
    return await cacheService.withCache(
      cacheKey,
      async () => {
        await connectToDatabase();
        
        const [
          totalCustomers,
          totalVehicles,
          totalAppointments,
          totalJobCards,
          totalInvoices,
          totalEstimates,
          totalParts,
          recentAppointments,
          recentJobCards,
          lowStockParts
        ] = await Promise.all([
          Customer.countDocuments({ isActive: true }),
          Vehicle.countDocuments({ isActive: true }),
          Appointment.countDocuments(),
          JobCard.countDocuments(),
          Invoice.countDocuments(),
          Estimate.countDocuments(),
          Part.countDocuments({ isActive: true }),
          
          Appointment.find()
            .populate('customerId', 'firstName lastName')
            .populate('vehicleId', 'make model licensePlate')
            .populate('serviceId', 'name')
            .sort({ appointmentDate: -1 })
            .limit(5)
            .lean(),
          
          JobCard.find()
            .populate('customerId', 'firstName lastName')
            .populate('vehicleId', 'make model licensePlate')
            .populate('mechanicId', 'firstName lastName')
            .sort({ createdAt: -1 })
            .limit(5)
            .lean(),
          
          Part.find({ 
            stockQuantity: { $lte: 10 },
            isActive: true 
          })
            .sort({ stockQuantity: 1 })
            .limit(10)
            .lean()
        ]);
        
        return {
          totalCustomers,
          totalVehicles,
          totalAppointments,
          totalJobCards,
          totalInvoices,
          totalEstimates,
          totalParts,
          recentAppointments,
          recentJobCards,
          lowStockParts
        };
      },
      { ttl: 300, tags: ['dashboard'] }
    );
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private static metrics = new Map<string, number[]>();

  static startTimer(label: string): () => void {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      const duration = end - start;
      
      if (!this.metrics.has(label)) {
        this.metrics.set(label, []);
      }
      
      const times = this.metrics.get(label)!;
      times.push(duration);
      
      // Keep only last 100 measurements
      if (times.length > 100) {
        times.shift();
      }
      
      if (process.env.NODE_ENV === 'development') {
      }
    };
  }

  static getAverageTime(label: string): number {
    const times = this.metrics.get(label);
    if (!times || times.length === 0) return 0;
    
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  static getMetrics(): { [label: string]: { average: number; count: number } } {
    const result: { [label: string]: { average: number; count: number } } = {};
    
    for (const [label, times] of this.metrics.entries()) {
      result[label] = {
        average: this.getAverageTime(label),
        count: times.length
      };
    }
    
    return result;
  }

  static clearMetrics(): void {
    this.metrics.clear();
  }
}

// Memory optimization
export class MemoryOptimizer {
  static optimizeImages(images: string[]): string[] {
    // In a real implementation, this would optimize images using a service like Cloudinary
    return images.map(image => {
      // Add optimization parameters to Cloudinary URLs
      if (image.includes('cloudinary.com')) {
        const parts = image.split('/');
        const uploadIndex = parts.findIndex(part => part === 'upload');
        if (uploadIndex !== -1 && uploadIndex < parts.length - 1) {
          parts.splice(uploadIndex + 1, 0, 'q_auto,f_auto,w_800');
          return parts.join('/');
        }
      }
      return image;
    });
  }

  static compressData(data: any): any {
    // Remove unnecessary fields and compress data
    if (Array.isArray(data)) {
      return data.map(item => this.compressData(item));
    }
    
    if (typeof data === 'object' && data !== null) {
      const compressed: any = {};
      for (const [key, value] of Object.entries(data)) {
        // Skip empty values and unnecessary fields
        if (value !== null && value !== undefined && value !== '') {
          compressed[key] = this.compressData(value);
        }
      }
      return compressed;
    }
    
    return data;
  }
}

// Lazy loading utilities
export class LazyLoader {
  static async loadCustomers(page: number = 1, limit: number = 20) {
    return await QueryOptimizer.getCustomersWithPagination(page, limit);
  }

  static async loadVehicles(page: number = 1, limit: number = 20) {
    return await QueryOptimizer.getVehiclesWithPagination(page, limit);
  }

  static async loadAppointments(page: number = 1, limit: number = 20) {
    return await QueryOptimizer.getAppointmentsWithPagination(page, limit);
  }

  static async loadDashboardStats() {
    return await QueryOptimizer.getDashboardStats();
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  DatabaseOptimizer,
  QueryOptimizer,
  PerformanceMonitor,
  MemoryOptimizer,
  LazyLoader
};
