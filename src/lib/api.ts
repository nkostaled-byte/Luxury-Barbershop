import { Product, Service, Barber, Review } from '../types';
import { INITIAL_PRODUCTS, INITIAL_SERVICES, INITIAL_BARBERS, INITIAL_REVIEWS } from '../data';
import { supabase } from './supabase';

// --- Supabase row -> frontend type mappers ---------------------------------
// The `products` table (written by the Worker on checkout) only guarantees
// id/client_id/name/description/price/stock_qty/is_hidden/image_url. The UI
// wants a few extra display fields (category/rating/volume) that aren't part
// of the Worker's contract — if you've added those columns to the table
// they'll be picked up automatically; otherwise sensible defaults are used.
function mapProductRow(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category ?? 'Grooming',
    price: Number(row.price),
    description: row.description ?? '',
    image: row.image_url ?? row.image ?? '',
    rating: row.rating != null ? Number(row.rating) : 5,
    stock: row.stock_qty ?? 0,
    volume: row.volume ?? '',
  };
}

function mapServiceRow(row: any): Service {
  return {
    id: row.id,
    name: row.name,
    category: row.category ?? 'Service',
    price: Number(row.price),
    duration: row.duration_minutes ?? row.duration ?? 30,
    description: row.description ?? '',
    image: row.image_url ?? row.image ?? '',
  };
}

function mapBarberRow(row: any): Barber {
  return {
    id: row.id,
    name: row.name,
    role: row.role ?? 'Barber',
    experience: row.experience ?? '',
    specialties: row.specialties ?? [],
    rating: row.rating != null ? Number(row.rating) : 5,
    reviewsCount: row.reviews_count ?? 0,
    image: row.photo_url ?? row.image ?? '',
    instagram: row.instagram ?? '',
    availableDays: row.available_days ?? [],
    availableSlots: row.available_slots ?? [],
  };
}

function mapReviewRow(row: any): Review {
  return {
    id: row.id,
    name: row.name,
    rating: Number(row.rating),
    text: row.text,
    date: row.date ?? row.created_at ?? '',
    avatar: row.avatar ?? '',
    service: row.service ?? '',
  };
}

// Read worker configurations from environment variables
export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || (import.meta as any).env?.VITE_WORKER_URL || 'https://mygrafix-dashboard-worker.mygrafix.workers.dev';
export const WORKER_URL = API_BASE_URL;
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
  const url = `${API_BASE_URL.replace(/\/$/, '')}${path}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    });

    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      let errorData;
      if (contentType?.includes("application/json")) {
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: 'Unknown server error' };
        }
      } else {
        errorData = { error: `Expected JSON but received ${contentType}` };
      }
      throw new ApiError(errorData.error || `HTTP ${response.status} error`, response.status);
    }

    if (!contentType?.includes("application/json")) {
        throw new Error(
            `Expected JSON but received ${contentType}`
        );
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
    try {
      return await safeFetch(`/api/client?clientId=${encodeURIComponent(clientId)}`);
    } catch (err) {
      console.warn('GET /api/client is not supported by Cloudflare Worker. Falling back to local data.', err);
      return {
        client_id: clientId,
        business_name: 'Sovereign Barber',
        logo_url: '',
        primary_color: '#0F0F0F',
        secondary_color: '#141414',
        hero_title: 'THE SOVEREIGN',
        hero_subtitle: 'LUXURY GROOMING AT ITS FINEST',
        owner_email: 'hello@sovereignbarber.com',
        active: true,
      };
    }
  },

  // Fetch products belonging to client — read directly from Supabase.
  // (The Worker has no GET /api/products route; it only writes to this
  // table during checkout. Catalog reads bypass the Worker entirely.)
  getProducts: async (clientId: string): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('client_id', clientId)
      .eq('is_hidden', false)
      .order('name', { ascending: true });

    if (error) {
      console.warn('Supabase query for products failed. Falling back to local products.', error);
      return INITIAL_PRODUCTS;
    }
    return (data ?? []).map(mapProductRow);
  },

  // Fetch services belonging to client — read directly from Supabase.
  getServices: async (clientId: string): Promise<Service[]> => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('client_id', clientId)
      .eq('active', true)
      .order('name', { ascending: true });

    if (error) {
      console.warn('Supabase query for services failed. Falling back to local services.', error);
      return INITIAL_SERVICES;
    }
    return (data ?? []).map(mapServiceRow);
  },

  // Fetch barbers/staff belonging to client — read directly from Supabase.
  getBarbers: async (clientId: string): Promise<Barber[]> => {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('client_id', clientId)
      .eq('active', true)
      .order('name', { ascending: true });

    if (error) {
      console.warn('Supabase query for staff failed. Falling back to local barbers.', error);
      return INITIAL_BARBERS;
    }
    return (data ?? []).map(mapBarberRow);
  },

  // Fetch reviews belonging to client — read directly from Supabase.
  getReviews: async (clientId: string): Promise<Review[]> => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase query for reviews failed. Falling back to local reviews.', error);
      return INITIAL_REVIEWS;
    }
    return (data ?? []).map(mapReviewRow);
  },

  // Submit contact form / general submissions
  submitContactForm: async (payload: SubmissionPayload): Promise<{ success: boolean; submissionId: string; receivedAt: string }> => {
    return safeFetch('/api/contact', {
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
  },

  // --- Auth & Account Claim Endpoints (from worker.js) ---
  claimAccount: async (token: string, businessName?: string): Promise<{ success: boolean; status: string; client: any }> => {
    return safeFetch('/api/claim-account', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ businessName }),
    });
  },

  relinkAccount: async (token: string, claimCode: string): Promise<{ success: boolean; status: string; client: any }> => {
    return safeFetch('/api/claim-account/relink', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ claimCode }),
    });
  },

  // --- Dashboard Search (from worker.js) ---
  searchAll: async (token: string, q: string): Promise<{ success: boolean; query: string; results: any }> => {
    return safeFetch(`/api/search?q=${encodeURIComponent(q)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // --- Upload Endpoint (from worker.js) ---
  uploadFile: async (token: string, folder: string, fileBytes: ArrayBuffer | Blob, contentType: string): Promise<{ success: boolean; url: string; key: string; folder: string }> => {
    return safeFetch(`/api/upload?folder=${encodeURIComponent(folder)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': contentType,
      },
      body: fileBytes,
    });
  },

  // --- Invoicing Endpoints (from worker.js) ---
  createInvoice: async (
    token: string,
    payload: {
      customer: { id?: string; name: string; email?: string; phone?: string };
      items: { productId?: string; description?: string; quantity: number; price: number }[];
      tax?: number;
      orderId?: string;
      dueDate?: string;
    }
  ): Promise<{ success: boolean; invoiceId: string; invoiceNumber: string; total: number; pdfUrl: string }> => {
    return safeFetch('/api/invoices', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  },

  sendInvoice: async (token: string, invoiceId: string): Promise<{ success: boolean; invoiceId: string; status: 'sent' }> => {
    return safeFetch(`/api/invoices/${encodeURIComponent(invoiceId)}/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // --- Export Endpoint (from worker.js) ---
  exportTable: async (token: string, table: string, from?: string, to?: string): Promise<string> => {
    let path = `/api/export/${encodeURIComponent(table)}`;
    const queryParts: string[] = [];
    if (from) queryParts.push(`from=${encodeURIComponent(from)}`);
    if (to) queryParts.push(`to=${encodeURIComponent(to)}`);
    if (queryParts.length > 0) {
      path += `?${queryParts.join('&')}`;
    }
    const url = `${API_BASE_URL.replace(/\/$/, '')}${path}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Export failed with HTTP ${response.status}`);
    }
    return response.text();
  }
};
