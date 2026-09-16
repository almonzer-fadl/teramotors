export interface CompanyAddress {
  street?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  country?: string;
}

export interface CompanyInfo {
  name?: string;
  nameAr?: string;
  vatNumber?: string;
  crNumber?: string;
  address?: CompanyAddress;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
}

export const DEFAULT_COMPANY_INFO: CompanyInfo = {
  name: 'TeraMotor Workshop',
  nameAr: 'مركز تيرا موتور لصيانة السيارات',
  vatNumber: '31450829500003',
  crNumber: '7054957985',
  address: {
    street: 'صناعية الرمال',
    city: 'الرياض',
    country: 'SA',
  },
  phone: '+966553022102',
  email: 'info@teramotors.com',
  logoUrl: '/icon.png',
};

export function resolveCompanyInfo(company?: CompanyInfo | null): CompanyInfo {
  return { ...DEFAULT_COMPANY_INFO, ...(company || {}) };
}

export function formatAddress(address?: CompanyAddress): string {
  if (!address) return '';
  const parts = [
    address.street,
    address.district,
    address.city,
    address.postalCode,
    address.country,
  ].filter(Boolean);
  return parts.join('، ');
}

export function resolveLogoUrl(logoUrl?: string): string {
  if (!logoUrl) return DEFAULT_COMPANY_INFO.logoUrl || '/icon.png';
  return logoUrl;
}
