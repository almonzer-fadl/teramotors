export interface CompanyConfig {
    name: string;
    vatNumber: string;
    idNumber: string;
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
    name: process.env.COMPANY_NAME || "شركه تيرا فيجنز",
    vatNumber: process.env.COMPANY_VAT_NUMBER || "314211338900003", // Unified National Number
    idNumber: process.env.COMPANY_ID_NUMBER || "7051569718", // Add your company ID here
    address: {
      street: "صناعية, الرمال, الرياض",
      city: "Riyadh",
      postalCode: "13252",
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
    const vatRegex = /^\d{15}$/;
    const trimmedVatNumber = String(config.vatNumber).trim();
    if (!vatRegex.test(trimmedVatNumber)) {
      console.error('VAT Number validation failed:', trimmedVatNumber, 'Length:', trimmedVatNumber.length, 'Original:', config.vatNumber);
      errors.push("Invalid Unified National Number format. Must be 15 digits");
    }

    const idRegex = /^\d{10}$/;
    const trimmedIdNumber = String(config.idNumber).trim();
    if (!idRegex.test(trimmedIdNumber)) {
      errors.push("Invalid ID Number format. Must be 10 digits");
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