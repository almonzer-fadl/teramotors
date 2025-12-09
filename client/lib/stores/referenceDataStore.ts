import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
}

interface Vehicle {
  _id: string;
  customerId: { _id: string };
  make: string;
  model: string;
  year: number;
  licensePlate: string;
}

interface Service {
  _id: string;
  name: string;
  laborRate?: number;
  laborHours?: number;
}

interface Part {
  _id: string;
  name: string;
  cost?: number;
}

interface Invoice {
  _id: string;
  invoiceNumber?: string;
  uniqueCode?: string;
  customerId?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  totalAmount?: number;
}

interface CacheTimestamps {
  customers: number | null;
  vehicles: number | null;
  services: number | null;
  parts: number | null;
  invoices: number | null;
}

interface ReferenceDataState {
  // Data arrays
  customers: Customer[];
  vehicles: Vehicle[];
  services: Service[];
  parts: Part[];
  invoices: Invoice[];

  // Loading states
  customersLoading: boolean;
  vehiclesLoading: boolean;
  servicesLoading: boolean;
  partsLoading: boolean;
  invoicesLoading: boolean;

  // Cache timestamps (for 5-minute TTL)
  cacheTimestamps: CacheTimestamps;

  // Actions
  setCustomers: (customers: Customer[]) => void;
  setVehicles: (vehicles: Vehicle[]) => void;
  setServices: (services: Service[]) => void;
  setParts: (parts: Part[]) => void;
  setInvoices: (invoices: Invoice[]) => void;

  fetchCustomers: (force?: boolean) => Promise<void>;
  fetchVehicles: (force?: boolean) => Promise<void>;
  fetchServices: (force?: boolean) => Promise<void>;
  fetchParts: (force?: boolean) => Promise<void>;
  fetchInvoices: (force?: boolean) => Promise<void>;

  invalidateCustomers: () => void;
  invalidateVehicles: () => void;
  invalidateServices: () => void;
  invalidateParts: () => void;
  invalidateInvoices: () => void;
  invalidateAll: () => void;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

const isCacheValid = (timestamp: number | null): boolean => {
  if (!timestamp) return false;
  return Date.now() - timestamp < CACHE_TTL;
};

export const useReferenceDataStore = create<ReferenceDataState>()(
  persist(
    (set, get) => ({
      // Initial state
      customers: [],
      vehicles: [],
      services: [],
      parts: [],
      invoices: [],

      customersLoading: false,
      vehiclesLoading: false,
      servicesLoading: false,
      partsLoading: false,
      invoicesLoading: false,

      cacheTimestamps: {
        customers: null,
        vehicles: null,
        services: null,
        parts: null,
        invoices: null,
      },

      // Setters
      setCustomers: (customers) =>
        set({
          customers,
          cacheTimestamps: { ...get().cacheTimestamps, customers: Date.now() },
        }),

      setVehicles: (vehicles) =>
        set({
          vehicles,
          cacheTimestamps: { ...get().cacheTimestamps, vehicles: Date.now() },
        }),

      setServices: (services) =>
        set({
          services,
          cacheTimestamps: { ...get().cacheTimestamps, services: Date.now() },
        }),

      setParts: (parts) =>
        set({
          parts,
          cacheTimestamps: { ...get().cacheTimestamps, parts: Date.now() },
        }),
        
      setInvoices: (invoices) =>
        set({
          invoices,
          cacheTimestamps: { ...get().cacheTimestamps, invoices: Date.now() },
        }),

      // Fetch methods with cache validation
      fetchCustomers: async (force = false) => {
        const state = get();
        if (!force && isCacheValid(state.cacheTimestamps.customers) && state.customers.length > 0) return;
        if (state.customersLoading) return;
        set({ customersLoading: true });
        try {
          const response = await fetch('/api/customers');
          if (!response.ok) throw new Error('Failed to fetch customers');
          const data = await response.json();
          get().setCustomers(data.customers || data);
        } catch (error) {
          console.error('Error fetching customers:', error);
        } finally {
          set({ customersLoading: false });
        }
      },

      fetchVehicles: async (force = false) => {
        const state = get();
        if (!force && isCacheValid(state.cacheTimestamps.vehicles) && state.vehicles.length > 0) return;
        if (state.vehiclesLoading) return;
        set({ vehiclesLoading: true });
        try {
          const response = await fetch('/api/vehicles');
          if (!response.ok) throw new Error('Failed to fetch vehicles');
          const data = await response.json();
          get().setVehicles(data.vehicles || data);
        } catch (error) {
          console.error('Error fetching vehicles:', error);
        } finally {
          set({ vehiclesLoading: false });
        }
      },

      fetchServices: async (force = false) => {
        const state = get();
        if (!force && isCacheValid(state.cacheTimestamps.services) && state.services.length > 0) return;
        if (state.servicesLoading) return;
        set({ servicesLoading: true });
        try {
          const response = await fetch('/api/services');
          if (!response.ok) throw new Error('Failed to fetch services');
          const data = await response.json();
          get().setServices(data.services || data);
        } catch (error) {
          console.error('Error fetching services:', error);
        } finally {
          set({ servicesLoading: false });
        }
      },

      fetchParts: async (force = false) => {
        const state = get();
        if (!force && isCacheValid(state.cacheTimestamps.parts) && state.parts.length > 0) return;
        if (state.partsLoading) return;
        set({ partsLoading: true });
        try {
          const response = await fetch('/api/parts');
          if (!response.ok) throw new Error('Failed to fetch parts');
          const data = await response.json();
          get().setParts(data.parts || data);
        } catch (error) {
          console.error('Error fetching parts:', error);
        } finally {
          set({ partsLoading: false });
        }
      },
      
      fetchInvoices: async (force = false) => {
        const state = get();
        if (!force && isCacheValid(state.cacheTimestamps.invoices) && state.invoices.length > 0) return;
        if (state.invoicesLoading) return;
        set({ invoicesLoading: true });
        try {
          const response = await fetch('/api/invoices');
          if (!response.ok) throw new Error('Failed to fetch invoices');
          const data = await response.json();
          get().setInvoices(data.invoices || data);
        } catch (error) {
          console.error('Error fetching invoices:', error);
        } finally {
          set({ invoicesLoading: false });
        }
      },

      // Invalidation methods
      invalidateCustomers: () => set({ cacheTimestamps: { ...get().cacheTimestamps, customers: null } }),
      invalidateVehicles: () => set({ cacheTimestamps: { ...get().cacheTimestamps, vehicles: null } }),
      invalidateServices: () => set({ cacheTimestamps: { ...get().cacheTimestamps, services: null } }),
      invalidateParts: () => set({ cacheTimestamps: { ...get().cacheTimestamps, parts: null } }),
      invalidateInvoices: () => set({ cacheTimestamps: { ...get().cacheTimestamps, invoices: null } }),
      invalidateAll: () => {
        set({
          cacheTimestamps: {
            customers: null,
            vehicles: null,
            services: null,
            parts: null,
            invoices: null,
          },
        });
      },
    }),
    {
      name: 'reference-data-storage',
      partialize: (state) => ({
        customers: state.customers,
        vehicles: state.vehicles,
        services: state.services,
        parts: state.parts,
        invoices: state.invoices,
      }),
    }
  )
);

// Export a hook for easy usage
export const useReferenceData = () => {
  const store = useReferenceDataStore();

  return {
    ...store,
  };
};
