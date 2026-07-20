import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Heart, Trash2, Plus, Minus, X, ShieldCheck, CreditCard, Sparkles, AlertCircle } from 'lucide-react';

export const ShopAndCart: React.FC = () => {
  const { products, cart, wishlist, addToCart, removeFromCart, updateCartQuantity, clearCart, toggleWishlist, submitCheckout } = useApp();
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(0); // 0 = closed, 1 = details, 2 = payment, 3 = success
  const [checkoutError, setCheckoutError] = useState('');
  
  // Checkout Form Details
  const [shipName, setShipName] = useState('');
  const [shipAddress, setShipAddress] = useState('');
  const [shipEmail, setShipEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  const cartTotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const tax = cartTotal * 0.08;
  const grandTotal = cartTotal + tax + 150; // R150 priority delivery

  const handleStartCheckout = () => {
    if (cart.length === 0) return;
    setCheckoutStep(1);
    setIsCartOpen(false);
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipName || !shipAddress || !shipEmail) {
      alert('Please fill out all contact details.');
      return;
    }
    setCheckoutStep(2);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cardNumber.length < 12 || !cardExpiry || cardCvv.length < 3) {
      alert('Please enter valid premium credentials.');
      return;
    }
    
    setIsProcessing(true);
    setCheckoutError('');
    
    try {
      const result = await submitCheckout({
        name: shipName,
        email: shipEmail,
        phone: '0000000000',
      }, `Delivery Address: ${shipAddress}`);

      setPlacedOrder({
        orderId: result.orderNumber,
        items: [...cart],
        amountPaid: result.total,
        customerName: shipName,
        deliveryAddress: shipAddress,
        deliveryEmail: shipEmail,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      });
      setCheckoutStep(3);
    } catch (err: any) {
      console.error('Checkout failed:', err);
      setCheckoutError(err?.message || 'Transaction authorization failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const closeCheckout = () => {
    setCheckoutStep(0);
    setPlacedOrder(null);
    setShipName('');
    setShipAddress('');
    setShipEmail('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
  };

  return (
    <div className="relative">
      {/* Dynamic Apothecary Category Banner */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/5 pb-6 mb-8 gap-4">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-gold uppercase font-bold">SOVEREIGN BOTANICALS</span>
          <h3 className="font-bebas text-3xl tracking-wider text-[#F8F8F8]">APOTHECARY & GROOMING ESSENTIALS</h3>
        </div>

        {/* Floating Cart Button */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="relative px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-sm text-white font-space text-xs tracking-wider uppercase transition-all flex items-center gap-2"
        >
          <ShoppingCart className="w-4 h-4 text-gold" />
          <span>CART</span>
          {cart.length > 0 && (
            <span className="bg-gold text-[#0F0F0F] font-bold px-1.5 py-0.5 text-[10px] rounded-sm font-space ml-1">
              {cart.reduce((total, item) => total + item.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      {/* PRODUCTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => {
          const isWish = wishlist.includes(product.id);
          return (
            <div
              key={product.id}
              className="group bg-[#171717]/50 hover:bg-[#171717] border border-white/5 hover:border-[#C89B3C]/30 rounded-sm overflow-hidden flex flex-col transition-all duration-300 relative shadow-lg"
            >
              {/* Wishlist Heart Icon absolute top */}
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md flex items-center justify-center text-[#A7A7A7] hover:text-red-500 transition-colors"
              >
                <Heart className={`w-4 h-4 ${isWish ? 'fill-red-500 text-red-500' : ''}`} />
              </button>

              {/* Product Volume absolute label */}
              <span className="absolute top-4 left-4 z-10 bg-black/80 border border-white/10 text-white font-space text-[10px] tracking-widest px-2.5 py-0.5 rounded-sm uppercase">
                {product.volume}
              </span>

              {/* Product Image Frame */}
              <div className="relative h-64 overflow-hidden bg-black/20">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Product Details Block */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] tracking-widest text-[#A7A7A7] uppercase block">{product.category}</span>
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-base text-[#F8F8F8] font-sans group-hover:text-gold transition-colors">{product.name}</h4>
                    <span className="font-space text-base text-gold font-bold shrink-0">R{product.price}</span>
                  </div>
                  <p className="text-xs text-[#A7A7A7] leading-relaxed line-clamp-3">{product.description}</p>
                </div>

                <button
                  type="button"
                  onClick={() => addToCart(product)}
                  className="w-full py-2.5 bg-white/5 hover:bg-gold hover:text-black border border-white/10 hover:border-gold font-space text-xs font-bold tracking-widest uppercase transition-all rounded-sm flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-3.5 h-3.5" /> ADD TO CART
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* SHOPPING CART DRAWER (Slide Out) */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 z-50 bg-[#0F0F0F]"
            />

            {/* Cart Panel Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
              className="fixed top-0 right-0 bottom-0 z-[100] w-full max-w-md bg-[#171717] border-l border-white/5 p-6 shadow-2xl flex flex-col"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-gold" />
                  <h4 className="font-bebas text-2xl tracking-wider text-[#F8F8F8]">YOUR SELECTED CART</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 text-[#A7A7A7] hover:text-[#F8F8F8] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2">
                  <ShoppingCart className="w-12 h-12 text-[#A7A7A7]/20 mb-2" />
                  <p className="text-sm text-[#A7A7A7]">Your shopping bag is empty.</p>
                  <p className="text-xs text-[#A7A7A7]/50">Explore our Apothecary line to purchase custom gels, oils, and creams.</p>
                </div>
              ) : (
                <>
                  {/* Cart Items List */}
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item.product.id}
                        className="bg-[#0F0F0F] border border-white/5 p-3 rounded-sm flex gap-3 relative group"
                      >
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-sm border border-white/5"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0 pr-6 flex flex-col justify-between">
                          <div>
                            <h5 className="font-bold text-xs text-white truncate">{item.product.name}</h5>
                            <span className="font-space text-xs text-gold font-bold block mt-0.5">R{item.product.price}</span>
                          </div>

                          {/* Qty selectors */}
                          <div className="flex items-center gap-2.5 mt-2">
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                              className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#A7A7A7] hover:text-white transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-space text-xs font-semibold text-white">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                              className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#A7A7A7] hover:text-white transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Remove item button */}
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="absolute top-3 right-3 text-[#A7A7A7] hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Pricing summaries & Checkout CTA */}
                  <div className="border-t border-white/5 pt-4 mt-6 space-y-3.5">
                    <div className="space-y-1.5 text-xs text-[#A7A7A7]">
                      <div className="flex justify-between">
                        <span>Cart Subtotal</span>
                        <span className="font-space text-white">R{cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Luxury Sales Tax (8%)</span>
                        <span className="font-space text-white">R{tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Priority Secure Courier</span>
                        <span className="font-space text-white">R150.00</span>
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-3.5 flex justify-between items-baseline">
                      <span className="text-sm font-bold tracking-widest text-white uppercase">TOTAL INVESTMENT</span>
                      <span className="font-space text-xl text-gold font-bold">R{grandTotal.toFixed(2)}</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleStartCheckout}
                      className="w-full py-3 bg-gold hover:bg-gold/90 text-[#0F0F0F] font-space text-xs font-bold tracking-widest uppercase transition-all rounded-sm flex items-center justify-center gap-1.5 shadow-md"
                    >
                      PROCEED TO SECURE CHECKOUT
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CHECKOUT SYSTEM DIALOG */}
      <AnimatePresence>
        {checkoutStep > 0 && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={closeCheckout}
              className="absolute inset-0 bg-[#0F0F0F]"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#171717] border border-white/10 p-6 md:p-8 rounded-sm shadow-2xl overflow-hidden"
            >
              {/* Grain decoration overlay */}
              <div className="pointer-events-none absolute inset-0 opacity-[0.02] bg-repeat bg-center" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noise\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.8\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noise)\"/%3E%3C/svg%3E')" }} />

              <button
                type="button"
                onClick={closeCheckout}
                className="absolute top-4 right-4 text-[#A7A7A7] hover:text-[#F8F8F8] z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Step 1: Delivery Details Form */}
              {checkoutStep === 1 && (
                <form onSubmit={handleDetailsSubmit} className="space-y-5">
                  <div className="text-center pb-2 border-b border-white/5">
                    <span className="text-[9px] tracking-[0.2em] text-gold uppercase font-bold">STEP 1 OF 2</span>
                    <h4 className="font-bebas text-2xl tracking-wider text-white">COURIER DISPATCH REGISTRY</h4>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] tracking-widest text-[#A7A7A7] uppercase block">Recipient Name</label>
                      <input
                        type="text"
                        required
                        value={shipName}
                        onChange={(e) => setShipName(e.target.value)}
                        placeholder="e.g. Sir Charles Sterling"
                        className="w-full bg-black/40 border border-white/10 text-sm py-2.5 px-3 rounded-sm text-white focus:border-gold focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] tracking-widest text-[#A7A7A7] uppercase block">Shipping Address</label>
                      <input
                        type="text"
                        required
                        value={shipAddress}
                        onChange={(e) => setShipAddress(e.target.value)}
                        placeholder="e.g. 15 Curzon St, Mayfair, London"
                        className="w-full bg-black/40 border border-white/10 text-sm py-2.5 px-3 rounded-sm text-white focus:border-gold focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] tracking-widest text-[#A7A7A7] uppercase block">Email Coordinates</label>
                      <input
                        type="email"
                        required
                        value={shipEmail}
                        onChange={(e) => setShipEmail(e.target.value)}
                        placeholder="e.g. charles@sterling.com"
                        className="w-full bg-black/40 border border-white/10 text-sm py-2.5 px-3 rounded-sm text-white focus:border-gold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-white/5 text-xs text-[#A7A7A7]">
                    <span>Total Bill: <strong className="text-gold font-space text-sm">R{grandTotal.toFixed(2)}</strong></span>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-gold hover:bg-gold/90 text-black font-space font-bold uppercase tracking-wider rounded-sm transition-all"
                    >
                      PROCEED TO PAYMENT
                    </button>
                  </div>
                </form>
              )}

              {/* Step 2: Simulated Payment Form */}
              {checkoutStep === 2 && (
                <form onSubmit={handlePaymentSubmit} className="space-y-5">
                  <div className="text-center pb-2 border-b border-white/5">
                    <span className="text-[9px] tracking-[0.2em] text-gold uppercase font-bold">STEP 2 OF 2</span>
                    <h4 className="font-bebas text-2xl tracking-wider text-white">SECURE LEDGER EXCHANGE</h4>
                  </div>

                  {isProcessing ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-4">
                      <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-gold tracking-widest uppercase font-space animate-pulse">PROCESSING ENCRYPTED PAYMENT...</p>
                      <p className="text-xs text-[#A7A7A7]">Authorized via Sovereign Secure Encryptions.</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] tracking-widest text-[#A7A7A7] uppercase block">Premium Card Number</label>
                          <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A7A7A7]" />
                            <input
                              type="text"
                              required
                              maxLength={19}
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              placeholder="4111 0000 1234 5678"
                              className="w-full bg-black/40 border border-white/10 text-sm py-2.5 pl-10 pr-3 rounded-sm text-white focus:border-gold focus:outline-none font-space"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] tracking-widest text-[#A7A7A7] uppercase block">Expiry Date</label>
                            <input
                              type="text"
                              required
                              maxLength={5}
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              placeholder="MM/YY"
                              className="w-full bg-black/40 border border-white/10 text-sm py-2.5 px-3 rounded-sm text-white focus:border-gold focus:outline-none font-space"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] tracking-widest text-[#A7A7A7] uppercase block">CVV Code</label>
                            <input
                              type="password"
                              required
                              maxLength={4}
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              placeholder="***"
                              className="w-full bg-black/40 border border-white/10 text-sm py-2.5 px-3 rounded-sm text-white focus:border-gold focus:outline-none font-space"
                            />
                          </div>
                        </div>
                      </div>

                      {checkoutError && (
                        <p className="text-red-500 text-xs font-semibold">{checkoutError}</p>
                      )}

                      <div className="bg-white/[0.02] border border-white/5 p-3.5 rounded-sm flex gap-2 items-start text-xs text-[#A7A7A7]">
                        <AlertCircle className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                        <p>Your payment credentials will be simulated through mock security processors. Sandbox is fully secure.</p>
                      </div>

                      <div className="pt-4 flex items-center justify-between border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => setCheckoutStep(1)}
                          className="text-xs text-[#A7A7A7] hover:text-white uppercase tracking-widest"
                        >
                          BACK
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-space font-bold uppercase tracking-wider rounded-sm transition-all"
                        >
                          AUTHORIZE R{grandTotal.toFixed(2)}
                        </button>
                      </div>
                    </>
                  )}
                </form>
              )}

              {/* Step 3: Success Confirmation Receipt */}
              {checkoutStep === 3 && placedOrder && (
                <div className="space-y-6 text-center py-4">
                  <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(59,178,115,0.2)]">
                    <ShieldCheck className="w-8 h-8" />
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-bebas text-3xl tracking-widest text-white">LEDGER TRANSACTION COMPLETE</h4>
                    <p className="text-[#A7A7A7] text-xs">A luxury e-receipt and dispatch notice has been recorded.</p>
                  </div>

                  {/* Receipt styling */}
                  <div className="bg-black/30 border border-white/5 p-5 text-left text-xs space-y-3.5 rounded-sm">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-[#A7A7A7] tracking-wider">ORDER NUMBER:</span>
                      <span className="font-space font-bold text-white uppercase">{placedOrder.orderId}</span>
                    </div>

                    <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                      {placedOrder.items.map((item: any) => (
                        <div key={item.product.id} className="flex justify-between text-xs text-[#A7A7A7]">
                          <span>{item.product.name} (x{item.quantity})</span>
                          <span className="font-space text-white">R{(item.product.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-dashed border-white/10 pt-3 flex justify-between font-bold">
                      <span className="text-[#A7A7A7] uppercase tracking-wider">SECURED AMOUNT PAID:</span>
                      <span className="text-gold font-space text-sm">R{placedOrder.amountPaid.toFixed(2)}</span>
                    </div>

                    <div className="pt-2 text-[10px] text-[#A7A7A7] leading-relaxed border-t border-white/5">
                      <p><strong>Courier Address:</strong> {placedOrder.deliveryAddress}</p>
                      <p className="mt-1"><strong>Estimated Arrival:</strong> Next 2-3 business days via priority dispatch.</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={closeCheckout}
                    className="w-full py-2.5 bg-white text-[#0F0F0F] font-space text-xs font-bold tracking-widest uppercase transition-all rounded-sm hover:bg-neutral-200"
                  >
                    CONTINUE EXPLORING
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
