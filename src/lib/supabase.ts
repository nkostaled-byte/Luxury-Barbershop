import { createClient } from '@supabase/supabase-js';

// Catalog data (products, services, barbers, reviews) is read directly from
// Supabase with the public anon key — these are public, read-only lookups
// scoped to this business by client_id, protected by Row Level Security.
//
// Anything that WRITES data (bookings, orders, uploads, invoices) still goes
// through the Cloudflare Worker — never write to Supabase from the browser.
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    'VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set. ' +
    'Product/service/barber/review data will fail to load until these are configured.'
  );
}

export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-anon-key'
);
