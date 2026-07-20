import { Product, Service, Barber, Review } from '../types';

// Read worker configurations from environment variables
export const WORKER_URL = (import.meta as any).env?.VITE_WORKER_URL || '';
export const CLIENT_ID = (import.meta as any).env?.VITE_CLIENT_ID || 'cli-sovereign';

export interface BusinessInfo {
  client_id: string;
  business_name: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  hero_title?: string;
  hero_subtitle?: string;
  phone?: string;
  email?: string;
  owner_email: string;
  address?: string;
  opening_hours?: string;
  payment_instructions?: string;
  bank_name?: string;
  bank_account_name?: string;
  bank_account_number?: string;
  bank_branch_code?: string;
  active: boolean;
  claim_code?: string;
}

export interface BookingPayload {
  clientId: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  serviceId: string;
  staffId?: string;
  startTime: string; // ISO string
}

export interface OrderPayload {
  clientId: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: {
    productId: string;
    qty: number;
  }[];
  notes?: string;
}

export interface SubmissionPayload {
  clientId: string;
  formName: 'contact' | 'booking' | 'quote' | 'reservation';
  customer: {
    name: string;
    email: string;
  };
  fields: Record<string, any>;
  website?: string;
}

class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function safeFetch(path: string, options?: RequestInit): Promise<any> {
  const url = `${WORKER_URL.replace(/\/$/, '')}${path}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: 'Unknown server error' };
      }
      throw new ApiError(errorData.error || `HTTP ${response.status} error`, response.status);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error instanceof Error ? error.message : 'Network failure or timeout');
  }
}

export const api = {
  // Fetch Business/Client Info
  getBusinessInfo: async (clientId: string): Promise<BusinessInfo> => {
    // If we're calling the worker to get business info, and there's no custom public client GET endpoint,
    // we query it using /api/search?q=info or a standard route that we assume the Worker provides,
    // or fallback dynamically if not found. Let's make a GET request to `/api/client?clientId=${clientId}`.
    return safeFetch(`/api/client?clientId=${encodeURIComponent(clientId)}`);
  },

  // Fetch products belonging to client
  getProducts: async (clientId: string): Promise<Product[]> => {
    return safeFetch(`/api/products?clientId=${encodeURIComponent(clientId)}`);
  },

  // Fetch services belonging to client
  getServices: async (clientId: string): Promise<Service[]> => {
    return safeFetch(`/api/services?clientId=${encodeURIComponent(clientId)}`);
  },

  // Fetch barbers/staff belonging to client
  getBarbers: async (clientId: string): Promise<Barber[]> => {
    return safeFetch(`/api/barbers?clientId=${encodeURIComponent(clientId)}`);
  },

  // Fetch reviews belonging to client
  getReviews: async (clientId: string): Promise<Review[]> => {
    return safeFetch(`/api/reviews?clientId=${encodeURIComponent(clientId)}`);
  },

  // Submit contact form (as formName 'contact')
  submitContactForm: async (payload: SubmissionPayload): Promise<{ success: boolean; submissionId: string; receivedAt: string }> => {
    return safeFetch('/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Create real booking
  createBooking: async (payload: BookingPayload): Promise<{ success: boolean; bookingId: string; startTime: string; endTime: string }> => {
    return safeFetch('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Create real order (checkout)
  createOrder: async (payload: OrderPayload): Promise<{ success: boolean; orderId: string; orderNumber: string; total: number }> => {
    return safeFetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
};
