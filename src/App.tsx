import React, { useState, useEffect, useRef } from 'react';
import { AppProvider, useApp } from './AppContext';
import { api, CLIENT_ID, WORKER_URL } from './lib/api';
import { LuxuryLoader } from './components/LuxuryLoader';
import { BookingFlow } from './components/BookingFlow';
import { ShopAndCart } from './components/ShopAndCart';
import { AdminDashboard } from './components/AdminDashboard';
import { BeforeAfterSlider } from './components/BeforeAfterSlider';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scissors, Calendar, Award, Star, Phone, MapPin, Clock, MessageSquare, 
  ChevronDown, ChevronUp, Check, Mail, Heart, ShoppingBag, Eye, Send, 
  Sparkles, ShieldCheck, HelpCircle, ArrowUp, Menu, X, LayoutDashboard, AlertCircle
} from 'lucide-react';

function AppContent() {
  const { 
    services, barbers, reviews, gallery, addReview,
    businessInfo, isLoading, error, retryLoad
  } = useApp();
  
  // Navigation & Scroll states
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Active bookings ID selectors for fast scroll-booking triggers
  const [preSelectedService, setPreSelectedService] = useState('');
  const [preSelectedBarber, setPreSelectedBarber] = useState('');
  const [bookingTriggerStamp, setBookingTriggerStamp] = useState(0); // to force reset/retrigger inside BookingFlow

  // General interactive UI states
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [selectedReviewIndex, setSelectedReviewIndex] = useState(0);
  const [cookieBannerOpen, setCookieBannerOpen] = useState(true);
  const [adminConsoleOpen, setAdminConsoleOpen] = useState(false);

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactError, setContactError] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Track scroll position for header transformations & back-to-top buttons
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      setIsScrolled(scrollY > 50);
      setShowBackToTop(scrollY > 500);
      if (docHeight > 0) {
        setScrollProgress((scrollY / docHeight) * 100);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Scroll to targeted visual element with offsets
  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // height of sticky nav
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Trigger quick reservation scroll
  const triggerReservation = (svcId?: string, bbrId?: string) => {
    if (svcId) setPreSelectedService(svcId);
    if (bbrId) setPreSelectedBarber(bbrId);
    setBookingTriggerStamp(prev => prev + 1);
    scrollToSection('online-booking');
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;
    
    setIsSubmittingContact(true);
    setContactError('');
    try {
      await api.submitContactForm({
        clientId: CLIENT_ID!, formName: 'contact',
        customer: { name: contactName, email: contactEmail },
        fields: { message: contactMessage, page_url: window.location.href }
      });
      setContactSuccess(true);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      setTimeout(() => setContactSuccess(false), 5000);
    } catch (err: any) {
      console.error('Contact submission failed:', err);
      setContactError(err?.message || 'Failed to dispatch your enquiry. Please check connection.');
    } finally {
      setIsSubmittingContact(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] text-[#F8F8F8] flex flex-col justify-center items-center px-6">
        <div className="w-full max-w-md space-y-8 animate-pulse text-center">
          <div className="flex justify-center mb-4">
            <Scissors className="w-10 h-10 text-gold/60 animate-spin animate-infinite" style={{ animationDuration: '3s' }} />
          </div>
          <div className="h-8 bg-white/5 rounded w-3/4 mx-auto" />
          <div className="h-4 bg-white/5 rounded w-1/2 mx-auto" />
          <div className="space-y-3 pt-8">
            <div className="h-2 bg-white/5 rounded w-full" />
            <div className="h-2 bg-white/5 rounded w-5/6 mx-auto" />
            <div className="h-2 bg-white/5 rounded w-2/3 mx-auto" />
          </div>
          <span className="text-[10px] tracking-widest text-gold/40 block mt-12">SYNCHRONIZING WITH MY GRAFIX OS...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] text-[#F8F8F8] flex flex-col justify-center items-center px-6">
        <div className="w-full max-w-lg bg-[#171717] border border-red-500/20 p-8 rounded-sm space-y-6 text-center shadow-2xl relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-red-500/10 via-red-500/50 to-red-500/10" />
          
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
              <AlertCircle className="w-8 h-8" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] tracking-[0.25em] text-red-500 uppercase font-bold">WORKER CONNECTION FAILURE</span>
            <h2 className="font-bebas text-3xl tracking-wider text-white">SYSTEM OUT OF SYNC</h2>
            <p className="text-xs text-[#A7A7A7] leading-relaxed max-w-md mx-auto">
              We encountered an issue communicating with the Cloudflare Worker backend.
              <br />
              <span className="text-white/80 block mt-2 font-mono text-[11px] bg-black/40 p-2.5 rounded border border-white/5">
                Error: {error}
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={retryLoad}
              className="px-6 py-3 bg-gold hover:bg-gold/90 text-black text-xs font-space font-bold tracking-widest uppercase transition-all rounded-sm flex items-center justify-center gap-2"
            >
              RETRY CONNECTION
            </button>
          </div>
          
          <div className="text-[10px] text-[#A7A7A7]/40 font-mono">
            Client ID: {CLIENT_ID} | Worker: {WORKER_URL || 'Local Origin'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0F0F0F] text-[#F8F8F8] selection:bg-gold selection:text-black">
      
      {/* 1. LUXURY PAGE INITIAL LOAD SCREEN */}
      <LuxuryLoader />

      {/* 3. SCROLL PROGRESS INDICATOR BAR */}
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-white/5 z-[9999]">
        <div 
          className="h-full bg-gold shadow-[0_0_8px_rgba(200,155,60,0.8)] transition-all duration-100" 
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* 4. PREMIUM STICKY HEADER */}
      <header 
        id="navbar"
        className={`fixed top-0 inset-x-0 z-[999] transition-all duration-500 border-b ${
          isScrolled 
            ? 'bg-[#0F0F0F]/95 py-3 backdrop-blur-md border-white/5 shadow-lg' 
            : 'bg-transparent py-6 border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          {/* Logo Left */}
          <div 
            onClick={() => scrollToSection('hero')} 
            className="flex items-center gap-2 cursor-pointer group"
          >
            {businessInfo?.logo_url ? (
              <img 
                src={businessInfo.logo_url} 
                alt={businessInfo.business_name} 
                className="max-h-8 object-contain" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <>
                <Scissors className="w-5 h-5 text-gold group-hover:rotate-12 transition-transform duration-300" />
                <span className="font-bebas text-2xl tracking-[0.2em] text-white uppercase">{businessInfo?.business_name || 'SOVEREIGN'}</span>
              </>
            )}
          </div>

          {/* Navigation Center */}
          <nav className="hidden md:flex items-center gap-8 text-[11px] tracking-[0.2em] font-sans font-semibold uppercase text-[#A7A7A7]">
            {[
              { label: 'SERVICES', id: 'services' },
              { label: 'CRAFTSMEN', id: 'barbers' },
              { label: 'BEFORE & AFTER', id: 'gallery' },
              { label: 'APOTHECARY', id: 'shop' },
              { label: 'RECOGNITIONS', id: 'reviews' },
              { label: 'CONTACT', id: 'contact' }
            ].map((link, i) => (
              <button
                key={i}
                onClick={() => scrollToSection(link.id)}
                className="hover:text-gold transition-colors relative py-1 group/item"
              >
                <span>{link.label}</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-gold transition-all duration-300 group-hover/item:w-full" />
              </button>
            ))}
          </nav>

          {/* Book Appointment CTA Right */}
          <div className="hidden md:flex items-center gap-4">
            {/* Quick secret admin login portal button */}
            <button
              type="button"
              onClick={() => {
                setAdminConsoleOpen(!adminConsoleOpen);
                if (!adminConsoleOpen) {
                  setTimeout(() => {
                    const el = document.getElementById('admin-ledger-console');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
              className={`p-2 border rounded-full transition-all ${
                adminConsoleOpen 
                  ? 'bg-gold/15 border-gold text-gold' 
                  : 'bg-white/5 border-white/5 text-[#A7A7A7] hover:text-white'
              }`}
              title="Concierge Admin Console"
            >
              <LayoutDashboard className="w-4 h-4" />
            </button>

            <button
              onClick={() => triggerReservation()}
              className="px-5 py-2 bg-gold hover:bg-gold/90 text-[#0F0F0F] text-xs font-space font-bold tracking-widest uppercase transition-all rounded-sm shadow-[0_4px_12px_rgba(200,155,60,0.15)] hover:shadow-[0_4px_20px_rgba(200,155,60,0.35)]"
            >
              BOOK APPOINTMENT
            </button>
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="md:hidden flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setAdminConsoleOpen(!adminConsoleOpen);
                if (!adminConsoleOpen) {
                  setTimeout(() => {
                    const el = document.getElementById('admin-ledger-console');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
              className="p-1.5 bg-white/5 border border-white/5 rounded text-[#A7A7A7]"
            >
              <LayoutDashboard className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-white bg-white/5 rounded-sm border border-white/10"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 right-0 bg-[#0F0F0F] border-b border-white/10 px-6 py-6 space-y-4 md:hidden shadow-2xl flex flex-col items-center text-center"
            >
              {[
                { label: 'SERVICES', id: 'services' },
                { label: 'CRAFTSMEN', id: 'barbers' },
                { label: 'BEFORE & AFTER', id: 'gallery' },
                { label: 'APOTHECARY', id: 'shop' },
                { label: 'RECOGNITIONS', id: 'reviews' },
                { label: 'CONTACT', id: 'contact' }
              ].map((link, i) => (
                <button
                  key={i}
                  onClick={() => scrollToSection(link.id)}
                  className="text-sm tracking-widest text-[#A7A7A7] hover:text-white uppercase font-bold py-1 w-full"
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => triggerReservation()}
                className="w-full py-2.5 bg-gold text-[#0F0F0F] text-xs font-space font-bold tracking-widest uppercase rounded-sm"
              >
                BOOK APPOINTMENT
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 5. HERO SECTION */}
      <section 
        id="hero"
        className="relative h-screen flex flex-col justify-center items-center text-center px-6 overflow-hidden"
      >
        {/* Background Visual Frame */}
        <div className="absolute inset-0 bg-black/40 z-10" />
        
        {/* Film grain noise overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.04] bg-repeat bg-center z-10" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noise\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.8\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noise)\"/%3E%3C/svg%3E')" }} />

        {/* Premium cinematic background image with subtle Zoom movement */}
        <motion.div 
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.5 }}
          transition={{ duration: 3, ease: 'easeOut' }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1600&q=80')" }}
        />

        {/* Ambient Warm Golden Overlay Ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[140px] pointer-events-none z-10" />

        <div className="relative z-20 max-w-4xl space-y-6 px-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex items-center justify-center gap-1.5 text-xs text-gold font-bold tracking-[0.3em] uppercase font-space"
          >
            <Star className="w-3.5 h-3.5 fill-current" /> ★★★★★ 4.9 GOOGLE RATING <Star className="w-3.5 h-3.5 fill-current" />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
            className="font-bebas text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-[0.05em] text-[#F8F8F8] leading-none uppercase"
          >
            {businessInfo?.hero_title ? (
              businessInfo.hero_title
            ) : (
              <>
                LOOK SHARP <br />
                <span className="text-gold shadow-glow">FEEL CONFIDENT</span>
              </>
            )}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="text-[#A7A7A7] text-sm sm:text-base md:text-lg max-w-xl mx-auto font-sans font-medium tracking-wide leading-relaxed"
          >
            {businessInfo?.hero_subtitle || "Premium grooming crafted for gentlemen who value confidence, precision and style. Unwind inside South Africa's finest artisanal apothecary and shaves parlour."}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-6"
          >
            <button
              onClick={() => triggerReservation()}
              className="px-8 py-3.5 bg-gold hover:bg-gold/90 text-[#0F0F0F] text-xs font-space font-bold tracking-widest uppercase transition-all rounded-sm shadow-[0_4px_15px_rgba(200,155,60,0.25)] hover:shadow-[0_4px_25px_rgba(200,155,60,0.45)]"
            >
              BOOK RESERVATION
            </button>
            <button
              onClick={() => scrollToSection('services')}
              className="px-8 py-3.5 bg-[#171717]/85 hover:bg-white/[0.04] border border-white/10 hover:border-white/30 text-[#F8F8F8] text-xs font-space tracking-widest uppercase transition-all rounded-sm backdrop-blur-md"
            >
              EXPLORE SERVICES
            </button>
          </motion.div>
        </div>

        {/* Hero Trust Indicators Footer */}
        <div className="absolute bottom-16 z-20 w-full max-w-4xl mx-auto px-6 hidden md:grid grid-cols-3 gap-8 text-center text-xs tracking-[0.2em] uppercase font-space text-[#A7A7A7]/80">
          <div className="border-r border-white/5 space-y-1">
            <span className="text-[#F8F8F8] font-bold block text-sm">5000+</span>
            <span>HAIRCUTS COMPLETED</span>
          </div>
          <div className="border-r border-white/5 space-y-1">
            <span className="text-[#F8F8F8] font-bold block text-sm">15+ YEARS</span>
            <span>EXPERIENCE</span>
          </div>
          <div className="space-y-1">
            <span className="text-[#F8F8F8] font-bold block text-sm">100%</span>
            <span>SATISFACTION RATING</span>
          </div>
        </div>

        {/* Animated Scroll indicator */}
        <div 
          onClick={() => scrollToSection('services')}
          className="absolute bottom-6 z-20 cursor-pointer flex flex-col items-center gap-2 group text-[#A7A7A7] hover:text-gold transition-colors"
        >
          <span className="text-[9px] tracking-[0.25em] uppercase font-bold">SCROLL TO CATALOG</span>
          <div className="w-5 h-8 border-2 border-white/10 group-hover:border-gold rounded-full p-1 transition-colors flex justify-center">
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              className="w-1 h-2 bg-gold rounded-full"
            />
          </div>
        </div>
      </section>

      {/* 6. APPOINTMENT RESERVATION ANCHOR BOOKING FLOW */}
      <section id="online-booking" className="py-24 px-6 md:px-12 bg-[#0F0F0F] relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center space-y-3 mb-16">
            <span className="text-xs text-gold uppercase tracking-[0.3em] font-bold block">SECURE AN APPOINTMENT</span>
            <h2 className="font-bebas text-5xl md:text-6xl tracking-wide text-[#F8F8F8]">THE APPOINTMENT CONCIERGE</h2>
            <div className="w-12 h-[1px] bg-gold mx-auto" />
          </div>

          <BookingFlow 
            key={bookingTriggerStamp}
            preSelectedServiceId={preSelectedService}
            preSelectedBarberId={preSelectedBarber}
            onSuccessClose={() => {
              setPreSelectedService('');
              setPreSelectedBarber('');
              scrollToSection('services');
            }}
          />
        </div>
      </section>

      {/* 7. SERVICES SECTION */}
      <section id="services" className="py-24 px-6 md:px-12 bg-[#171717] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div className="space-y-2">
              <span className="text-xs text-gold uppercase tracking-[0.3em] font-bold block">THE MENU</span>
              <h2 className="font-bebas text-5xl md:text-6xl tracking-wide text-white">THE GROOMING EXPERIENCE</h2>
            </div>
            <p className="text-sm text-[#A7A7A7] max-w-sm">
              Each experience is complete with sensory hot towel steam, neck massage, custom oils and single malt whiskey or gourmet cold beverages.
            </p>
          </div>

          {/* Dynamic Services Editorial Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <div 
                key={service.id}
                className="group bg-[#0F0F0F] border border-white/5 hover:border-gold/30 rounded-sm overflow-hidden flex flex-col transition-all duration-500 shadow-xl"
              >
                {/* Styled Image Header */}
                <div className="relative h-60 overflow-hidden bg-black/20">
                  <img 
                    src={service.image} 
                    alt={service.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  {/* Category Stamp label */}
                  <span className="absolute top-4 left-4 bg-black/80 border border-white/10 text-white font-space text-[9px] tracking-widest px-2.5 py-0.5 uppercase">
                    {service.category}
                  </span>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline gap-2">
                      <h4 className="font-bold text-lg text-white font-sans group-hover:text-gold transition-colors truncate">
                        {service.name}
                      </h4>
                      <span className="font-space text-lg text-gold font-bold shrink-0">
                        R{service.price}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-gold/80 font-space font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{service.duration} MINUTES</span>
                    </div>

                    <p className="text-xs text-[#A7A7A7] leading-relaxed line-clamp-3">
                      {service.description}
                    </p>
                  </div>

                  <button
                    onClick={() => triggerReservation(service.id)}
                    className="w-full py-2.5 bg-white/5 hover:bg-gold hover:text-black border border-white/10 hover:border-gold font-space text-xs font-bold tracking-widest uppercase transition-all rounded-sm flex items-center justify-center gap-1.5"
                  >
                    BOOK THIS EXPERIENCE
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. MEET THE BARBERS */}
      <section id="barbers" className="py-24 px-6 md:px-12 bg-[#0F0F0F]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-3 mb-16">
            <span className="text-xs text-gold uppercase tracking-[0.3em] font-bold block">OUR TEAM</span>
            <h2 className="font-bebas text-5xl md:text-6xl tracking-wide text-white">OUR EXPERT CRAFTSMEN</h2>
            <div className="w-12 h-[1px] bg-gold mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {barbers.map((barber) => (
              <div 
                key={barber.id}
                className="group bg-[#171717] border border-white/5 hover:border-gold/30 p-6 rounded-sm text-center relative flex flex-col items-center transition-all duration-300"
              >
                {/* Founder label badge absolute */}
                {barber.id === 'b1' && (
                  <span className="absolute top-4 right-4 bg-gold text-[#0F0F0F] text-[9px] font-space font-bold tracking-widest px-2 py-0.5 rounded-sm uppercase">
                    FOUNDER
                  </span>
                )}

                <div className="relative w-28 h-28 rounded-full overflow-hidden mb-5 border-2 border-white/10 group-hover:border-gold transition-colors duration-300">
                  <img 
                    src={barber.image} 
                    alt={barber.name} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <h3 className="font-sans font-extrabold text-lg text-white group-hover:text-gold transition-colors">
                  {barber.name}
                </h3>
                <span className="text-gold text-xs font-medium block mt-1 tracking-wider">{barber.role}</span>
                <span className="text-[10px] text-[#A7A7A7] uppercase block mt-0.5 font-space tracking-widest">{barber.experience}</span>

                {/* Specialties tags */}
                <div className="flex flex-wrap justify-center gap-1.5 my-4">
                  {barber.specialties.map((spec, i) => (
                    <span 
                      key={i} 
                      className="text-[10px] bg-black/40 border border-white/5 text-[#A7A7A7] px-2 py-0.5 rounded-full"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Star rating info */}
                <div className="flex items-center gap-1 text-xs text-[#A7A7A7] font-space border-t border-b border-white/5 py-2.5 w-full justify-center mb-5">
                  <Star className="w-3.5 h-3.5 text-gold fill-current" />
                  <span className="font-semibold text-white">{barber.rating}</span>
                  <span>({barber.reviewsCount} visits)</span>
                </div>

                <div className="flex gap-3 w-full mt-auto">
                  <button
                    onClick={() => triggerReservation('', barber.id)}
                    className="flex-1 py-2 bg-gold hover:bg-gold/90 text-black font-space text-[10px] font-bold tracking-widest uppercase transition-all rounded-sm"
                  >
                    BOOK THIS CRAFTSMAN
                  </button>
                  <a 
                    href={`https://instagram.com/${barber.instagram}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-2 border border-white/10 hover:border-gold hover:text-gold rounded-sm text-[#A7A7A7] transition-all flex items-center justify-center"
                  >
                    <span className="text-[10px] font-space font-bold uppercase px-1">IG</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. BEFORE & AFTER SPLIT COMPARATIVE SECTION */}
      <section id="gallery" className="py-24 px-6 md:px-12 bg-[#171717] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div className="space-y-2">
              <span className="text-xs text-gold uppercase tracking-[0.3em] font-bold block">OUR WORK</span>
              <h2 className="font-bebas text-5xl md:text-6xl tracking-wide text-white">SIGNATURE RESULTS</h2>
            </div>
            <p className="text-sm text-[#A7A7A7] max-w-sm">
              Inspect the micro-blends and precision trims up close. Drag the gold slider bar horizontally across each portrait canvas.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {gallery.length ? gallery.map((item) => (
              <BeforeAfterSlider key={item.id} before={item.before} after={item.after} title={item.title} barber={item.barber} />
            )) : <p className="col-span-full text-sm text-[#A7A7A7]">No gallery images have been published yet.</p>}
          </div>
        </div>
      </section>

      {/* 10. APOTHECARY PRODUCT SHOP SECTION */}
      <section id="shop" className="py-24 px-6 md:px-12 bg-[#0F0F0F]">
        <div className="max-w-7xl mx-auto">
          <ShopAndCart />
        </div>
      </section>

      {/* 14. GOOGLE REVIEWS CAROUSEL & STATS */}
      <section id="reviews" className="py-24 px-6 md:px-12 bg-[#0F0F0F]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            
            {/* Reviews Slider */}
            <div className="lg:col-span-2 space-y-6">
              <span className="text-xs text-gold uppercase tracking-[0.3em] font-bold block">CLIENT REVIEWS</span>
              <h2 className="font-bebas text-5xl tracking-wide text-white leading-none">WHAT OUR CLIENTS SAY</h2>
              
              <div className="bg-[#171717] border border-white/5 p-6 md:p-8 rounded-sm relative shadow-xl overflow-hidden min-h-[220px] flex flex-col justify-between">
                
                {/* Decorative absolute quotation mark */}
                <div className="absolute top-2 right-4 text-white/[0.02] font-bebas text-[12rem] select-none leading-none pointer-events-none">”</div>

                <div className="space-y-4">
                  {/* Stars */}
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: reviews[selectedReviewIndex]?.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-gold fill-current" />
                    ))}
                  </div>

                  <p className="text-sm md:text-base text-[#F8F8F8] italic leading-relaxed font-sans">
                    "{reviews[selectedReviewIndex]?.text}"
                  </p>
                </div>

                <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-6">
                  <div className="flex items-center gap-3">
                    <img 
                      src={reviews[selectedReviewIndex]?.avatar} 
                      alt={reviews[selectedReviewIndex]?.name} 
                      className="w-10 h-10 rounded-full object-cover border border-white/10"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h5 className="font-bold text-xs text-white">{reviews[selectedReviewIndex]?.name}</h5>
                      <span className="text-[10px] text-gold uppercase tracking-wider block font-space">{reviews[selectedReviewIndex]?.service}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#A7A7A7] font-space">{reviews[selectedReviewIndex]?.date}</span>
                </div>
              </div>

              {/* Slider indicators */}
              <div className="flex justify-center md:justify-start gap-1.5">
                {reviews.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedReviewIndex(i)}
                    className={`h-1.5 transition-all duration-300 rounded-full ${
                      selectedReviewIndex === i ? 'w-8 bg-gold' : 'w-2 bg-white/10 hover:bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* General Google statistics widgets */}
            <div className="lg:col-span-1 bg-[#171717] border border-[#C89B3C]/30 p-6 md:p-8 rounded-sm text-center space-y-6">
              <div className="space-y-2">
                <span className="text-xs text-gold uppercase tracking-widest font-bold block">GOOGLE REVIEWS</span>
                <p className="font-space text-4xl font-bold text-white">4.9 / 5.0</p>
                <div className="flex justify-center gap-1">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className="w-5 h-5 text-gold fill-current" />
                  ))}
                </div>
                <p className="text-xs text-[#A7A7A7] tracking-wider">Based on 1,400+ Verified Client Reviews</p>
              </div>

              <div className="border-t border-white/5 pt-6 space-y-4">
                <p className="text-xs text-gold uppercase tracking-widest font-bold">OUR TRACK RECORD</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0F0F0F] p-3 rounded-sm border border-white/5 text-center">
                    <span className="font-space text-lg font-bold text-white">99.8%</span>
                    <span className="text-[9px] text-[#A7A7A7] block mt-0.5 uppercase tracking-wider">Satisfaction</span>
                  </div>
                  <div className="bg-[#0F0F0F] p-3 rounded-sm border border-white/5 text-center">
                    <span className="font-space text-lg font-bold text-white">15+ Yrs</span>
                    <span className="text-[9px] text-[#A7A7A7] block mt-0.5 uppercase tracking-wider">Experience</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 15. WHY CHOOSE US ICON GRID */}
      <section id="why-choose-us" className="py-24 px-6 md:px-12 bg-[#171717] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-3 mb-16">
            <span className="text-xs text-gold uppercase tracking-[0.3em] font-bold block">OUR PHILOSOPHY</span>
            <h2 className="font-bebas text-5xl md:text-6xl tracking-wide text-white">THE SOVEREIGN STANDARDS</h2>
            <div className="w-12 h-[1px] bg-gold mx-auto" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { title: 'Licensed Craftsmen', desc: 'Certified master craftsmen', icon: Scissors },
              { title: 'Luxury Experience', desc: 'Private parlour and premium whiskey access', icon: Award },
              { title: 'Premium Apothecary', desc: 'Artisanal hand-crafted oils & creams', icon: Sparkles },
              { title: 'Secure Booking', desc: 'Dynamic real-time calendar synchronization', icon: Calendar },
              { title: 'Cold Beverages', desc: 'Complimentary premium bar lists', icon: Star },
              { title: 'WiFi Connection', desc: 'High speed private networks', icon: ShieldCheck },
              { title: 'Convenient Parking', desc: 'Reserved parking coordinates', icon: MapPin },
              { title: 'Comfort Atmosphere', desc: 'Thermal filtration & HVAC systems', icon: Clock }
            ].map((item, i) => {
              const IconStandard = item.icon;
              return (
                <div 
                  key={i}
                  className="bg-[#0F0F0F] border border-white/5 hover:border-gold/20 p-5 rounded-sm transition-all duration-300 space-y-3 flex flex-col items-center"
                >
                  <div className="w-12 h-12 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center text-gold">
                    <IconStandard className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-[#F8F8F8] font-sans truncate w-full">{item.title}</h4>
                  <p className="text-[11px] text-[#A7A7A7] leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 16. FAQ SECTION ACCORDIONS */}
      <section id="faq" className="py-24 px-6 md:px-12 bg-[#0F0F0F]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-3 mb-16">
            <span className="text-xs text-gold uppercase tracking-[0.3em] font-bold block">COMMON INQUIRIES</span>
            <h2 className="font-bebas text-5xl md:text-6xl tracking-wide text-white">FREQUENT QUESTIONS</h2>
            <div className="w-12 h-[1px] bg-gold mx-auto" />
          </div>

          <div className="space-y-4">
            {[
              { q: 'Do you accept walk-ins or are reservations mandatory?', a: 'While we accommodate walk-ins when possible, we highly advise using our online booking system. This guarantees you secure a specific master craftsman at a designated hour with absolutely zero waiting queues.' },
              { q: 'What is the cancellation and rescheduling policy?', a: 'Reservations can be canceled or rescheduled up to 4 hours in advance by contacting our direct Concierge desk, or emailing us.' },
              { q: 'Can I select a specific master barber for my session?', a: 'Absolutely. Step 2 of our premium reservation engine lets you select from our registered master craftsmen, displaying their roles, years of experience, rating records, and visual cut specialties.' },
              { q: 'Do you offer private grooming events or wedding bookings?', a: 'Yes, we cater to private grooming events, groom\'s parties, and corporate bookings. Please get in touch via our concierge form to discuss tailored arrangements.' },
              { q: 'What products do you stock in your apothecary?', a: 'We stock our own premium line of hand-crafted beard oils, styling pomades, and natural facial clay treatments, available in-store and through our online apothecary.' }
            ].map((item, i) => {
              const isOpen = activeFaq === i;
              return (
                <div 
                  key={i}
                  className="bg-[#171717] border border-white/5 rounded-sm overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : i)}
                    className="w-full p-5 text-left flex justify-between items-center font-sans font-bold text-sm text-white hover:text-gold transition-colors"
                  >
                    <span>{item.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-gold" /> : <ChevronDown className="w-4 h-4 text-[#A7A7A7]" />}
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/5 bg-[#0F0F0F]/50 text-xs text-[#A7A7A7] leading-relaxed p-5 font-sans"
                      >
                        {item.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 17. CONTACT & MAP SECTION */}
      <section id="contact" className="py-24 px-6 md:px-12 bg-[#171717] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Contact details and Hours */}
            <div className="space-y-8">
              <div className="space-y-3">
                <span className="text-xs text-gold uppercase tracking-[0.3em] font-bold block">VISIT THE PARLOUR</span>
                <h2 className="font-bebas text-5xl tracking-wide text-white">OUR LOCATION</h2>
                <p className="text-sm text-[#A7A7A7] leading-relaxed">
                  Situated at our exclusive parlour, meticulously designed to serve clients who value precision, luxury, and flawless grooming execution.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-[#A7A7A7] font-sans">
                <div className="space-y-3">
                  <h4 className="font-bold text-white uppercase tracking-widest text-[10px]">COORDINATES</h4>
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4.5 h-4.5 text-gold shrink-0" />
                    <span>{businessInfo?.address || 'Melrose Arch, 30 Melrose Blvd, Johannesburg, 2076'}</span>
                  </div>
                  {businessInfo?.phone && (
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4.5 h-4.5 text-gold shrink-0" />
                      <a href={`tel:${businessInfo.phone}`} className="hover:text-gold transition-colors font-space">{businessInfo.phone}</a>
                    </div>
                  )}
                  {businessInfo?.email && (
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4.5 h-4.5 text-gold shrink-0" />
                      <a href={`mailto:${businessInfo.email}`} className="hover:text-gold transition-colors">{businessInfo.email}</a>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-white uppercase tracking-widest text-[10px]">BUSINESS HOURS</h4>
                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4.5 h-4.5 text-gold shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      {businessInfo?.opening_hours ? (
                        <div className="text-white leading-relaxed font-sans">{businessInfo.opening_hours}</div>
                      ) : (
                        <>
                          <div className="flex justify-between gap-4"><span>Mon – Fri:</span> <strong className="text-white">09:00 – 20:00</strong></div>
                          <div className="flex justify-between gap-4"><span>Saturday:</span> <strong className="text-white">09:00 – 18:00</strong></div>
                          <div className="flex justify-between gap-4"><span>Sunday:</span> <strong className="text-white italic">Closed</strong></div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Styled Editorial Black-and-Gold Iframe Map Representation */}
              <div className="h-60 w-full bg-[#0F0F0F] rounded-sm overflow-hidden border border-white/5 relative shadow-lg">
                <iframe 
                  title="Sovereign Coordinates Map"
                  src={`https://www.google.com/maps/embed/v1/place?key=&q=${encodeURIComponent(businessInfo?.address || 'Melrose Arch, Johannesburg, South Africa')}`}
                  className="w-full h-full border-0 filter grayscale invert contrast-125 opacity-70"
                  allowFullScreen={false} 
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Contact message dispatch */}
            <div className="bg-[#0F0F0F] border border-white/5 p-6 md:p-8 rounded-sm shadow-xl space-y-6">
              <div>
                <h4 className="font-bebas text-2xl tracking-wide text-white">THE CONCIERGE DESK</h4>
                <p className="text-xs text-[#A7A7A7] mt-1">Send an inquiry directly to our concierge team.</p>
              </div>

              {contactSuccess ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h5 className="font-bebas text-xl text-white tracking-widest">MESSAGE RECEIVED</h5>
                  <p className="text-xs text-[#A7A7A7] max-w-xs mx-auto">We have received your message. Our concierge desk will reply shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[10px] tracking-widest text-[#A7A7A7] uppercase block font-bold">Your Name</label>
                    <input 
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Charles Sterling"
                      className="w-full bg-white/[0.02] border border-white/10 rounded-sm py-2.5 px-3 text-white text-xs focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] tracking-widest text-[#A7A7A7] uppercase block font-bold">Email Address</label>
                    <input 
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="charles@sterling.com"
                      className="w-full bg-white/[0.02] border border-white/10 rounded-sm py-2.5 px-3 text-white text-xs focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] tracking-widest text-[#A7A7A7] uppercase block font-bold">Message</label>
                    <textarea 
                      required
                      rows={4}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Inquire regarding wedding booking packages, corporate events, private parlour hire, etc..."
                      className="w-full bg-white/[0.02] border border-white/10 rounded-sm py-2 px-3 text-white text-xs resize-none focus:outline-none focus:border-gold"
                    />
                  </div>

                  {contactError && (
                    <p className="text-red-500 text-[11px] font-semibold">{contactError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmittingContact}
                    className="w-full py-3 bg-[#F8F8F8] hover:bg-white text-[#0F0F0F] font-space text-xs font-bold tracking-widest uppercase transition-all rounded-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isSubmittingContact ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" /> DISPATCHING...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" /> SEND INQUIRY
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* 18. HIDDEN-BY-DEFAULT DYNAMIC ADMIN CONCIERGE LEDGER PANEL */}
      <AnimatePresence>
        {adminConsoleOpen && (
          <motion.section 
            id="admin-ledger-console"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="py-16 px-6 md:px-12 bg-[#0F0F0F] border-t-2 border-gold"
          >
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gold font-space font-bold uppercase tracking-widest">REAL-TIME SANDBOX</span>
                <button
                  type="button"
                  onClick={() => setAdminConsoleOpen(false)}
                  className="p-1.5 bg-white/5 border border-white/10 text-[#A7A7A7] hover:text-white"
                >
                  CLOSE PANEL
                </button>
              </div>
              <AdminDashboard />
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* 19. REFINED LUXURY FOOTER */}
      <footer className="bg-[#0F0F0F] border-t border-white/5 py-16 px-6 md:px-12 text-xs text-[#A7A7A7] font-sans">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-white/5 pb-12 mb-12">
          
          {/* Col 1: Brand & Logo */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {businessInfo?.logo_url ? (
                <img 
                  src={businessInfo.logo_url} 
                  alt={businessInfo.business_name} 
                  className="max-h-8 object-contain" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <>
                  <Scissors className="w-5 h-5 text-gold" />
                  <span className="font-bebas text-2xl tracking-[0.2em] text-white uppercase">{businessInfo?.business_name || 'SOVEREIGN'}</span>
                </>
              )}
            </div>
            <p className="leading-relaxed text-[#A7A7A7] max-w-xs">
              Timeless straight razor shaving, modern seamless skin fades, and artisanal botanical apothecary products since 2011.
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-4">
            <h5 className="font-bold text-white tracking-widest text-[10px] uppercase">NAVIGATION INDEX</h5>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Services', id: 'services' },
                { label: 'Craftsmen', id: 'barbers' },
                { label: 'Gallery', id: 'gallery' },
                { label: 'Apothecary', id: 'shop' },
                { label: 'Recognitions', id: 'reviews' },
                { label: 'Contact', id: 'contact' }
              ].map((lnk, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => scrollToSection(lnk.id)}
                  className="text-left hover:text-gold transition-colors"
                >
                  {lnk.label}
                </button>
              ))}
            </div>
          </div>

          {/* Col 3: Newsletter Signup */}
          <div className="space-y-4 md:col-span-2">
            <h5 className="font-bold text-white tracking-widest text-[10px] uppercase">THE JOURNAL</h5>
            <p className="leading-relaxed max-w-sm">
              Subscribe to claim exclusive standby styling schedules, private lounge events access, and new apothecary batch notifications.
            </p>
            {newsletterSubscribed ? (
              <p className="text-gold text-xs font-semibold">📥 Subscription successful! Welcome to the brand journal.</p>
            ) : (
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const emailInput = form.querySelector('input') as HTMLInputElement;
                  if (!emailInput.value) return;
                  try {
                    await api.submitContactForm({
                      clientId: CLIENT_ID!,
                      formName: 'contact',
                      customer: { name: 'Newsletter Subscriber', email: emailInput.value },
                      fields: { source: 'Footer Subscription Form' }
                    });
                    setNewsletterSubscribed(true);
                    form.reset();
                    setTimeout(() => setNewsletterSubscribed(false), 5000);
                  } catch (err) {
                    console.warn('Newsletter sign up error:', err);
                  }
                }} 
                className="flex max-w-sm border border-white/10 rounded-sm overflow-hidden"
              >
                <input 
                  type="email" 
                  required
                  placeholder="charles@sterling.com" 
                  className="flex-1 bg-white/[0.02] py-2 px-3 text-white text-xs outline-none"
                />
                <button 
                  type="submit" 
                  className="bg-gold hover:bg-gold/95 text-black font-space font-bold px-4 text-xs uppercase tracking-widest"
                >
                  JOIN
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Legal & Secret Portal trigger row */}
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-wrap items-center gap-6 text-[#A7A7A7]/60">
            <span>© 2026 {businessInfo?.business_name?.toUpperCase() || 'SOVEREIGN BARBER'} INC. ALL RIGHTS RESERVED.</span>
            <a href="#privacy" className="hover:text-gold transition-colors">PRIVACY POLICY</a>
            <a href="#terms" className="hover:text-gold transition-colors">TERMS OF SERVICE</a>
          </div>

          {/* Secret/Executive Concierge Portal toggle button */}
          <button
            type="button"
            onClick={() => {
              setAdminConsoleOpen(!adminConsoleOpen);
              if (!adminConsoleOpen) {
                setTimeout(() => {
                  const el = document.getElementById('admin-ledger-console');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 150);
              }
            }}
            className="text-[10px] tracking-[0.2em] font-space text-gold uppercase hover:underline"
          >
            [ ADMIN CONSOLE ]
          </button>
        </div>
      </footer>

      {/* 20. COOKIE CONSENT PRIVACY BANNER */}
      <AnimatePresence>
        {cookieBannerOpen && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50 }}
            className="fixed bottom-6 left-6 right-6 md:left-12 md:right-auto md:max-w-md z-[9999] bg-[#171717]/95 border border-white/10 p-5 rounded-sm shadow-2xl backdrop-blur-md flex flex-col sm:flex-row gap-4 items-center justify-between"
          >
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[9px] tracking-widest text-gold block uppercase font-bold">SOVEREIGN PRIVACY</span>
              <p className="text-[11px] text-[#A7A7A7] leading-relaxed">
                We use cookies to enhance your digital reservations and apothecary checkout experience.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCookieBannerOpen(false)}
              className="px-4 py-1.5 bg-gold hover:bg-gold/90 text-black text-[10px] tracking-widest uppercase font-space font-bold shrink-0 rounded-xs"
            >
              ACCEPT
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 21. FLOATING WHATSAPP CHAT BUTTON */}
      <a 
        href="https://wa.me/27111234567?text=Hello%20Sovereign%2C%20I&#39;d%20like%20to%20inquire%20about%20a%20private%20grooming%20session." 
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-[999] w-12 h-12 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center text-black shadow-2xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
        title="WhatsApp Live Concierge"
      >
        <MessageSquare className="w-5.5 h-5.5 fill-current" />
      </a>

      {/* 22. FLOATING BACK TO TOP BUTTON */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-20 right-6 z-[999] w-12 h-12 bg-[#171717]/90 border border-white/10 rounded-full flex items-center justify-center text-[#A7A7A7] hover:text-white hover:border-gold hover:scale-105 transition-all shadow-lg"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
