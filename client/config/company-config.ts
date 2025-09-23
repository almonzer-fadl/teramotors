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
    name: process.env.COMPANY_NAME || "Tera Motors LLC",
    vatNumber: process.env.COMPANY_VAT_NUMBER || "300000000000003", // REPLACE with your real VAT number
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
    
    // Saudi VAT number validation (15 digits, starts and ends with 3)
    const vatRegex = /^3\d{13}3$/;
    if (!vatRegex.test(config.vatNumber)) {
      errors.push("Invalid Saudi VAT number format. Must be 15 digits starting and ending with 3");
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