import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, User, CheckCircle2, AlertTriangle, ChevronRight, ArrowLeft, Scissors, Star, CalendarDays } from 'lucide-react';

interface BookingFlowProps {
  onSuccessClose?: () => void;
  preSelectedServiceId?: string;
  preSelectedBarberId?: string;
}

export const BookingFlow: React.FC<BookingFlowProps> = ({ 
  onSuccessClose, 
  preSelectedServiceId,
  preSelectedBarberId
}) => {
  const { services, barbers, addBooking } = useApp();
  
  const [step, setStep] = useState(1);
  const [selectedServiceId, setSelectedServiceId] = useState(preSelectedServiceId || '');
  const [selectedBarberId, setSelectedBarberId] = useState(preSelectedBarberId || '');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  
  const [completedBooking, setCompletedBooking] = useState<any>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calendarSynced, setCalendarSynced] = useState(false);

  const selectedService = services.find(s => s.id === selectedServiceId);
  const selectedBarber = barbers.find(b => b.id === selectedBarberId);

  // Generate next 14 days
  const getNext14Days = () => {
    const days = [];
    const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
      const dayName = weekdayNames[date.getDay()];
      const dayOfMonth = date.getDate();
      const monthName = date.toLocaleString('en-US', { month: 'short' });
      
      days.push({
        dateString,
        dayName,
        dayOfMonth,
        monthName,
        fullLabel: `${dayName}, ${monthName} ${dayOfMonth}`
      });
    }
    return days;
  };

  const dates = getNext14Days();

  // Filter dates based on barber's available days
  const availableDates = selectedBarber 
    ? dates.filter(d => selectedBarber.availableDays.includes(d.dayName))
    : dates;

  // Barber slots
  const availableSlots = selectedBarber ? selectedBarber.availableSlots : [];

  const handleNextStep = async () => {
    setError('');
    if (step === 1) {
      if (!selectedServiceId) {
        setError('Please select a grooming service to proceed.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedBarberId) {
        setError('Please select a craftsman.');
        return;
      }
      // If the selected date is no longer valid, reset it
      if (selectedDate) {
        const dateObj = dates.find(d => d.dateString === selectedDate);
        if (dateObj && !selectedBarber.availableDays.includes(dateObj.dayName)) {
          setSelectedDate('');
          setSelectedTime('');
        }
      }
      setStep(3);
    } else if (step === 3) {
      if (!selectedDate || !selectedTime) {
        setError('Please select both a date and an available time slot.');
        return;
      }
      setStep(4);
    } else if (step === 4) {
      if (!name || !email || !phone) {
        setError('Please complete all contact details to finalize reservation.');
        return;
      }
      
      setIsSubmitting(true);
      setError('');
      try {
        const bookResult = await addBooking({
          serviceId: selectedServiceId,
          serviceName: selectedService?.name || 'Grooming',
          price: selectedService?.price || 0,
          barberId: selectedBarberId,
          barberName: selectedBarber?.name || 'Staff',
          date: selectedDate,
          time: selectedTime,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          notes
        });
        setCompletedBooking(bookResult);
        setStep(5);
      } catch (err: any) {
        console.error('Failed to book appointment:', err);
        setError(err?.message || 'Failed to dispatch your reservation request.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handlePrevStep = () => {
    setError('');
    if (step > 1) setStep(step - 1);
  };

  const formatSelectedDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#171717] border border-white/5 rounded-sm overflow-hidden shadow-2xl relative">
      {/* Editorial Top Status */}
      <div className="bg-[#0F0F0F] border-b border-white/5 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-gold uppercase font-bold">RESERVATION OFFICE</span>
          <h3 className="font-bebas text-2xl tracking-wider text-[#F8F8F8]">PREMIUM GROOMING APPOINTMENT</h3>
        </div>
        
        {/* Step Indicator */}
        {step < 5 && (
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div 
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-space text-xs transition-all duration-300 ${
                    step === s 
                      ? 'bg-gold text-[#0F0F0F] font-bold shadow-[0_0_10px_rgba(200,155,60,0.3)]' 
                      : step > s 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-[#171717] text-[#A7A7A7] border border-white/10'
                  }`}
                >
                  {step > s ? '✓' : s}
                </div>
                {s < 4 && (
                  <div className={`w-6 h-[1px] ${step > s ? 'bg-emerald-500' : 'bg-white/10'}`} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 md:p-8 min-h-[420px]">
        {/* Error notification */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-500/10 border border-red-500/30 p-4 mb-6 rounded-sm text-sm text-red-200 flex items-center gap-3 font-sans"
            >
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* STEP 1: SELECT SERVICE */}
        {step === 1 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="border-l-2 border-gold pl-4">
              <h4 className="font-bebas text-xl tracking-wider text-[#F8F8F8]">SELECT GROOMING EXPERIENCE</h4>
              <p className="text-xs text-[#A7A7A7]">Indulge in our tailored services crafted for discerning gentlemen.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
              {services.map((service) => (
                <div
                  key={service.id}
                  onClick={() => setSelectedServiceId(service.id)}
                  className={`p-4 border rounded-sm cursor-pointer transition-all duration-300 flex items-start gap-4 ${
                    selectedServiceId === service.id
                      ? 'bg-white/[0.04] border-gold shadow-[inset_0_0_12px_rgba(200,155,60,0.15)]'
                      : 'bg-white/[0.01] border-white/5 hover:border-white/20 hover:bg-white/[0.02]'
                  }`}
                >
                  <img 
                    src={service.image} 
                    alt={service.name} 
                    className="w-16 h-16 object-cover rounded-sm border border-white/10"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h5 className="font-sans font-bold text-sm text-[#F8F8F8] truncate">{service.name}</h5>
                      <span className="font-space text-sm text-gold font-bold ml-2">R{service.price}</span>
                    </div>
                    <p className="text-xs text-[#A7A7A7] mt-1 line-clamp-2">{service.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-[#A7A7A7] font-space uppercase">
                      <Clock className="w-3 h-3 text-gold" />
                      <span>{service.duration} mins</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 2: SELECT BARBER */}
        {step === 2 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="border-l-2 border-gold pl-4">
              <h4 className="font-bebas text-xl tracking-wider text-[#F8F8F8]">CHOOSE CRAFTSMAN</h4>
              <p className="text-xs text-[#A7A7A7]">Select one of our certified master artisans to sculpt your signature style.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {barbers.map((barber) => (
                <div
                  key={barber.id}
                  onClick={() => setSelectedBarberId(barber.id)}
                  className={`p-5 border rounded-sm cursor-pointer transition-all duration-300 flex flex-col items-center text-center relative group ${
                    selectedBarberId === barber.id
                      ? 'bg-white/[0.04] border-gold shadow-[0_4px_20px_rgba(200,155,60,0.1)]'
                      : 'bg-white/[0.01] border-white/5 hover:border-white/25 hover:bg-white/[0.02]'
                  }`}
                >
                  {/* Master Label */}
                  {barber.role.includes('Master') && (
                    <span className="absolute top-3 right-3 bg-gold/95 text-[#0F0F0F] text-[9px] tracking-widest uppercase font-bold px-1.5 py-0.5 rounded-sm">
                      MASTER
                    </span>
                  )}
                  
                  <img 
                    src={barber.image} 
                    alt={barber.name} 
                    className="w-20 h-20 object-cover rounded-full mb-4 border-2 border-white/10 group-hover:border-gold transition-colors"
                    referrerPolicy="no-referrer"
                  />
                  
                  <h5 className="font-sans font-bold text-base text-[#F8F8F8]">{barber.name}</h5>
                  <p className="text-xs text-gold mt-1 font-medium">{barber.role}</p>
                  <p className="text-[11px] text-[#A7A7A7] mt-0.5">{barber.experience}</p>
                  
                  {/* Specialties tags */}
                  <div className="flex flex-wrap justify-center gap-1.5 my-4">
                    {barber.specialties.map((spec, i) => (
                      <span key={i} className="text-[10px] bg-white/[0.04] border border-white/5 text-[#A7A7A7] px-2 py-0.5 rounded-full">
                        {spec}
                      </span>
                    ))}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 text-xs text-[#A7A7A7] font-space mt-auto border-t border-white/5 pt-3 w-full justify-center">
                    <Star className="w-3.5 h-3.5 text-gold fill-current" />
                    <span className="font-semibold text-[#F8F8F8]">{barber.rating}</span>
                    <span>({barber.reviewsCount} reviews)</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 3: SELECT DATE & TIME */}
        {step === 3 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="border-l-2 border-gold pl-4">
              <h4 className="font-bebas text-xl tracking-wider text-[#F8F8F8]">DATE & TIME SEGMENT</h4>
              <p className="text-xs text-[#A7A7A7]">
                Selecting scheduling for <span className="text-gold font-medium">{selectedBarber?.name}</span>.
              </p>
            </div>

            {/* Calendars Select */}
            <div>
              <label className="text-xs text-[#A7A7A7] tracking-widest uppercase mb-3 block">AVAILABLE CALENDAR DAYS</label>
              <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {availableDates.length === 0 ? (
                  <div className="text-sm text-red-300 py-3">This craftsman has no active scheduled days this week.</div>
                ) : (
                  availableDates.map((d) => (
                    <button
                      key={d.dateString}
                      type="button"
                      onClick={() => {
                        setSelectedDate(d.dateString);
                        setSelectedTime(''); // reset time on day change
                      }}
                      className={`flex flex-col items-center justify-center p-3 border rounded-sm min-w-[75px] shrink-0 transition-all duration-300 ${
                        selectedDate === d.dateString
                          ? 'bg-gold text-[#0F0F0F] border-gold font-bold shadow-[0_4px_12px_rgba(200,155,60,0.2)]'
                          : 'bg-white/[0.01] border-white/5 text-[#A7A7A7] hover:text-[#F8F8F8] hover:border-white/20'
                      }`}
                    >
                      <span className="text-[10px] tracking-widest uppercase opacity-75">{d.dayName.substring(0, 3)}</span>
                      <span className="font-space text-lg font-bold my-0.5">{d.dayOfMonth}</span>
                      <span className="text-[10px] uppercase">{d.monthName}</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="space-y-3"
              >
                <label className="text-xs text-[#A7A7A7] tracking-widest uppercase mb-3 block">AVAILABLE TIME SLOTS</label>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      className={`py-2.5 px-2 border rounded-sm text-xs font-space font-medium transition-all duration-300 ${
                        selectedTime === slot
                          ? 'bg-[#C89B3C] text-[#0F0F0F] border-gold font-bold shadow-[0_4px_12px_rgba(200,155,60,0.2)]'
                          : 'bg-white/[0.01] border-white/5 text-[#F8F8F8] hover:border-white/20 hover:bg-white/[0.03]'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* STEP 4: CUSTOMER DETAILS */}
        {step === 4 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="border-l-2 border-gold pl-4">
              <h4 className="font-bebas text-xl tracking-wider text-[#F8F8F8]">CLIENT INDENTATION</h4>
              <p className="text-xs text-[#A7A7A7]">Please fill out your contact coordinates to complete the booking.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs tracking-widest text-[#A7A7A7] uppercase">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A7A7A7]" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Robert Sterling"
                    className="w-full bg-white/[0.02] border border-white/10 rounded-sm py-3 pl-11 pr-4 text-sm text-[#F8F8F8] focus:border-gold focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs tracking-widest text-[#A7A7A7] uppercase">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. robert@sterling.co.uk"
                  className="w-full bg-white/[0.02] border border-white/10 rounded-sm py-3 px-4 text-sm text-[#F8F8F8] focus:border-gold focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs tracking-widest text-[#A7A7A7] uppercase">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 912-4022"
                  className="w-full bg-white/[0.02] border border-white/10 rounded-sm py-3 px-4 text-sm text-[#F8F8F8] focus:border-gold focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs tracking-widest text-[#A7A7A7] uppercase">Special Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="e.g. Please note skin sensitivity, prefer cold water, etc."
                  className="w-full bg-white/[0.02] border border-white/10 rounded-sm py-3 px-4 text-sm text-[#F8F8F8] focus:border-gold focus:outline-none transition-colors resize-none"
                />
              </div>
            </div>

            {/* Appointment Summary pre-submit */}
            <div className="bg-[#0F0F0F] border border-white/5 p-4 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Scissors className="w-5 h-5 text-gold" />
                <div className="text-sm">
                  <p className="text-[#F8F8F8] font-bold">{selectedService?.name}</p>
                  <p className="text-[#A7A7A7] text-xs">With {selectedBarber?.name} on {formatSelectedDate(selectedDate)} at {selectedTime}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#A7A7A7] block">INVESTMENT</span>
                <span className="font-space font-bold text-lg text-gold">R{selectedService?.price}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 5: CONFIRMATION SUCCESS */}
        {step === 5 && completedBooking && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 py-6"
          >
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(59,178,115,0.2)]">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h4 className="font-bebas text-3xl tracking-wider text-[#F8F8F8]">RESERVATION GUARANTEED</h4>
              <p className="text-[#A7A7A7] text-sm max-w-md mx-auto">
                Thank you, <span className="text-white font-medium">{completedBooking.customerName}</span>. Your bespoke slot is successfully locked. A detailed reservation confirmation has been dispatched to your email.
              </p>
            </div>

            {/* Elegant Ticket receipt */}
            <div className="max-w-md mx-auto bg-[#0F0F0F] border border-white/5 p-6 rounded-sm text-left relative overflow-hidden">
              {/* Receipt edge deco punches */}
              <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-3 h-6 bg-[#171717] rounded-r-full border-r border-y border-white/5" />
              <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-6 bg-[#171717] rounded-l-full border-l border-y border-white/5" />
              
              <div className="flex justify-between items-start border-b border-white/5 pb-4 mb-4">
                <div>
                  <span className="text-[10px] tracking-widest text-[#A7A7A7] uppercase">APPOINTMENT NO.</span>
                  <p className="font-space text-sm font-semibold text-white uppercase">{completedBooking.id.substring(5, 13)}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] tracking-widest text-[#A7A7A7] uppercase">SECURED FOR</span>
                  <p className="font-space text-sm font-bold text-gold">R{completedBooking.price}</p>
                </div>
              </div>

              <div className="space-y-3.5 text-sm">
                <div className="flex items-center gap-3">
                  <Scissors className="w-4.5 h-4.5 text-gold shrink-0" />
                  <div>
                    <span className="text-[10px] text-[#A7A7A7] block leading-none">SERVICE EXPERIENCE</span>
                    <span className="font-bold text-[#F8F8F8]">{completedBooking.serviceName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="w-4.5 h-4.5 text-gold shrink-0" />
                  <div>
                    <span className="text-[10px] text-[#A7A7A7] block leading-none">BARBER CRAFTSMAN</span>
                    <span className="font-bold text-[#F8F8F8]">{completedBooking.barberName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-4.5 h-4.5 text-gold shrink-0" />
                  <div>
                    <span className="text-[10px] text-[#A7A7A7] block leading-none">DATE RESERVED</span>
                    <span className="font-bold text-[#F8F8F8]">{formatSelectedDate(completedBooking.date)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-4.5 h-4.5 text-gold shrink-0" />
                  <div>
                    <span className="text-[10px] text-[#A7A7A7] block leading-none">ARRIVAL TIME</span>
                    <span className="font-bold text-gold font-space">{completedBooking.time}</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Loyalty points notifier */}
              <div className="border-t border-dashed border-white/10 mt-5 pt-4 text-center">
                <p className="text-[11px] text-[#A7A7A7]">
                  ✨ <span className="text-gold font-medium">Bespoke slot secured!</span> We look forward to welcoming you soon.
                </p>
              </div>
            </div>

            {/* Interactive Receipts Actions */}
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setCalendarSynced(true);
                  setTimeout(() => setCalendarSynced(false), 4000);
                }}
                className="px-5 py-2 border border-[#C89B3C]/30 hover:border-gold hover:bg-[#C89B3C]/10 text-gold text-xs tracking-widest uppercase font-space font-semibold transition-all rounded-sm flex items-center gap-2"
              >
                {calendarSynced ? (
                  <>✓ CALENDAR SYNCED SUCCESSFULLY</>
                ) : (
                  <>
                    <CalendarDays className="w-3.5 h-3.5" /> ADD TO GOOGLE CALENDAR
                  </>
                )}
              </button>
              
              {onSuccessClose && (
                <button
                  type="button"
                  onClick={onSuccessClose}
                  className="px-6 py-2 bg-[#F8F8F8] hover:bg-white text-[#0F0F0F] text-xs tracking-widest uppercase font-space font-bold transition-all rounded-sm"
                >
                  CLOSE WINDOW
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Editorial Bottom Bar Navs */}
      {step < 5 && (
        <div className="bg-[#0F0F0F] border-t border-white/5 px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrevStep}
            className={`text-xs tracking-widest uppercase text-[#A7A7A7] hover:text-[#F8F8F8] flex items-center gap-1 transition-colors ${
              step === 1 ? 'opacity-0 pointer-events-none' : ''
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> BACK
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleNextStep}
            className="px-6 py-2.5 bg-gold hover:bg-gold/90 text-[#0F0F0F] text-xs tracking-widest uppercase font-space font-bold transition-all rounded-sm flex items-center gap-1.5 shadow-[0_4px_12px_rgba(200,155,60,0.15)] hover:shadow-[0_4px_20px_rgba(200,155,60,0.35)] disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" /> SECURING...
              </>
            ) : (
              <>
                {step === 4 ? 'SECURE RESERVATION' : 'PROCEED'} <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
