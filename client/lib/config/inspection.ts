/**
 * Inspection System Configuration
 *
 * Central configuration for inspection workflow automation
 */

export const INSPECTION_CONFIG = {
  // Default inspection fee in SAR
  DEFAULT_FEE: 150,

  // Invoice due date (days from creation)
  INVOICE_DUE_DAYS: 7,

  // Estimate validity period (days from creation)
  ESTIMATE_VALIDITY_DAYS: 30,

  // Auto-close inspection job card when completed
  AUTO_CLOSE_INSPECTION_JOB_CARD: true,

  // Auto-generate estimate from inspection
  AUTO_GENERATE_ESTIMATE: true,

  // Auto-generate invoice for inspection fee
  AUTO_GENERATE_INVOICE: true,
};

/**
 * Category prefix mapping for unique codes
 * Format: Category Name => Single Letter Prefix
 *
 * Example: Engine => E, resulting in codes like E001, E002, E015, etc.
 */
export const CATEGORY_PREFIXES: Record<string, string> = {
  'Engine': 'E',
  'Brakes': 'B',
  'Tires': 'T',
  'Suspension': 'S',
  'Electrical': 'L',      // L for eLectrical
  'Transmission': 'R',
  'Cooling': 'C',
  'Fuel': 'F',
  'Exhaust': 'X',
  'Body': 'D',
  'Interior': 'I',
  'Safety': 'A',           // A for sAfety
  'General': 'G',
  'Maintenance': 'M',
  'Steering': 'H',         // H for steering (S taken)
  'HVAC': 'V',             // V for HVAC
  'Lighting': 'N',         // N for lightiNg
  'Wipers': 'W',
};

/**
 * Get prefix for a category, with fallback to 'G' (General)
 */
export function getCategoryPrefix(category: string): string {
  // Normalize category (trim, capitalize first letter)
  const normalizedCategory = category.trim();
  const titleCase = normalizedCategory.charAt(0).toUpperCase() + normalizedCategory.slice(1).toLowerCase();

  return CATEGORY_PREFIXES[titleCase] || 'G';
}

/**
 * Generate unique code for an item
 * @param category - The category name
 * @param index - The index number (0-999)
 * @returns Unique code in format like E015
 */
export function generateUniqueCode(category: string, index: number): string {
  const prefix = getCategoryPrefix(category);
  const paddedIndex = index.toString().padStart(3, '0');
  return `${prefix}${paddedIndex}`;
}

/**
 * Validate unique code format
 * @param code - Code to validate
 * @returns true if valid format
 */
export function isValidUniqueCode(code: string): boolean {
  return /^[A-Z]\d{3}$/.test(code);
}

/**
 * Parse unique code into components
 * @param code - Unique code like E015
 * @returns Object with prefix and number
 */
export function parseUniqueCode(code: string): { prefix: string; number: number } | null {
  if (!isValidUniqueCode(code)) {
    return null;
  }

  return {
    prefix: code.charAt(0),
    number: parseInt(code.slice(1), 10)
  };
}
