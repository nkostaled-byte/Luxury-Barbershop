import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Service, Barber, Booking, Review } from '../types';
import { motion } from 'motion/react';
import { BarChart3, Calendar, Scissors, Star, ShieldCheck, DollarSign, Users, AlertCircle, Plus, Edit3, Trash2, CheckCircle2, XCircle, Moon, Sun } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    services, barbers, bookings, reviews, 
    addService, updateServicePrice, deleteService, 
    toggleBarberAvailabilityDay, updateBarberSpecialties,
    cancelBooking, rescheduleBooking, completeBooking, addReview 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'analytics' | 'bookings' | 'services' | 'barbers' | 'reviews' | 'holidays'>('analytics');
  
  // States for adding a new service
  const [newSvcName, setNewSvcName] = useState('');
  const [newSvcCategory, setNewSvcCategory] = useState('Haircut');
  const [newSvcPrice, setNewSvcPrice] = useState(350);
  const [newSvcDuration, setNewSvcDuration] = useState(45);
  const [newSvcDesc, setNewSvcDesc] = useState('');
  
  // States for adding a simulated review
  const [newRevName, setNewRevName] = useState('');
  const [newRevText, setNewRevText] = useState('');
  const [newRevRating, setNewRevRating] = useState(5);
  const [newRevService, setNewRevService] = useState('Precision Haircut');

  // Holiday Calendar state
  const [shopClosures, setShopClosures] = useState<string[]>([
    '2026-12-25', '2026-01-01' // default holiday closures
  ]);
  const [newClosureDate, setNewClosureDate] = useState('');

  // CALCULATE ANALYTICS
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;

  const estimatedRevenue = bookings
    .filter(b => b.status === 'completed' || b.status === 'confirmed')
    .reduce((sum, b) => sum + b.price, 0);

  const averagePrice = services.reduce((sum, s) => sum + s.price, 0) / (services.length || 1);

  // Add Custom Service Trigger
  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSvcName || !newSvcDesc) {
      alert('Please fill out all service details.');
      return;
    }
    const newSvc: Service = {
      id: `svc-${Date.now()}`,
      name: newSvcName,
      category: newSvcCategory,
      price: Number(newSvcPrice),
      duration: Number(newSvcDuration),
      description: newSvcDesc,
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80' // default high-end barbershop image
    };
    addService(newSvc);
    setNewSvcName('');
    setNewSvcDesc('');
    alert('Artisanal service successfully catalogued in the system.');
  };

  // Add Custom Review Trigger
  const handlePostReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRevName || !newRevText) {
      alert('Please specify name and description.');
      return;
    }
    addReview({
      name: newRevName,
      text: newRevText,
      rating: Number(newRevRating),
      service: newRevService,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80' // premium guest avatar
    });
    setNewRevName('');
    setNewRevText('');
    alert('Simulated guest review posted immediately to main testimonials slider!');
  };

  const handleAddClosure = () => {
    if (!newClosureDate) return;
    if (shopClosures.includes(newClosureDate)) {
      alert('Date already locked as shop closure.');
      return;
    }
    setShopClosures([...shopClosures, newClosureDate]);
    setNewClosureDate('');
  };

  const handleRemoveClosure = (date: string) => {
    setShopClosures(shopClosures.filter(d => d !== date));
  };

  return (
    <div className="bg-[#171717] border border-white/5 rounded-sm overflow-hidden shadow-2xl">
      {/* Admin Title Bar */}
      <div className="bg-[#0F0F0F] border-b border-white/5 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gold animate-ping" />
            <span className="text-[10px] tracking-[0.25em] text-gold uppercase font-bold">EXECUTIVE MANAGEMENT CONSOLE</span>
          </div>
          <h3 className="font-bebas text-3xl tracking-wider text-white mt-1">THE SOVEREIGN CONTROL ROOM</h3>
        </div>

        {/* Mini quick-stats bar */}
        <div className="flex gap-4 text-xs font-space">
          <div className="bg-white/[0.02] border border-white/5 px-4 py-2 text-center rounded-sm">
            <span className="text-[#A7A7A7] block text-[10px] tracking-wider uppercase">LEDGER REVENUE</span>
            <span className="text-gold font-bold text-sm">R{estimatedRevenue}</span>
          </div>
          <div className="bg-white/[0.02] border border-white/5 px-4 py-2 text-center rounded-sm">
            <span className="text-[#A7A7A7] block text-[10px] tracking-wider uppercase">ACTIVE RESERVES</span>
            <span className="text-white font-bold text-sm">{confirmedBookings}</span>
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex flex-wrap border-b border-white/5 bg-[#0F0F0F]/40 p-2 gap-1.5">
        {[
          { id: 'analytics', label: 'ANALYTICS LEDGER', icon: BarChart3 },
          { id: 'bookings', label: `BOOKING REGISTRY (${confirmedBookings})`, icon: Calendar },
          { id: 'services', label: 'SERVICE CATALOG', icon: Scissors },
          { id: 'barbers', label: 'BARBER ROSTER', icon: Users },
          { id: 'reviews', label: 'REVIEW MODERATION', icon: Star },
          { id: 'holidays', label: 'HOLIDAY CALENDAR', icon: Moon }
        ].map(tab => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-sm text-xs font-space tracking-wider uppercase transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gold text-[#0F0F0F] border-gold font-bold shadow-[0_2px_8px_rgba(200,155,60,0.15)]'
                  : 'bg-white/[0.01] border-transparent text-[#A7A7A7] hover:text-[#F8F8F8] hover:bg-white/[0.02]'
              }`}
            >
              <IconComponent className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT PANELS */}
      <div className="p-6 md:p-8 min-h-[400px]">
        
        {/* TAB 1: ANALYTICS LEDGER */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { title: 'ESTIMATED REVENUE', value: `R${estimatedRevenue}`, desc: 'Confirmed + Completed ledger total', icon: DollarSign, color: 'text-gold' },
                { title: 'TOTAL BOOKINGS INDEX', value: totalBookings, desc: 'All timeslots requested', icon: Calendar, color: 'text-white' },
                { title: 'COMPLETED SERVICES', value: completedBookings, desc: 'Successfully finalized treatments', icon: ShieldCheck, color: 'text-emerald-400' },
                { title: 'CLIENT SATISFACTION', value: '98.4%', desc: 'Derived from 5-star Google review logs', icon: Star, color: 'text-gold' }
              ].map((card, i) => {
                const IconCard = card.icon;
                return (
                  <div key={i} className="bg-black/20 border border-white/5 p-5 rounded-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] tracking-widest text-[#A7A7A7] uppercase font-bold">{card.title}</span>
                      <IconCard className={`w-5 h-5 ${card.color}`} />
                    </div>
                    <p className={`text-3xl font-space font-bold ${card.color}`}>{card.value}</p>
                    <p className="text-[10px] text-[#A7A7A7] mt-1">{card.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Custom Interactive SVG Simulated Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-black/10 border border-white/5 p-6 rounded-sm">
                <h4 className="font-bebas text-xl tracking-wider text-white mb-4">WEEKLY TRANSACTION FREQUENCY</h4>
                {/* SVG Bar Chart */}
                <div className="h-44 flex items-end justify-between gap-3 pt-6 border-b border-white/10 pb-2 relative">
                  {/* Grid Lines */}
                  <div className="absolute inset-x-0 bottom-1/4 h-[1px] bg-white/5 pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-2/4 h-[1px] bg-white/5 pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-3/4 h-[1px] bg-white/5 pointer-events-none" />
                  
                  {[
                    { day: 'Mon', count: 12, h: 'h-[35%]' },
                    { day: 'Tue', count: 18, h: 'h-[55%]' },
                    { day: 'Wed', count: 24, h: 'h-[75%]' },
                    { day: 'Thu', count: 32, h: 'h-[95%]', active: true },
                    { day: 'Fri', count: 28, h: 'h-[85%]' },
                    { day: 'Sat', count: 15, h: 'h-[45%]' },
                    { day: 'Sun', count: 0, h: 'h-[5%]' }
                  ].map((bar, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full justify-end">
                      <span className="text-[10px] font-space text-gold opacity-0 group-hover:opacity-100 transition-opacity font-bold">{bar.count}</span>
                      <div className={`w-full rounded-t-xs transition-all duration-500 ${
                        bar.active ? 'bg-gold shadow-[0_0_12px_rgba(200,155,60,0.5)]' : 'bg-white/10 hover:bg-white/20'
                      } ${bar.h}`} />
                      <span className="text-[10px] font-space text-[#A7A7A7] mt-1">{bar.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-black/10 border border-white/5 p-6 rounded-sm">
                <h4 className="font-bebas text-xl tracking-wider text-white mb-4">CRAFTSMAN BOOKING RATIOS</h4>
                <div className="space-y-4">
                  {[
                    { name: 'Alexander Vance', ratio: '42%', count: 1420, color: 'bg-gold' },
                    { name: 'Marcus Thorne', ratio: '33%', count: 980, color: 'bg-neutral-300' },
                    { name: 'Dimitri Volk', ratio: '25%', count: 1150, color: 'bg-neutral-600' }
                  ].map((bar, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-space">
                        <span className="text-white font-semibold">{bar.name}</span>
                        <span className="text-gold font-bold">{bar.ratio} ({bar.count} cuts)</span>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full ${bar.color}`} style={{ width: bar.ratio }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BOOKING REGISTRY */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="border-l-2 border-gold pl-4">
              <h4 className="font-bebas text-xl tracking-wider text-[#F8F8F8]">ACTIVE CLIENT REGISTRY</h4>
              <p className="text-xs text-[#A7A7A7]">Review, confirm, and update your appointment book here.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-[#0F0F0F] text-[#A7A7A7] font-space tracking-wider uppercase">
                    <th className="p-3">CLIENT</th>
                    <th className="p-3">SERVICE</th>
                    <th className="p-3">ARTISAN</th>
                    <th className="p-3">DATE & SLOT</th>
                    <th className="p-3">PRICE</th>
                    <th className="p-3 text-center">STATUS</th>
                    <th className="p-3 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-white">{booking.customerName}</div>
                        <div className="text-[10px] text-[#A7A7A7]">{booking.customerPhone}</div>
                      </td>
                      <td className="p-3 font-semibold text-white">{booking.serviceName}</td>
                      <td className="p-3 text-gold font-medium">{booking.barberName}</td>
                      <td className="p-3">
                        <div className="text-white font-space font-medium">{booking.date}</div>
                        <div className="text-[10px] text-gold font-space font-bold">{booking.time}</div>
                      </td>
                      <td className="p-3 font-space text-white font-semibold">R{booking.price}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-sm text-[9px] font-space font-bold uppercase tracking-wider ${
                          booking.status === 'confirmed' 
                            ? 'bg-blue-500/10 border border-blue-500/20 text-blue-300' 
                            : booking.status === 'completed'
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                              : 'bg-red-500/10 border border-red-500/20 text-red-300'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1.5 shrink-0">
                        {booking.status === 'confirmed' && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                completeBooking(booking.id);
                                alert('Appointment marked as COMPLETED. Loyalty stamps and statistics updated!');
                              }}
                              className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-black font-space font-bold uppercase text-[9px] tracking-wider rounded-xs"
                            >
                              COMPLETE
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm('Cancel this customer booking?')) {
                                  cancelBooking(booking.id);
                                }
                              }}
                              className="px-2 py-1 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 text-red-200 font-space uppercase text-[9px] rounded-xs"
                            >
                              CANCEL
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: SERVICE CATALOG */}
        {activeTab === 'services' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Catalog List with Inline Price Edits */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="font-bebas text-xl tracking-wider text-white border-b border-white/5 pb-2">ACTIVE PRICES</h4>
              <div className="space-y-3">
                {services.map((service) => (
                  <div key={service.id} className="bg-black/10 border border-white/5 p-4 rounded-sm flex justify-between items-center gap-4">
                    <div className="min-w-0">
                      <span className="text-[9px] text-[#A7A7A7] uppercase tracking-wider block font-space">{service.category}</span>
                      <h5 className="font-bold text-sm text-white truncate">{service.name}</h5>
                      <span className="text-xs text-[#A7A7A7]">{service.duration} mins</span>
                    </div>

                    {/* Price editor */}
                    <div className="flex items-center gap-3">
                      <div className="relative w-24">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gold text-xs font-bold">R</span>
                        <input
                          type="number"
                          value={service.price}
                          onChange={(e) => updateServicePrice(service.id, Number(e.target.value))}
                          className="w-full bg-black/50 border border-white/10 text-xs py-1.5 pl-5 pr-2 rounded-sm text-white font-space focus:border-gold focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete the service "${service.name}" completely from index?`)) {
                            deleteService(service.id);
                          }
                        }}
                        className="p-1 text-[#A7A7A7] hover:text-red-500"
                        title="Delete service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Catalog Add form */}
            <div className="lg:col-span-1 bg-black/20 border border-white/5 p-6 rounded-sm space-y-4">
              <h4 className="font-bebas text-xl tracking-wider text-white border-b border-white/5 pb-2">ADD NEW SERVICE</h4>
              <form onSubmit={handleCreateService} className="space-y-4 text-xs">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] tracking-widest text-[#A7A7A7] uppercase block">Service Name</label>
                  <input
                    type="text"
                    required
                    value={newSvcName}
                    onChange={(e) => setNewSvcName(e.target.value)}
                    placeholder="e.g. Royal Mud Facials"
                    className="w-full bg-black/40 border border-white/10 py-2.5 px-3 rounded-sm text-white text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] tracking-widest text-[#A7A7A7] uppercase block">Category</label>
                    <select
                      value={newSvcCategory}
                      onChange={(e) => setNewSvcCategory(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 py-2.5 px-3 rounded-sm text-white text-xs"
                    >
                      <option value="Haircut">Haircut</option>
                      <option value="Beard">Beard Care</option>
                      <option value="Shave">Shaving</option>
                      <option value="VIP">VIP Signature</option>
                      <option value="Treatment">Facial treatment</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] tracking-widest text-[#A7A7A7] uppercase block">Price (R)</label>
                    <input
                      type="number"
                      required
                      value={newSvcPrice}
                      onChange={(e) => setNewSvcPrice(Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/10 py-2.5 px-3 rounded-sm text-white text-xs font-space"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] tracking-widest text-[#A7A7A7] uppercase block">Duration (Minutes)</label>
                  <input
                    type="number"
                    required
                    value={newSvcDuration}
                    onChange={(e) => setNewSvcDuration(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 py-2.5 px-3 rounded-sm text-white text-xs font-space"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] tracking-widest text-[#A7A7A7] uppercase block">Description</label>
                  <textarea
                    required
                    rows={3}
                    value={newSvcDesc}
                    onChange={(e) => setNewSvcDesc(e.target.value)}
                    placeholder="Bespoke luxury description of the treatment..."
                    className="w-full bg-black/40 border border-white/10 py-2 px-3 rounded-sm text-white text-xs resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gold hover:bg-gold/90 text-black font-space font-bold uppercase tracking-widest rounded-sm transition-all text-[10px]"
                >
                  CATALOG IN INDEX
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: BARBER ROSTER */}
        {activeTab === 'barbers' && (
          <div className="space-y-6">
            <div className="border-l-2 border-gold pl-4">
              <h4 className="font-bebas text-xl tracking-wider text-[#F8F8F8]">EXPERT BARBER ROSTER & AVAILABILITY</h4>
              <p className="text-xs text-[#A7A7A7]">Configure working days and specialties for your master craftsmen.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {barbers.map((barber) => (
                <div key={barber.id} className="bg-black/20 border border-white/5 p-5 rounded-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={barber.image} 
                      alt={barber.name} 
                      className="w-12 h-12 rounded-full object-cover border border-white/10"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h5 className="font-bold text-sm text-white leading-tight">{barber.name}</h5>
                      <span className="text-gold text-[10px] block font-medium">{barber.role}</span>
                    </div>
                  </div>

                  {/* Available Weekdays config */}
                  <div className="space-y-2">
                    <label className="text-[10px] tracking-widest text-[#A7A7A7] uppercase block">ACTIVE WEEKDAYS</label>
                    <div className="flex flex-wrap gap-1.5">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => {
                        const isWorking = barber.availableDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleBarberAvailabilityDay(barber.id, day)}
                            className={`px-2 py-1 text-[9px] font-space font-semibold rounded-xs border transition-all ${
                              isWorking 
                                ? 'bg-gold/10 text-gold border-gold' 
                                : 'bg-black/30 text-white/30 border-white/5'
                            }`}
                          >
                            {day.substring(0, 3)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Specialties block */}
                  <div className="space-y-2">
                    <label className="text-[10px] tracking-widest text-[#A7A7A7] uppercase block">SPECIALTIES</label>
                    <div className="flex flex-wrap gap-1.5">
                      {barber.specialties.map((spec, i) => (
                        <span key={i} className="text-[10px] bg-white/5 px-2 py-0.5 rounded-sm text-white">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: REVIEW MODERATION */}
        {activeTab === 'reviews' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Active Reviews List */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="font-bebas text-xl tracking-wider text-white border-b border-white/5 pb-2">MODERATED REVIEW LOGS</h4>
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                {reviews.map((rev) => (
                  <div key={rev.id} className="bg-black/10 border border-white/5 p-4 rounded-sm space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{rev.name}</span>
                        <span className="text-[9px] bg-white/5 px-1.5 py-0.5 text-gold font-space rounded-sm uppercase">{rev.service}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-gold fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-[#A7A7A7] leading-relaxed italic">"{rev.text}"</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated Review Injector */}
            <div className="lg:col-span-1 bg-black/20 border border-white/5 p-6 rounded-sm space-y-4">
              <h4 className="font-bebas text-xl tracking-wider text-white border-b border-white/5 pb-2">POST SIMULATED RECOGNITION</h4>
              <p className="text-[11px] text-[#A7A7A7]">Generate a guest review in real-time to check public website synchronization.</p>
              
              <form onSubmit={handlePostReview} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[10px] tracking-widest text-[#A7A7A7] uppercase block">Guest Name</label>
                  <input
                    type="text"
                    required
                    value={newRevName}
                    onChange={(e) => setNewRevName(e.target.value)}
                    placeholder="e.g. Al Pacino"
                    className="w-full bg-black/40 border border-white/10 py-2 px-3 rounded-sm text-white text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] tracking-widest text-[#A7A7A7] uppercase block">Rating</label>
                    <select
                      value={newRevRating}
                      onChange={(e) => setNewRevRating(Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/10 py-2 px-3 rounded-sm text-white text-xs"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                      <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] tracking-widest text-[#A7A7A7] uppercase block">Treatment</label>
                    <select
                      value={newRevService}
                      onChange={(e) => setNewRevService(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 py-2 px-3 rounded-sm text-white text-xs"
                    >
                      {services.map(s => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] tracking-widest text-[#A7A7A7] uppercase block">Review Text</label>
                  <textarea
                    required
                    rows={3}
                    value={newRevText}
                    onChange={(e) => setNewRevText(e.target.value)}
                    placeholder="A marvelous shave ritual, clean lines..."
                    className="w-full bg-black/40 border border-white/10 py-2 px-3 rounded-sm text-white text-xs resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gold text-black font-space font-bold uppercase tracking-widest rounded-sm transition-all text-[10px]"
                >
                  POST GUEST RECOG
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 6: HOLIDAY CALENDAR */}
        {activeTab === 'holidays' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <h4 className="font-bebas text-xl tracking-wider text-white border-b border-white/5 pb-2">ESTABLISHED SHOP CLOSURE DATES</h4>
              <p className="text-xs text-[#A7A7A7]">These specific dates will block client reservation selects to prevent conflicting double-bookings.</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {shopClosures.map((date) => (
                  <div key={date} className="bg-black/20 border border-white/5 p-3 rounded-sm flex items-center justify-between text-xs font-space">
                    <span className="text-white font-medium">{date}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveClosure(date)}
                      className="text-[#A7A7A7] hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-1 bg-black/20 border border-white/5 p-6 rounded-sm space-y-4 text-xs">
              <h4 className="font-bebas text-xl tracking-wider text-white border-b border-white/5 pb-2">SCHEDULE CLOSURE</h4>
              
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] tracking-widest text-[#A7A7A7] uppercase block">Lock Date</label>
                  <input
                    type="date"
                    value={newClosureDate}
                    onChange={(e) => setNewClosureDate(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 py-2 px-3 rounded-sm text-white text-xs font-space focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddClosure}
                  className="w-full py-2 bg-gold text-black font-space font-bold uppercase tracking-widest rounded-sm text-[10px]"
                >
                  SCHEDULE CLOSURE
                </button>
              </div>

              <div className="bg-white/[0.01] border border-white/5 p-3 rounded-sm text-[11px] text-[#A7A7A7] space-y-1 font-sans">
                <div className="flex gap-1.5 items-center text-gold font-medium">
                  <AlertCircle className="w-4 h-4" />
                  <span>REGULATORY CONTROL</span>
                </div>
                <p>Standard locked holidays like Christmas and New Years are pre-scheduled.</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
