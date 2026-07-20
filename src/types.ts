export interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: number; // in minutes
  description: string;
  image: string;
}

export interface Barber {
  id: string;
  name: string;
  role: string;
  experience: string;
  specialties: string[];
  rating: number;
  reviewsCount: number;
  image: string;
  instagram: string;
  availableDays: string[]; // e.g. ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  availableSlots: string[]; // e.g. ["09:00", "10:00", ...]
}

export interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  price: number;
  barberId: string;
  barberName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  date: string;
  avatar: string;
  service: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  rating: number;
  stock: number;
  volume: string; // e.g., "100ml", "150g"
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  period: 'month' | 'year';
  benefits: string[];
  popular?: boolean;
}

export interface LoyaltyCard {
  points: number;
  totalVisits: number;
  maxPointsToReward: number; // e.g. 8 points for free haircut
  visits: { date: string; service: string; pointsEarned: number }[];
}

export interface GiftCardDesign {
  id: string;
  amount: number;
  recipientName: string;
  recipientEmail: string;
  senderName: string;
  senderEmail: string;
  message: string;
  deliveryDate: string;
  theme: 'gold' | 'midnight' | 'emerald';
}
