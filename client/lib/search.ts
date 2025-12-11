import { connectToDatabase } from './db';
import Customer from './models/Customer';
import Vehicle from './models/Vehicle';
import Appointment from './models/Appointment';
import JobCard from './models/JobCard';
import Invoice from './models/Invoice';
import Estimate from './models/Estimate';
import Part from './models/Part';

export interface SearchResult {
  type: 'customer' | 'vehicle' | 'appointment' | 'job' | 'invoice' | 'estimate' | 'part';
  id: string;
  title: string;
  description: string;
  url: string;
  score: number;
  data: any;
}

export interface SearchFilters {
  type?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  status?: string[];
  role?: string;
}

export class SearchService {
  static async globalSearch(
    query: string,
    filters: SearchFilters = {},
    limit: number = 20
  ): Promise<SearchResult[]> {
    if (!query.trim()) return [];

    const searchRegex = new RegExp(query, 'i');
    const results: SearchResult[] = [];

    try {
      await connectToDatabase();

      // Search customers
      if (!filters.type || filters.type.includes('customer')) {
        const customers = await Customer.find({
          $or: [
            { firstName: searchRegex },
            { lastName: searchRegex },
            { email: searchRegex },
            { phone: searchRegex }
          ],
          isActive: true
        }).limit(5);

        customers.forEach(customer => {
          results.push({
            type: 'customer',
            id: customer._id.toString(),
            title: `${customer.firstName} ${customer.lastName}`,
            description: `${customer.email} • ${customer.phone}`,
            url: `/customers/${customer._id}`,
            score: this.calculateScore(query, `${customer.firstName} ${customer.lastName}`),
            data: customer
          });
        });
      }

      // Search vehicles
      if (!filters.type || filters.type.includes('vehicle')) {
        const vehicles = await Vehicle.find({
          $or: [
            { make: searchRegex },
            { model: searchRegex },
            { licensePlate: searchRegex },
            { vin: searchRegex }
          ],
          isActive: true
        }).populate('customerId', 'firstName lastName').limit(5);

        vehicles.forEach(vehicle => {
          results.push({
            type: 'vehicle',
            id: vehicle._id.toString(),
            title: `${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`,
            description: `Year: ${vehicle.year} • Customer: ${vehicle.customerId?.firstName} ${vehicle.customerId?.lastName}`,
            url: `/vehicles/${vehicle._id}`,
            score: this.calculateScore(query, `${vehicle.make} ${vehicle.model} ${vehicle.licensePlate}`),
            data: vehicle
          });
        });
      }

      // Search appointments
      if (!filters.type || filters.type.includes('appointment')) {
        const appointmentQuery: any = {
          $or: [
            { notes: searchRegex }
          ]
        };

        if (filters.dateFrom || filters.dateTo) {
          appointmentQuery.appointmentDate = {};
          if (filters.dateFrom) appointmentQuery.appointmentDate.$gte = filters.dateFrom;
          if (filters.dateTo) appointmentQuery.appointmentDate.$lte = filters.dateTo;
        }

        if (filters.status) {
          appointmentQuery.status = { $in: filters.status };
        }

        const appointments = await Appointment.find(appointmentQuery)
          .populate('customerId', 'firstName lastName')
          .populate('vehicleId', 'make model licensePlate')
          .populate('serviceId', 'name')
          .limit(5);

        appointments.forEach(appointment => {
          results.push({
            type: 'appointment',
            id: appointment._id.toString(),
            title: `${appointment.serviceId?.name} - ${appointment.customerId?.firstName} ${appointment.customerId?.lastName}`,
            description: `${appointment.vehicleId?.make} ${appointment.vehicleId?.model} • ${appointment.appointmentDate}`,
            url: `/appointments/${appointment._id}`,
            score: this.calculateScore(query, appointment.notes || ''),
            data: appointment
          });
        });
      }

      // Search job cards
      if (!filters.type || filters.type.includes('job')) {
        const jobQuery: any = {
          $or: [
            { description: searchRegex },
            { notes: searchRegex }
          ]
        };

        if (filters.status) {
          jobQuery.status = { $in: filters.status };
        }

        const jobs = await JobCard.find(jobQuery)
          .populate('customerId', 'firstName lastName')
          .populate('vehicleId', 'make model licensePlate')
          .limit(5);

        jobs.forEach(job => {
          const jobId = String(job._id);
          const jobNumber = (job as any).jobNumber ?? job.jobCardNumber ?? jobId;
          const customer = job.customerId as any;
          const vehicle = job.vehicleId as any;
          results.push({
            type: 'job',
            id: jobId,
            title: `Job #${jobNumber} - ${customer?.firstName ?? ''} ${customer?.lastName ?? ''}`,
            description: `${vehicle?.make ?? ''} ${vehicle?.model ?? ''} • Status: ${job.status}`,
            url: `/job-cards/${jobId}`,
            score: this.calculateScore(query, (job as any).description || ''),
            data: job
          });
        });
      }

      // Search invoices
      if (!filters.type || filters.type.includes('invoice')) {
        const invoiceQuery: any = {
          $or: [
            { invoiceNumber: searchRegex },
            { notes: searchRegex }
          ]
        };

        if (filters.dateFrom || filters.dateTo) {
          invoiceQuery.createdAt = {};
          if (filters.dateFrom) invoiceQuery.createdAt.$gte = filters.dateFrom;
          if (filters.dateTo) invoiceQuery.createdAt.$lte = filters.dateTo;
        }

        if (filters.status) {
          invoiceQuery.status = { $in: filters.status };
        }

        const invoices = await Invoice.find(invoiceQuery)
          .populate('customerId', 'firstName lastName')
          .populate('vehicleId', 'make model licensePlate')
          .limit(5);

        invoices.forEach(invoice => {
          const invoiceId = String(invoice._id);
          const invoiceCustomer = invoice.customerId as any;
          results.push({
            type: 'invoice',
            id: invoiceId,
            title: `Invoice #${invoice.invoiceNumber} - ${invoiceCustomer?.firstName ?? ''} ${invoiceCustomer?.lastName ?? ''}`,
            description: `Amount: SAR ${invoice.totalAmount} • Status: ${invoice.status}`,
            url: `/invoices/${invoiceId}`,
            score: this.calculateScore(query, invoice.invoiceNumber || ''),
            data: invoice
          });
        });
      }

      // Search estimates
      if (!filters.type || filters.type.includes('estimate')) {
        const estimateQuery: any = {
          $or: [
            { estimateNumber: searchRegex },
            { notes: searchRegex }
          ]
        };

        if (filters.dateFrom || filters.dateTo) {
          estimateQuery.createdAt = {};
          if (filters.dateFrom) estimateQuery.createdAt.$gte = filters.dateFrom;
          if (filters.dateTo) estimateQuery.createdAt.$lte = filters.dateTo;
        }

        if (filters.status) {
          estimateQuery.status = { $in: filters.status };
        }

        const estimates = await Estimate.find(estimateQuery)
          .populate('customerId', 'firstName lastName')
          .populate('vehicleId', 'make model licensePlate')
          .limit(5);

        estimates.forEach(estimate => {
          results.push({
            type: 'estimate',
            id: estimate._id.toString(),
            title: `Estimate #${estimate.estimateNumber} - ${estimate.customerId?.firstName} ${estimate.customerId?.lastName}`,
            description: `Amount: SAR ${estimate.totalAmount} • Status: ${estimate.status}`,
            url: `/estimates/${estimate._id}`,
            score: this.calculateScore(query, estimate.estimateNumber || ''),
            data: estimate
          });
        });
      }

      // Search parts
      if (!filters.type || filters.type.includes('part')) {
        const parts = await Part.find({
          $or: [
            { name: searchRegex },
            { description: searchRegex },
            { partNumber: searchRegex },
            { category: searchRegex },
            { manufacturer: searchRegex }
          ],
          isActive: true
        }).limit(5);

        parts.forEach(part => {
          results.push({
            type: 'part',
            id: part._id.toString(),
            title: `${part.name} (${part.partNumber})`,
            description: `${part.category} • Stock: ${part.stockQuantity} • Price: SAR ${part.sellingPrice}`,
            url: `/inventory/${part._id}`,
            score: this.calculateScore(query, `${part.name} ${part.partNumber}`),
            data: part
          });
        });
      }

      // Sort by score and limit results
      return results
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }

  static async searchByType(
    type: string,
    query: string,
    filters: SearchFilters = {},
    limit: number = 10
  ): Promise<SearchResult[]> {
    const typeFilters = { ...filters, type: [type] };
    return this.globalSearch(query, typeFilters, limit);
  }

  static async getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
    if (!query.trim()) return [];

    const suggestions: string[] = [];
    const searchRegex = new RegExp(query, 'i');

    try {
      await connectToDatabase();

      // Get customer names
      const customers = await Customer.find({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex }
        ],
        isActive: true
      }).limit(3);

      customers.forEach(customer => {
        suggestions.push(`${customer.firstName} ${customer.lastName}`);
      });

      // Get vehicle makes/models
      const vehicles = await Vehicle.find({
        $or: [
          { make: searchRegex },
          { model: searchRegex }
        ],
        isActive: true
      }).limit(3);

      vehicles.forEach(vehicle => {
        suggestions.push(`${vehicle.make} ${vehicle.model}`);
      });

      // Get part names
      const parts = await Part.find({
        name: searchRegex,
        isActive: true
      }).limit(3);

      parts.forEach(part => {
        suggestions.push(part.name);
      });

      return suggestions.slice(0, limit);

    } catch (error) {
      console.error('Search suggestions error:', error);
      return [];
    }
  }

  static async getRecentSearches(userId: string, limit: number = 10): Promise<string[]> {
    // This would typically be stored in a user preferences or search history collection
    // For now, return empty array
    return [];
  }

  static async saveSearchHistory(userId: string, query: string): Promise<void> {
    // This would typically save to a search history collection
    // For now, do nothing
  }

  private static calculateScore(query: string, text: string): number {
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    
    // Exact match gets highest score
    if (textLower === queryLower) return 100;
    
    // Starts with query gets high score
    if (textLower.startsWith(queryLower)) return 90;
    
    // Contains query gets medium score
    if (textLower.includes(queryLower)) return 70;
    
    // Word boundary match gets lower score
    const words = textLower.split(/\s+/);
    const queryWords = queryLower.split(/\s+/);
    
    let wordMatches = 0;
    queryWords.forEach(queryWord => {
      words.forEach(word => {
        if (word.includes(queryWord)) wordMatches++;
      });
    });
    
    if (wordMatches > 0) return 50;
    
    return 0;
  }
}

export default SearchService;
