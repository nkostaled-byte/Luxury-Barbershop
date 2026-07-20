import React, { createContext, useContext, useState, useEffect } from 'react';
import { Service, Barber, Booking, Review, Product, CartItem, LoyaltyCard, GiftCardDesign, GalleryItem } from './types';
import { api, CLIENT_ID, BusinessInfo } from './lib/api';

interface AppContextType {
  businessInfo: BusinessInfo | null;
  services: Service[];
  barbers: Barber[];
  bookings: Booking[];
  reviews: Review[];
  gallery: GalleryItem[];
  products: Product[];
  cart: CartItem[];
  wishlist: string[];
  loyaltyCard: LoyaltyCard;
  giftCards: GiftCardDesign[];
  isLoading: boolean;
  error: string | null;
  retryLoad: () => void;
  
  // Services Admin Actions
  addService: (service: Service) => void;
  updateServicePrice: (id: string, newPrice: number) => void;
  deleteService: (id: string) => void;
  
  // Barbers Admin Actions
  updateBarberSpecialties: (id: string, specialties: string[]) => void;
  toggleBarberAvailabilityDay: (id: string, day: string) => void;
  
  // Bookings Actions
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'status'>) => Promise<Booking>;
  cancelBooking: (id: string) => void;
  rescheduleBooking: (id: string, date: string, time: string) => void;
  completeBooking: (id: string) => void;
  
  // Shop Actions
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  submitCheckout: (customer: { name: string; email: string; phone: string }, notes?: string) => Promise<{ success: boolean; orderNumber: string; total: number }>;
  
  // Review Actions
  addReview: (review: Omit<Review, 'id' | 'date'>) => Promise<void>;
  
  // Loyalty Actions
  addLoyaltyPoints: (points: number) => void;
  resetLoyaltyCard: () => void;
  
  // Gift Card Actions
  purchaseGiftCard: (giftCard: GiftCardDesign) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('luxury_barber_bookings');
    return saved ? JSON.parse(saved) : [];
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('luxury_barber_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('luxury_barber_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [loyaltyCard, setLoyaltyCard] = useState<LoyaltyCard>(() => {
    const saved = localStorage.getItem('luxury_barber_loyalty');
    return saved ? JSON.parse(saved) : {
      points: 5,
      totalVisits: 5,
      maxPointsToReward: 8,
      visits: [
        { date: '2026-05-12', service: 'Precision Haircut', pointsEarned: 1 },
        { date: '2026-05-29', service: 'Precision Haircut', pointsEarned: 1 },
        { date: '2026-06-15', service: 'Hydra-Thermal Wash & Style', pointsEarned: 1 },
        { date: '2026-06-30', service: 'Premium Beard Sculpt', pointsEarned: 1 },
        { date: '2026-07-16', service: 'Precision Haircut', pointsEarned: 1 }
      ]
    };
  });

  const [giftCards, setGiftCards] = useState<GiftCardDesign[]>(() => {
    const saved = localStorage.getItem('luxury_barber_giftcards');
    return saved ? JSON.parse(saved) : [];
  });

  // Load all public data through the Cloudflare Worker. There is intentionally
  // no browser-side Supabase call and no demonstration-data fallback.
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!CLIENT_ID) throw new Error('The website is not configured with a client ID.');
      const site = await api.getPublicSite(CLIENT_ID);
      setBusinessInfo(site.business);
      setServices(site.services);
      setBarbers(site.barbers);
      setProducts(site.products);
      setReviews(site.reviews);
      setGallery(site.gallery);
    } catch (err: any) {
      console.warn('Could not load data from Cloudflare Worker:', err);
      setError(err?.message || 'We could not load the business information. Please try again shortly.');
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    loadData();
  }, []);

  // Sync brand colours dynamically when business info updates
  useEffect(() => {
    if (businessInfo) {
      if (businessInfo.primary_color) {
        document.documentElement.style.setProperty('--color-gold', businessInfo.primary_color);
      }
      if (businessInfo.secondary_color) {
        document.documentElement.style.setProperty('--color-luxury-bg', businessInfo.secondary_color);
      }
    }
  }, [businessInfo]);

  // Sync custom client state to localStorage
  useEffect(() => {
    localStorage.setItem('luxury_barber_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('luxury_barber_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('luxury_barber_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('luxury_barber_loyalty', JSON.stringify(loyaltyCard));
  }, [loyaltyCard]);

  useEffect(() => {
    localStorage.setItem('luxury_barber_giftcards', JSON.stringify(giftCards));
  }, [giftCards]);

  // SERVICES ACTIONS
  const addService = (service: Service) => {
    setServices(prev => [...prev, service]);
  };

  const updateServicePrice = (id: string, newPrice: number) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, price: newPrice } : s));
    setBookings(prev => prev.map(b => b.serviceId === id && b.status === 'confirmed' ? { ...b, price: newPrice } : b));
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  // BARBERS ACTIONS
  const updateBarberSpecialties = (id: string, specialties: string[]) => {
    setBarbers(prev => prev.map(b => b.id === id ? { ...b, specialties } : b));
  };

  const toggleBarberAvailabilityDay = (id: string, day: string) => {
    setBarbers(prev => prev.map(b => {
      if (b.id !== id) return b;
      const exist = b.availableDays.includes(day);
      const newDays = exist 
        ? b.availableDays.filter(d => d !== day)
        : [...b.availableDays, day];
      return { ...b, availableDays: newDays };
    }));
  };

  // BOOKINGS ACTIONS
  const addBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>) => {
    try {
      const startTimeIso = new Date(`${bookingData.date}T${bookingData.time}:00`).toISOString();
      const res = await api.createBooking({
        clientId: CLIENT_ID,
        customer: {
          name: bookingData.customerName,
          email: bookingData.customerEmail,
          phone: bookingData.customerPhone,
        },
        serviceId: bookingData.serviceId,
        staffId: bookingData.barberId,
        startTime: startTimeIso,
      });

      const newBooking: Booking = {
        ...bookingData,
        id: res.bookingId,
        status: 'confirmed',
        createdAt: new Date().toISOString()
      };
      
      setBookings(prev => [newBooking, ...prev]);

      // Loyalty update
      setLoyaltyCard(prev => {
        const newPoints = prev.points >= prev.maxPointsToReward ? 1 : prev.points + 1;
        return {
          ...prev,
          points: newPoints,
          totalVisits: prev.totalVisits + 1,
          visits: [
            { date: bookingData.date, service: bookingData.serviceName, pointsEarned: 1 },
            ...prev.visits
          ]
        };
      });

      return newBooking;
    } catch (err: any) {
      console.error('Failed to create booking on Cloudflare Worker:', err);
      throw new Error(err?.message || 'Failed to submit booking to the reservation engine.');
    }
  };

  const cancelBooking = (id: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
  };

  const rescheduleBooking = (id: string, date: string, time: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, date, time } : b));
  };

  const completeBooking = (id: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'completed' } : b));
  };

  // SHOP ACTIONS
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id);
      if (existingIndex > -1) {
        const nextCart = [...prev];
        nextCart[existingIndex].quantity += 1;
        return nextCart;
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => item.product.id === productId ? { ...item, quantity: qty } : item));
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => prev.includes(productId) 
      ? prev.filter(id => id !== productId) 
      : [...prev, productId]
    );
  };

  const submitCheckout = async (
    customer: { name: string; email: string; phone: string },
    notes?: string
  ) => {
    try {
      const res = await api.createOrder({
        clientId: CLIENT_ID,
        customer,
        items: cart.map(item => ({
          productId: item.product.id,
          qty: item.quantity,
        })),
        notes,
      });
      clearCart();
      return {
        success: true,
        orderNumber: res.orderNumber,
        total: res.total,
      };
    } catch (err: any) {
      console.error('Failed to submit order to Cloudflare Worker:', err);
      throw new Error(err?.message || 'Failed to submit order to checkout engine.');
    }
  };

  // REVIEWS ACTIONS
  const addReview = async (reviewData: Omit<Review, 'id' | 'date'>) => {
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: 'Just now'
    };
    setReviews(prev => [newReview, ...prev]);

    try {
      await api.submitContactForm({
        clientId: CLIENT_ID!, formName: 'contact', customer: { name: reviewData.name, email: 'guest@mygrafixmedia.online' },
        fields: { SubmissionType: 'Review Feedback', rating: reviewData.rating, service: reviewData.service, review_text: reviewData.text }
      });
    } catch (err) { console.warn('Failed to submit review log to Worker:', err); }
  };

  // LOYALTY ACTIONS
  const addLoyaltyPoints = (points: number) => {
    setLoyaltyCard(prev => {
      const updatedPoints = prev.points + points;
      const pointsCapped = updatedPoints % (prev.maxPointsToReward + 1);
      return {
        ...prev,
        points: pointsCapped,
        totalVisits: prev.totalVisits + points
      };
    });
  };

  const resetLoyaltyCard = () => {
    setLoyaltyCard({
      points: 0,
      totalVisits: 0,
      maxPointsToReward: 8,
      visits: []
    });
  };

  // GIFT CARDS ACTIONS
  const purchaseGiftCard = (giftCard: GiftCardDesign) => {
    setGiftCards(prev => [giftCard, ...prev]);
  };

  return (
    <AppContext.Provider value={{
      businessInfo,
      services,
      barbers,
      bookings,
      reviews,
      gallery,
      products,
      cart,
      wishlist,
      loyaltyCard,
      giftCards,
      isLoading,
      error,
      retryLoad: loadData,
      
      addService,
      updateServicePrice,
      deleteService,
      
      updateBarberSpecialties,
      toggleBarberAvailabilityDay,
      
      addBooking,
      cancelBooking,
      rescheduleBooking,
      completeBooking,
      
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      toggleWishlist,
      submitCheckout,
      
      addReview,
      addLoyaltyPoints,
      resetLoyaltyCard,
      purchaseGiftCard
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
