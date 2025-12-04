/**
 * Tenant-aware API Client
 * Automatically includes tenant context in all API requests
 */

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface ApiClientOptions {
  baseUrl?: string
  headers?: Record<string, string>
}

interface RequestOptions<T = unknown> {
  method?: HttpMethod
  body?: T
  headers?: Record<string, string>
  cache?: RequestCache
  next?: NextFetchRequestConfig
}

interface NextFetchRequestConfig {
  revalidate?: number | false
  tags?: string[]
}

interface ApiResponse<T> {
  data: T
  success: boolean
  error?: string
  pagination?: {
    currentPage: number
    totalPages: number
    totalCount: number
    limit: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

class ApiClient {
  private baseUrl: string
  private defaultHeaders: Record<string, string>

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl || ''
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.headers,
    }
  }

  private async request<TResponse, TBody = unknown>(
    endpoint: string,
    options: RequestOptions<TBody> = {}
  ): Promise<ApiResponse<TResponse>> {
    const { method = 'GET', body, headers = {}, cache, next } = options

    const url = `${this.baseUrl}${endpoint}`

    const fetchOptions: RequestInit = {
      method,
      headers: {
        ...this.defaultHeaders,
        ...headers,
      },
      cache,
    }

    // Add next config for Next.js specific options
    if (next) {
      (fetchOptions as any).next = next
    }

    // Add body for non-GET requests
    if (body && method !== 'GET') {
      fetchOptions.body = JSON.stringify(body)
    }

    try {
      const response = await fetch(url, fetchOptions)

      // Handle no content responses
      if (response.status === 204) {
        return { data: null as TResponse, success: true }
      }

      const data = await response.json()

      if (!response.ok) {
        return {
          data: null as TResponse,
          success: false,
          error: data.error || `Request failed with status ${response.status}`,
        }
      }

      // Handle paginated responses
      if (data.pagination) {
        return {
          data: data[Object.keys(data).find(k => k !== 'pagination') || 'data'] as TResponse,
          success: true,
          pagination: data.pagination,
        }
      }

      return {
        data: data as TResponse,
        success: true,
      }
    } catch (error) {
      console.error(`API Error [${method}] ${endpoint}:`, error)
      return {
        data: null as TResponse,
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      }
    }
  }

  // GET request
  async get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  // POST request
  async post<T, B = unknown>(endpoint: string, body?: B, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T, B>(endpoint, { ...options, method: 'POST', body })
  }

  // PUT request
  async put<T, B = unknown>(endpoint: string, body?: B, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T, B>(endpoint, { ...options, method: 'PUT', body })
  }

  // PATCH request
  async patch<T, B = unknown>(endpoint: string, body?: B, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T, B>(endpoint, { ...options, method: 'PATCH', body })
  }

  // DELETE request
  async delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

// Default API client instance
export const api = new ApiClient({
  baseUrl: '/api',
})

// Typed API endpoints for better DX
export const apiEndpoints = {
  // Auth
  auth: {
    session: () => '/auth/session',
    signIn: () => '/auth/signin',
    signOut: () => '/auth/signout',
  },

  // Tenant
  tenant: {
    current: () => '/tenant/current',
    branding: () => '/tenant/branding',
    subscription: () => '/tenant/subscription',
    settings: () => '/tenant/settings',
  },

  // Customers
  customers: {
    list: (params?: string) => `/customers${params ? `?${params}` : ''}`,
    get: (id: string) => `/customers/${id}`,
    create: () => '/customers',
    update: (id: string) => `/customers/${id}`,
    delete: (id: string) => `/customers/${id}`,
  },

  // Vehicles
  vehicles: {
    list: (params?: string) => `/vehicles${params ? `?${params}` : ''}`,
    get: (id: string) => `/vehicles/${id}`,
    create: () => '/vehicles',
    update: (id: string) => `/vehicles/${id}`,
    delete: (id: string) => `/vehicles/${id}`,
    byCustomer: (customerId: string) => `/customers/${customerId}/vehicles`,
  },

  // Job Cards
  jobCards: {
    list: (params?: string) => `/job-cards${params ? `?${params}` : ''}`,
    get: (id: string) => `/job-cards/${id}`,
    create: () => '/job-cards',
    update: (id: string) => `/job-cards/${id}`,
    delete: (id: string) => `/job-cards/${id}`,
  },

  // Invoices
  invoices: {
    list: (params?: string) => `/invoices${params ? `?${params}` : ''}`,
    get: (id: string) => `/invoices/${id}`,
    create: () => '/invoices',
    update: (id: string) => `/invoices/${id}`,
    delete: (id: string) => `/invoices/${id}`,
  },

  // Estimates
  estimates: {
    list: (params?: string) => `/estimates${params ? `?${params}` : ''}`,
    get: (id: string) => `/estimates/${id}`,
    create: () => '/estimates',
    update: (id: string) => `/estimates/${id}`,
    delete: (id: string) => `/estimates/${id}`,
  },

  // Parts
  parts: {
    list: (params?: string) => `/parts${params ? `?${params}` : ''}`,
    get: (id: string) => `/parts/${id}`,
    create: () => '/parts',
    update: (id: string) => `/parts/${id}`,
    delete: (id: string) => `/parts/${id}`,
  },

  // Appointments
  appointments: {
    list: (params?: string) => `/appointments${params ? `?${params}` : ''}`,
    get: (id: string) => `/appointments/${id}`,
    create: () => '/appointments',
    update: (id: string) => `/appointments/${id}`,
    delete: (id: string) => `/appointments/${id}`,
  },

  // Inspections
  inspections: {
    list: (params?: string) => `/inspections${params ? `?${params}` : ''}`,
    get: (id: string) => `/inspections/${id}`,
    create: () => '/inspections',
    update: (id: string) => `/inspections/${id}`,
    delete: (id: string) => `/inspections/${id}`,
  },

  // Services
  services: {
    list: (params?: string) => `/services${params ? `?${params}` : ''}`,
    get: (id: string) => `/services/${id}`,
    create: () => '/services',
    update: (id: string) => `/services/${id}`,
    delete: (id: string) => `/services/${id}`,
  },

  // Users
  users: {
    list: (params?: string) => `/users${params ? `?${params}` : ''}`,
    get: (id: string) => `/users/${id}`,
    create: () => '/users',
    update: (id: string) => `/users/${id}`,
    delete: (id: string) => `/users/${id}`,
  },

  // Dashboard
  dashboard: {
    stats: () => '/dashboard/stats',
    recentActivity: () => '/dashboard/activity',
    charts: () => '/dashboard/charts',
  },

  // Payments
  payments: {
    list: (params?: string) => `/payments${params ? `?${params}` : ''}`,
    get: (id: string) => `/payments/${id}`,
    create: () => '/payments',
    update: (id: string) => `/payments/${id}`,
    delete: (id: string) => `/payments/${id}`,
  },

  // Admin (Super Admin only)
  admin: {
    tenants: {
      list: (params?: string) => `/admin/tenants${params ? `?${params}` : ''}`,
      get: (id: string) => `/admin/tenants/${id}`,
      create: () => '/admin/tenants',
      update: (id: string) => `/admin/tenants/${id}`,
      suspend: (id: string) => `/admin/tenants/${id}/suspend`,
      activate: (id: string) => `/admin/tenants/${id}/activate`,
    },
    subscriptions: {
      list: () => '/admin/subscriptions',
      update: (tenantId: string) => `/admin/tenants/${tenantId}/subscription`,
    },
    stats: () => '/admin/stats',
  },
}

export { ApiClient }
export type { ApiClientOptions, RequestOptions, ApiResponse }
