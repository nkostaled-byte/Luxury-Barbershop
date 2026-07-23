import { Barber, GalleryItem, Product, Review, Service } from '../types';

export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL;
export const WORKER_URL = API_BASE_URL;
export const CLIENT_ID = (import.meta as any).env?.VITE_CLIENT_ID;

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
  owner_email?: string;
  address?: string;
  opening_hours?: string;
  active?: boolean;
}

export interface BookingPayload {
  clientId: string;
  customer: { name: string; email: string; phone: string };
  serviceId: string;
  staffId?: string;
  startTime: string;
}

export interface OrderPayload {
  clientId: string;
  customer: { name: string; email: string; phone: string };
  items: { productId: string; qty: number }[];
  notes?: string;
}

export interface SubmissionPayload {
  clientId: string;
  formName: 'contact' | 'booking' | 'quote' | 'reservation';
  customer: { name: string; email: string };
  fields: Record<string, unknown>;
  website?: string;
}

export interface PublicSiteData {
  business: BusinessInfo;
  products: Product[];
  services: Service[];
  barbers: Barber[];
  reviews: Review[];
  gallery: GalleryItem[];
}

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

function requireApiBaseUrl() {
  if (!API_BASE_URL) throw new ApiError('The website is not configured with a Worker URL.');
  return API_BASE_URL.replace(/\/$/, '');
}

async function fetchJson(path: string, options: RequestInit = {}) {
  const url = `${requireApiBaseUrl()}${path}`;
  console.log('=== fetchJson REQUEST ===');
  console.log('URL:', url);
  console.log('OPTIONS:', options);
  const response = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
  });
  console.log('=== fetchJson RESPONSE ===');
  console.log('STATUS:', response.status);
  console.log('OK:', response.ok);
  const text = await response.text();
  console.log('RAW TEXT:', text);
  const body = text ? JSON.parse(text) : null;
  console.log('PARSED BODY:', body);
  if (!response.ok) throw new ApiError(body?.error || 'The service could not complete your request.', response.status);
  return body;
}

function mapProduct(row: any): Product {
  return { id: row.id, name: row.name, category: row.category ?? 'Grooming', price: Number(row.price), description: row.description ?? '', image: row.image_url ?? row.image ?? '', rating: Number(row.rating ?? 0), stock: Number(row.stock_qty ?? 0), volume: row.volume ?? '' };
}

function mapService(row: any): Service {
  return { id: row.id, name: row.name, category: row.category ?? 'Service', price: Number(row.price), duration: Number(row.duration_minutes ?? row.duration ?? 0), description: row.description ?? '', image: row.image_url ?? row.image ?? '' };
}

function mapBarber(row: any): Barber {
  return { id: row.id, name: row.name, role: row.role ?? '', experience: row.experience ?? '', specialties: row.specialties ?? [], rating: Number(row.rating ?? 0), reviewsCount: Number(row.reviews_count ?? 0), image: row.photo_url ?? row.image ?? '', instagram: row.instagram ?? '', availableDays: row.available_days ?? [], availableSlots: row.available_slots ?? [] };
}

function mapReview(row: any): Review {
  return { id: row.id, name: row.name, rating: Number(row.rating), text: row.text ?? '', date: row.date ?? row.created_at ?? '', avatar: row.avatar ?? '', service: row.service ?? '' };
}

function mapGalleryItem(row: any): GalleryItem {
  return { id: row.id, before: row.before_url ?? row.before ?? '', after: row.after_url ?? row.after ?? '', title: row.title ?? '', barber: row.barber_name ?? row.barber ?? '' };
}

export const api = {
  getPublicSite: async (clientId: string): Promise<PublicSiteData> => {
    console.log('=== getPublicSite START ===');
    console.log('CLIENT_ID:', clientId);
    const fullPath = `/api/public/site?clientId=${encodeURIComponent(clientId)}`;
    console.log('FULL PATH:', fullPath);
    const result = await fetchJson(fullPath);
    console.log('=== getPublicSite RESULT ===');
    console.log('RESULT:', result);
    console.log('RESULT BUSINESS:', result?.business);
    console.log('RESULT BUSINESS TYPE:', typeof result?.business);
    return {
      business: result.business,
      products: (result.products ?? []).map(mapProduct),
      services: (result.services ?? []).map(mapService),
      barbers: (result.staff ?? []).map(mapBarber),
      reviews: (result.reviews ?? []).map(mapReview),
      gallery: (result.gallery ?? []).map(mapGalleryItem),
    };
  },

  getBookingAvailability: async (clientId: string, staffId: string, date: string): Promise<string[]> => {
    const result = await fetchJson(`/api/public/availability?clientId=${encodeURIComponent(clientId)}&staffId=${encodeURIComponent(staffId)}&date=${encodeURIComponent(date)}`);
    return result.slots ?? [];
  },

  submitContactForm: (payload: SubmissionPayload) => fetchJson('/', { method: 'POST', body: JSON.stringify(payload) }),
  createBooking: (payload: BookingPayload) => fetchJson('/api/bookings', { method: 'POST', body: JSON.stringify(payload) }),
  createOrder: (payload: OrderPayload) => fetchJson('/api/orders', { method: 'POST', body: JSON.stringify(payload) }),
  claimAccount: (token: string, businessName?: string) => fetchJson('/api/claim-account', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ businessName }) }),
  relinkAccount: (token: string, claimCode: string) => fetchJson('/api/claim-account/relink', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ claimCode }) }),
  searchAll: (token: string, q: string) => fetchJson(`/api/search?q=${encodeURIComponent(q)}`, { headers: { Authorization: `Bearer ${token}` } }),
};
