# Luxury Barbershop

The public website reads its catalogue and branding from Supabase. The
Cloudflare Worker handles all writes: contact submissions, bookings, orders,
stock updates, and Resend customer/owner emails.

## Configure

1. Copy `.env.example` to `.env.local` and set its four values.
2. Set `VITE_CLIENT_ID` to an active `clients.client_id` in Supabase.
3. Enable Supabase RLS and allow the `anon` role read-only access to the
   public rows in `clients`, `products`, `services`, `staff`, and `reviews`.
   Never grant browser writes.
4. Configure these Worker secrets separately: `SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `RESEND_API_KEY`, and
   `R2_PUBLIC_URL`, plus the required R2 and KV bindings.

## Run locally

```bash
npm install
npm run dev
```

Validate with `npm run lint` and `npm run build`.
