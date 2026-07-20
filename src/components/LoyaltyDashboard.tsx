import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Scissors, Calendar, User, Clock, ShieldCheck, RefreshCw, XCircle, Award, Sparkles } from 'lucide-react';

export const LoyaltyDashboard: React.FC = () => {
  const { loyaltyCard, bookings, cancelBooking, rescheduleBooking, addLoyaltyPoints, resetLoyaltyCard } = useApp();
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [redeemedReward, setRedeemedReward] = useState(false);

  const activeBookings = bookings.filter(b => b.status === 'confirmed');
  const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

  // Trigger simulated loyalty points
  const handleSimulateVisit = () => {
    addLoyaltyPoints(1);
  };

  const handleRedeemReward = () => {
    if (loyaltyCard.points >= loyaltyCard.maxPointsToReward) {
      addLoyaltyPoints(-loyaltyCard.maxPointsToReward);
      setRedeemedReward(true);
      setTimeout(() => setRedeemedReward(false), 4000);
    }
  };

  const handleRescheduleSubmit = (id: string) => {
    if (!newDate || !newTime) {
      alert('Please specify both a date and a time.');
      return;
    }
    rescheduleBooking(id, newDate, newTime);
    setRescheduleId(null);
    setNewDate('');
    setNewTime('');
    alert('Appointment rescheduled successfully.');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* DIGITAL LOYALTY CARD SECTION */}
      <div className="lg:col-span-1 space-y-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1c1c1c] to-[#121212] border border-[#C89B3C]/30 p-6 rounded-sm shadow-xl group">
          {/* Holographic glowing lines in card background */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#C89B3C]/5 rounded-full blur-3xl group-hover:bg-[#C89B3C]/10 transition-all duration-500" />
          <div className="absolute bottom-4 left-4 text-white/5 font-bebas text-9xl select-none leading-none pointer-events-none">SOV</div>

          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-[9px] tracking-[0.3em] text-gold uppercase font-bold">DIGITAL MEMBERSHIP</span>
              <h4 className="font-bebas text-2xl tracking-wider text-[#F8F8F8] mt-1">THE GUILD LOYALTY CARD</h4>
            </div>
            <Award className="w-8 h-8 text-gold animate-pulse" />
          </div>

          <div className="space-y-4 relative z-10">
            {/* Stamp Slots Grid (8 Slots) */}
            <div className="grid grid-cols-4 gap-3 my-6">
              {Array.from({ length: loyaltyCard.maxPointsToReward }).map((_, index) => {
                const isStamped = index < loyaltyCard.points;
                return (
                  <motion.div
                    key={index}
                    initial={{ scale: 0.9, opacity: 0.8 }}
                    animate={isStamped ? { scale: 1, opacity: 1 } : { scale: 0.95, opacity: 0.4 }}
                    className={`h-14 rounded-sm flex items-center justify-center border relative transition-all duration-300 ${
                      isStamped 
                        ? 'bg-gold/10 border-gold shadow-[inset_0_0_8px_rgba(200,155,60,0.2)]' 
                        : 'bg-black/40 border-white/5'
                    }`}
                  >
                    {isStamped ? (
                      <div className="flex flex-col items-center">
                        <Scissors className="w-5.5 h-5.5 text-gold" />
                        <span className="text-[7px] text-gold font-bold uppercase tracking-widest mt-0.5">STAMP</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-[#A7A7A7] font-space">{index + 1}</span>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Loyalty points info progress bar */}
            <div>
              <div className="flex justify-between text-xs text-[#A7A7A7] mb-2">
                <span>REWARD MILESTONE PROGRESS</span>
                <span className="font-bold text-[#F8F8F8] font-space">{loyaltyCard.points} / {loyaltyCard.maxPointsToReward} STAMPS</span>
              </div>
              <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gold transition-all duration-500 shadow-[0_0_8px_rgba(200,155,60,0.6)]"
                  style={{ width: `${(loyaltyCard.points / loyaltyCard.maxPointsToReward) * 100}%` }}
                />
              </div>
            </div>

            {/* Redemption Alerts */}
            {loyaltyCard.points >= loyaltyCard.maxPointsToReward ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-sm flex items-center justify-between text-xs text-emerald-200 mt-4"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>FREE HAIRCUT UNLOCKED!</span>
                </div>
                <button
                  type="button"
                  onClick={handleRedeemReward}
                  className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-black font-space font-bold uppercase tracking-wider rounded-sm transition-all"
                >
                  REDEEM NOW
                </button>
              </motion.div>
            ) : (
              <p className="text-[11px] text-[#A7A7A7] italic text-center">
                Collect {loyaltyCard.maxPointsToReward - loyaltyCard.points} more stamps to claim a complimentary Vanguard Sculpt.
              </p>
            )}

            {/* Loyalty Sandbox Interactive Buttons */}
            <div className="border-t border-white/5 pt-4 mt-4 space-y-2">
              <p className="text-[10px] text-gold uppercase tracking-wider text-center font-bold">LOYALTY EXPERIMENT PANEL</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleSimulateVisit}
                  className="py-1.5 px-3 bg-white/5 hover:bg-white/10 text-white text-[10px] tracking-wider uppercase font-space font-semibold rounded-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3 text-gold" /> LOG VISIT (+1)
                </button>
                <button
                  type="button"
                  onClick={resetLoyaltyCard}
                  className="py-1.5 px-3 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 text-red-200 text-[10px] tracking-wider uppercase font-space rounded-sm transition-all"
                >
                  RESET CARD
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* REWARD TRIGGER CELEBRATION MODAL */}
        <AnimatePresence>
          {redeemedReward && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-emerald-950/85 border border-emerald-500/30 p-5 rounded-sm text-center text-white"
            >
              <Award className="w-12 h-12 text-emerald-400 mx-auto mb-2 animate-bounce" />
              <h5 className="font-bebas text-2xl tracking-widest text-[#F8F8F8]">REWARD REDEEMED!</h5>
              <p className="text-xs text-[#A7A7A7] mt-1">
                Your premium complimentary haircut is applied. Our team has recorded this in your profile ledger. Enjoy your artisan treatment!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ACTIVE RESERVATIONS SECTION */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-[#171717] border border-white/5 p-6 rounded-sm shadow-xl">
          <div className="border-b border-white/5 pb-4 mb-6 flex justify-between items-center">
            <div>
              <span className="text-[9px] tracking-[0.25em] text-[#A7A7A7] uppercase">REAL-TIME PORTAL</span>
              <h4 className="font-bebas text-2xl tracking-wider text-[#F8F8F8]">YOUR ACTIVE BOOKINGS</h4>
            </div>
            <span className="bg-gold/10 border border-gold/30 text-gold text-[10px] font-space font-bold uppercase px-2.5 py-1 rounded-sm">
              {activeBookings.length} RESERVED
            </span>
          </div>

          {activeBookings.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-white/5 bg-[#0F0F0F] rounded-sm">
              <Calendar className="w-8 h-8 text-[#A7A7A7]/40 mx-auto mb-2" />
              <p className="text-sm text-[#A7A7A7]">No active reservations found.</p>
              <p className="text-xs text-[#A7A7A7]/60 mt-1">Select a service above to book your signature grooming ritual.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeBookings.map((booking) => (
                <div 
                  key={booking.id}
                  className="bg-[#0F0F0F] border border-white/5 p-4 rounded-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-white/10 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] bg-gold/10 border border-gold/20 text-gold font-space font-bold uppercase px-1.5 py-0.5 rounded-sm">
                        CONFIRMED
                      </span>
                      <span className="text-xs text-[#A7A7A7] font-space">ID: {booking.id.substring(5, 13)}</span>
                    </div>
                    <h5 className="font-bold text-base text-white">{booking.serviceName}</h5>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#A7A7A7]">
                      <div className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-gold" />
                        <span>Barber: {booking.barberName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gold" />
                        <span>Date: {booking.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gold" />
                        <span className="font-space">{booking.time}</span>
                      </div>
                    </div>
                    {booking.notes && (
                      <p className="text-xs text-gold/80 italic mt-1 font-sans">"Notes: {booking.notes}"</p>
                    )}
                  </div>

                  {/* Reschedule forms / cancel controls */}
                  <div className="flex flex-col items-end gap-2 shrink-0 w-full md:w-auto border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                    {rescheduleId === booking.id ? (
                      <div className="space-y-2 bg-[#171717] p-3 border border-white/10 w-full md:w-56 text-left rounded-sm">
                        <span className="text-[10px] tracking-widest text-gold block uppercase font-bold">RESCHEDULE SYSTEM</span>
                        
                        <div className="space-y-1.5">
                          <label className="text-[9px] text-[#A7A7A7] uppercase block">New Date</label>
                          <input 
                            type="date"
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 text-xs py-1 px-1.5 rounded-sm text-white"
                          />
                        </div>
                        
                        <div className="space-y-1.5">
                          <label className="text-[9px] text-[#A7A7A7] uppercase block">New Time</label>
                          <select 
                            value={newTime}
                            onChange={(e) => setNewTime(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 text-xs py-1 px-1.5 rounded-sm text-white"
                          >
                            <option value="">Choose slot</option>
                            <option value="09:00">09:00 AM</option>
                            <option value="10:00">10:00 AM</option>
                            <option value="11:30">11:30 AM</option>
                            <option value="13:00">01:00 PM</option>
                            <option value="14:30">02:30 PM</option>
                            <option value="16:00">04:00 PM</option>
                            <option value="17:30">05:30 PM</option>
                          </select>
                        </div>

                        <div className="flex gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => handleRescheduleSubmit(booking.id)}
                            className="flex-1 bg-gold text-black font-space font-bold uppercase text-[9px] py-1 tracking-wider rounded-sm"
                          >
                            SAVE
                          </button>
                          <button
                            type="button"
                            onClick={() => setRescheduleId(null)}
                            className="flex-1 bg-white/5 text-white uppercase text-[9px] py-1 rounded-sm"
                          >
                            CANCEL
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2 w-full md:w-auto">
                        <button
                          type="button"
                          onClick={() => setRescheduleId(booking.id)}
                          className="flex-1 md:flex-none px-3.5 py-1.5 border border-white/10 hover:border-gold hover:text-gold text-xs font-space tracking-wider uppercase rounded-sm transition-all"
                        >
                          RESCHEDULE
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Are you sure you want to cancel this booking? This slot will be released immediately.')) {
                              cancelBooking(booking.id);
                            }
                          }}
                          className="flex-1 md:flex-none px-3.5 py-1.5 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 text-red-200 text-xs font-space tracking-wider uppercase rounded-sm transition-all flex items-center justify-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> CANCEL
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* LEDGER HISTORY */}
        <div className="bg-[#171717] border border-white/5 p-6 rounded-sm shadow-xl">
          <h4 className="font-bebas text-2xl tracking-wider text-[#F8F8F8] border-b border-white/5 pb-4 mb-4">GENTLEMAN'S HISTORY LOG</h4>
          {pastBookings.length === 0 ? (
            <p className="text-xs text-[#A7A7A7] italic text-center py-4">No historical visits currently catalogued in ledger.</p>
          ) : (
            <div className="max-h-48 overflow-y-auto pr-2 custom-scrollbar space-y-3">
              {pastBookings.map((booking) => (
                <div 
                  key={booking.id}
                  className="flex justify-between items-center text-xs border-b border-white/5 pb-2.5"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-[#F8F8F8]">{booking.serviceName}</p>
                    <p className="text-[#A7A7A7] text-[10px]">{booking.date} • with {booking.barberName}</p>
                  </div>
                  <div className="text-right">
                    {booking.status === 'completed' ? (
                      <span className="text-emerald-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> COMPLETED
                      </span>
                    ) : (
                      <span className="text-[#A7A7A7] uppercase text-[10px] tracking-wider">
                        CANCELLED
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
