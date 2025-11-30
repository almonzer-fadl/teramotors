import { PartMatchingService, MatchedPart } from '@/lib/services/PartMatchingService';
import Part from '@/lib/models/Part';
import Service from '@/lib/models/Service';
import { IVehicleInspection } from '@/lib/models/VehicleInspection';

// Mock the Mongoose models
jest.mock('@/lib/models/Part');
jest.mock('@/lib/models/Service');

const mockPart = Part as jest.Mocked<typeof Part>;
const mockService = Service as jest.Mocked<typeof Service>;

// Define reusable mock data
const vehicleInfo = { make: 'Toyota', model: 'Camry', year: 2022 };

const inspectionItems: IVehicleInspection['items'] = [
  { itemId: 'B-001', name: 'Brake Pads', category: 'Brakes', condition: 'poor', uniqueCode: 'B001' },
  { itemId: 'E-001', name: 'Oil Filter', category: 'Engine', condition: 'fair', uniqueCode: 'E001' },
  { itemId: 'T-001', name: 'Tire Tread', category: 'Tires', condition: 'good', uniqueCode: 'T001' }, // Should be ignored
  { itemId: 'S-001', name: 'Shocks', category: 'Suspension', condition: 'poor', uniqueCode: 'S001' },
];

const mockParts = {
    brakePad: { _id: 'part1', name: 'Brake Pad Set', uniqueCode: 'B001', cost: 100, sellingPrice: 150, compatibleVehicles: [{ make: 'Toyota', model: 'Camry', year: 2022 }] },
    oilFilter: { _id: 'part2', name: 'Oil Filter', uniqueCode: 'E001', cost: 10, sellingPrice: 20, compatibleVehicles: [] },
    genericShocks: { _id: 'part3', name: 'Generic Shocks', uniqueCode: 'S001', cost: 200, sellingPrice: 300, compatibleVehicles: []},
};

const mockServices = {
    brakeJob: { _id: 'service1', name: 'Brake Replacement', uniqueCode: 'B001', laborHours: 2, laborRate: 80, partsRequired: [{ partId: 'part1', quantity: 1 }] },
};

describe('PartMatchingService', () => {
  let service: PartMatchingService;

  beforeEach(() => {
    service = new PartMatchingService();
    // Reset mocks before each test
    jest.resetAllMocks();
  });

  test('should match a part and service via unique code', async () => {
    // Arrange
    mockService.findOne.mockResolvedValue({ ...mockServices.brakeJob, populate: () => Promise.resolve(mockServices.brakeJob) });
    mockPart.findById.mockResolvedValue(mockParts.brakePad);

    const itemsToMatch = [inspectionItems[0]]; // Only brake pads

    // Act
    const result = await service.matchInspectionItems(itemsToMatch, vehicleInfo);

    // Assert
    expect(result).toHaveLength(1);
    const match = result[0];
    expect(match.confidence).toBe('high');
    expect(match.inspectionItem.uniqueCode).toBe('B001');
    expect(match.service?._id).toBe('service1');
    expect(match.part?._id).toBe('part1');
    expect(match.quantity).toBe(1);
    expect(match.matchReason).toContain('Matched via Service');
  });

  test('should match a part directly with vehicle compatibility', async () => {
    // Arrange
    mockService.findOne.mockResolvedValue(null); // No service found
    mockPart.find.mockResolvedValue([mockParts.oilFilter]); // Find part directly

    const itemsToMatch = [inspectionItems[1]]; // Only oil filter

    // Act
    const result = await service.matchInspectionItems(itemsToMatch, vehicleInfo);

    // Assert
    expect(result).toHaveLength(1);
    const match = result[0];
    expect(match.confidence).toBe('high'); // Generic part is compatible with all
    expect(match.inspectionItem.uniqueCode).toBe('E001');
    expect(match.service).toBeUndefined();
    expect(match.part?._id).toBe('part2');
    expect(match.quantity).toBe(1);
    expect(match.matchReason).toContain('Direct part match');
  });
  
  test('should match a generic part with medium confidence if no specific match', async () => {
    // Arrange
    mockService.findOne.mockResolvedValue(null);
    // Simulate finding a generic part when a specific one might exist but doesn't match the vehicle
    mockPart.find.mockResolvedValue([mockParts.genericShocks]);
    
    const itemsToMatch = [inspectionItems[3]]; // Shocks

    // Act
    const result = await service.matchInspectionItems(itemsToMatch, {make: 'Honda', model: 'Civic', year: 2020});
    
    // Assert
    expect(result).toHaveLength(1);
    const match = result[0];
    expect(match.confidence).toBe('medium'); // Because it's a generic part
    expect(match.part?._id).toBe('part3');
    expect(match.matchReason).toContain('Direct part match');
  });

  test('should not match items with "good" condition', async () => {
    // Act
    const result = await service.matchInspectionItems([inspectionItems[2]], vehicleInfo);

    // Assert
    expect(result).toHaveLength(0);
  });

  test('should return an empty array if no parts or services match', async () => {
    // Arrange
    mockService.findOne.mockResolvedValue(null);
    mockPart.find.mockResolvedValue([]);

    const itemsToMatch = [inspectionItems[0]];

    // Act
    const result = await service.matchInspectionItems(itemsToMatch, vehicleInfo);

    // Assert
    expect(result).toHaveLength(0);
  });

  test('should return multiple matches for multiple items', async () => {
     // Arrange
     mockService.findOne
     .mockResolvedValueOnce({ ...mockServices.brakeJob, populate: () => Promise.resolve(mockServices.brakeJob) }) // For B001
     .mockResolvedValueOnce(null); // For E001
 
    mockPart.findById.mockResolvedValue(mockParts.brakePad);
    mockPart.find.mockResolvedValueOnce([mockParts.oilFilter]);
 
    const itemsToMatch = [inspectionItems[0], inspectionItems[1]];
 
     // Act
     const result = await service.matchInspectionItems(itemsToMatch, vehicleInfo);
 
     // Assert
     expect(result).toHaveLength(2);
     expect(result.some(m => m.inspectionItem.uniqueCode === 'B001')).toBe(true);
     expect(result.some(m => m.inspectionItem.uniqueCode === 'E001')).toBe(true);
  });
});
