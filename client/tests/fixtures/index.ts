// Test data fixtures for consistent testing

export const mockCustomer = {
  _id: '507f1f77bcf86cd799439011',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  address: {
    street: '123 Main St',
    city: 'Riyadh',
    state: 'Riyadh',
    zipCode: '12345',
    country: 'Saudi Arabia'
  },
  vehicles: [],
  emergencyContact: {
    name: 'Jane Doe',
    phone: '+1234567891',
    relationship: 'Spouse'
  },
  notes: 'Test customer',
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
}

export const mockVehicle = {
  _id: '507f1f77bcf86cd799439012',
  customerId: '507f1f77bcf86cd799439011',
  vin: '1HGBH41JXMN109186',
  make: 'Toyota',
  model: 'Camry',
  year: 2020,
  color: 'Silver',
  licensePlate: 'ABC-123',
  mileage: 50000,
  engineType: 'V6',
  transmission: 'automatic',
  fuelType: 'gasoline',
  photos: ['https://example.com/photo1.jpg'],
  serviceHistory: [],
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
}

export const mockUser = {
  _id: '507f1f77bcf86cd799439013',
  email: 'admin@teramotors.com',
  password: '$2b$10$hashedpassword',
  fullName: 'Admin User',
  role: 'admin',
  phone: '+1234567890',
  isActive: true,
  emailVerified: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
}

export const mockPart = {
  _id: '507f1f77bcf86cd799439014',
  name: 'Oil Filter',
  description: 'High-quality oil filter',
  category: 'Engine',
  manufacturer: 'Toyota',
  cost: 25.00,
  sellingPrice: 35.00,
  stockQuantity: 50,
  minStockLevel: 10,
  location: 'A-1-5',
  partNumber: 'OF-001',
  compatibleVehicles: [
    { make: 'Toyota', model: 'Camry', year: 2020 }
  ],
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
}

export const mockService = {
  _id: '507f1f77bcf86cd799439015',
  name: 'Oil Change',
  description: 'Complete oil change service',
  category: 'Maintenance',
  laborRate: 50.00,
  laborHours: 1.0,
  partsRequired: [
    {
      partId: '507f1f77bcf86cd799439014',
      quantity: 1,
      cost: 35.00
    }
  ],
  isActive: true,
  isTemplate: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
}

export const mockAppointment = {
  _id: '507f1f77bcf86cd799439016',
  customerId: '507f1f77bcf86cd799439011',
  vehicleId: '507f1f77bcf86cd799439012',
  serviceId: '507f1f77bcf86cd799439015',
  appointmentDate: new Date('2024-02-01'),
  startTime: new Date('2024-02-01T09:00:00Z'),
  endTime: new Date('2024-02-01T10:00:00Z'),
  status: 'scheduled',
  notes: 'Regular maintenance',
  estimatedCost: 85.00,
  mechanicId: '507f1f77bcf86cd799439013',
  priority: 'medium',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
}

export const mockJobCard = {
  _id: '507f1f77bcf86cd799439017',
  appointmentId: '507f1f77bcf86cd799439016',
  customerId: '507f1f77bcf86cd799439011',
  vehicleId: '507f1f77bcf86cd799439012',
  status: 'pending',
  priority: 'medium',
  estimatedStartTime: new Date('2024-02-01T09:00:00Z'),
  estimatedEndTime: new Date('2024-02-01T10:00:00Z'),
  services: [
    {
      serviceId: '507f1f77bcf86cd799439015',
      quantity: 1,
      laborHours: 1.0,
      laborRate: 50.00
    }
  ],
  partsUsed: [
    {
      partId: '507f1f77bcf86cd799439014',
      quantity: 1,
      cost: 35.00
    }
  ],
  notes: 'Oil change service',
  photos: [],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
}

export const mockInvoice = {
  _id: '507f1f77bcf86cd799439018',
  jobCardId: '507f1f77bcf86cd799439017',
  customerId: '507f1f77bcf86cd799439011',
  vehicleId: '507f1f77bcf86cd799439012',
  mechanicId: '507f1f77bcf86cd799439013',
  status: 'pending',
  notes: 'Oil change invoice',
  totalAmount: 85.00,
  paidAmount: 0,
  dueDate: new Date('2024-03-01'),
  paymentMethod: 'cash',
  paymentStatus: 'pending',
  zatca: {
    qrCode: 'test-qr-code',
    invoiceNumber: 'INV-001',
    invoiceDate: new Date('2024-01-01'),
    vatAmount: 12.75,
    subtotal: 72.25,
    compliance: {
      phase: 1,
      isCompliant: true,
      errors: [],
      warnings: []
    }
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
}

// Mock API responses
export const mockApiResponses = {
  customers: {
    success: {
      data: [mockCustomer],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
        nextPage: null,
        prevPage: null
      }
    }
  },
  vehicles: {
    success: {
      data: [mockVehicle],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
        nextPage: null,
        prevPage: null
      }
    }
  },
  parts: {
    success: {
      data: [mockPart],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
        nextPage: null,
        prevPage: null
      }
    }
  }
}

// Test utilities
export const createMockRequest = (method: string = 'GET', body?: any) => ({
  method,
  url: 'http://localhost:3000/api/test',
  headers: new Headers({
    'Content-Type': 'application/json',
    'Authorization': 'Bearer test-token'
  }),
  json: async () => body || {},
  formData: async () => new FormData(),
})

export const createMockResponse = () => ({
  json: jest.fn(),
  status: jest.fn().mockReturnThis(),
  headers: new Headers(),
  ok: true,
  statusText: 'OK'
})
