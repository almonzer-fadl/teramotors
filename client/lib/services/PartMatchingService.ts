import Part from '@/lib/models/Part';
import Service from '@/lib/models/Service';
import { IVehicleInspection } from '@/lib/models/VehicleInspection';

// Define types based on Mongoose models to avoid direct dependency
type InspectionItem = IVehicleInspection['items'][0];
type PartModel = InstanceType<typeof Part>;
type ServiceModel = InstanceType<typeof Service>;
type VehicleInfo = { make: string; model: string; year: number };
type CompatibleVehicle = { make: string; model: string; year: number };

export interface MatchedPart {
  inspectionItem: {
    itemId: string;
    name: string;
    uniqueCode?: string;
    category: string;
    condition: 'good' | 'fair' | 'poor';
  };
  service?: {
    _id: string;
    name: string;
    uniqueCode?: string;
    laborHours: number;
    laborRate: number;
  };
  part?: {
    _id: string;
    name: string;
    uniqueCode?: string;
    cost: number;
    sellingPrice: number;
  };
  quantity: number;
  confidence: 'high' | 'medium' | 'low';
  matchReason: string;
}

export class PartMatchingService {
  /**
   * Main method to match inspection items to parts and services.
   * Filters for 'fair' and 'poor' condition items.
   */
  public async matchInspectionItems(
    inspectionItems: InspectionItem[],
    vehicleInfo: VehicleInfo,
  ): Promise<MatchedPart[]> {
    const matchedParts: MatchedPart[] = [];
    const relevantItems = inspectionItems.filter(
      (item) => item.condition === 'fair' || item.condition === 'poor',
    );

    for (const item of relevantItems) {
      if (!item.uniqueCode) continue;

      // 1. Try to find a service linked to the item's unique code.
      const service = await this.findServiceByCode(item.uniqueCode);
      if (service && service.partsRequired && service.partsRequired.length > 0) {
        for (const requiredPart of service.partsRequired) {
          const part = await this.findPartById(requiredPart.partId.toString());
          if (part) {
            matchedParts.push({
              inspectionItem: item,
              service: {
                _id: service._id.toString(),
                name: service.name,
                uniqueCode: service.uniqueCode,
                laborHours: service.laborHours,
                laborRate: service.laborRate,
              },
              part: {
                _id: part._id.toString(),
                name: part.name,
                uniqueCode: part.uniqueCode,
                cost: part.cost,
                sellingPrice: part.sellingPrice,
              },
              quantity: requiredPart.quantity,
              confidence: 'high',
              matchReason: `Matched via Service ${service.name} -> Part ${part.name}`,
            });
          }
        }
      } else {
        // 2. If no service, try to find a part directly by unique code and vehicle compatibility.
        const parts = await this.findPartsByCodeAndVehicle(item.uniqueCode, vehicleInfo);

        if (parts.length > 0) {
          const bestMatch = parts[0]; // The service sorts by compatibility.
          const confidence = this.checkVehicleCompatibility(bestMatch, vehicleInfo) ? 'high' : 'medium';
          matchedParts.push({
            inspectionItem: item,
            part: {
              _id: bestMatch._id.toString(),
              name: bestMatch.name,
              uniqueCode: bestMatch.uniqueCode,
              cost: bestMatch.cost,
              sellingPrice: bestMatch.sellingPrice,
            },
            quantity: 1, // Default to 1 when no service specifies quantity
            confidence,
            matchReason: `Direct part match on unique code ${item.uniqueCode} with ${confidence} vehicle compatibility.`,
          });
        }
      }
    }

    return matchedParts;
  }

  private async findServiceByCode(uniqueCode: string): Promise<ServiceModel | null> {
    return Service.findOne({ uniqueCode }).populate('partsRequired.partId').lean();
  }

  private async findPartById(partId: string): Promise<PartModel | null> {
    return Part.findById(partId).lean();
  }
  
  private async findPartByCode(uniqueCode: string): Promise<PartModel | null> {
    return Part.findOne({ uniqueCode }).lean();
  }

  /**
   * Finds parts with a given unique code and sorts them by vehicle compatibility.
   */
  private async findPartsByCodeAndVehicle(
    uniqueCode: string,
    vehicle: VehicleInfo
  ): Promise<PartModel[]> {
    const parts = await Part.find({ uniqueCode }).lean();
    
    return parts.sort((a, b) => {
        const compatibilityA = this.getCompatibilityScore(a, vehicle);
        const compatibilityB = this.getCompatibilityScore(b, vehicle);
        return compatibilityB - compatibilityA; // Sort descending by score
    });
  }

  /**
   * Checks if a part is compatible with a given vehicle.
   */
  private checkVehicleCompatibility(part: PartModel, vehicle: VehicleInfo): boolean {
    if (!part.compatibleVehicles || part.compatibleVehicles.length === 0) {
      return true; // Assumed to be a generic part if no compatibility is specified
    }

    const isCompatible = part.compatibleVehicles.some((compat: CompatibleVehicle) =>
        compat.make.toLowerCase() === vehicle.make.toLowerCase() &&
        compat.model.toLowerCase() === vehicle.model.toLowerCase() &&
        compat.year === vehicle.year
    );

    return isCompatible;
  }

  /**
   * Returns a numerical score for compatibility to help sorting.
   */
  private getCompatibilityScore(part: PartModel, vehicle: VehicleInfo): number {
    if (!part.compatibleVehicles || part.compatibleVehicles.length === 0) {
        return 1; // Generic part
    }

    // Exact match
    if (part.compatibleVehicles.some((v: CompatibleVehicle) => v.make === vehicle.make && v.model === vehicle.model && v.year === vehicle.year)) {
        return 3;
    }

    // Make and model match
    if (part.compatibleVehicles.some((v: CompatibleVehicle) => v.make === vehicle.make && v.model === vehicle.model)) {
        return 2;
    }
    
    return 0; // No match
  }
}
