export interface CompanyConfig {
    name: string;
    vatNumber: string;
    address: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
    };
    businessType: string;
    environment: 'sandbox' | 'production';
  }
  
  // Your company information - UPDATE THESE WITH YOUR ACTUAL DETAILS
  export const COMPANY_CONFIG: CompanyConfig = {
    name: process.env.COMPANY_NAME || "تيرا فيجنز لصيانه السيارات",
    vatNumber: process.env.COMPANY_VAT_NUMBER || "7051569718", // Unified National Number
    address: {
      street: "King Fahd Road, Building 123",
      city: "Riyadh",
      postalCode: "12345",
      country: "SA"
    },
    businessType: "Auto repair Shop", // Update this
    environment: (process.env.ZATCA_ENVIRONMENT as 'sandbox' | 'production') || 'production'
  };
  
  // Validate company config on import
  export function validateCompanyConfig(config: CompanyConfig): string[] {
    const errors: string[] = [];
    
    if (!config.name.trim()) {
      errors.push("Company name is required");
    }
    
    // Unified National Number validation (10 digits)
    const vatRegex = /^\d{10}$/;
    if (!vatRegex.test(config.vatNumber)) {
      errors.push("Invalid Unified National Number format. Must be 10 digits");
    }
    
    if (!config.address.postalCode || !/^\d{5}$/.test(config.address.postalCode)) {
      errors.push("Invalid postal code. Must be 5 digits");
    }
    
    return errors;
  }
  
  // Auto-validate on import
  const configErrors = validateCompanyConfig(COMPANY_CONFIG);
  if (configErrors.length > 0) {
    console.warn("⚠️  Company configuration issues:", configErrors);
  }