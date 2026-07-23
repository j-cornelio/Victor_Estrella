import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Consultation, Order } from '../types';
import { X, User, Calendar, ShoppingBag, CreditCard, LogIn, Lock, Check, LogOut } from 'lucide-react';
import AddToCalendarButton from './AddToCalendarButton';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { email: string; name: string } | null;
  onLogin: (email: string, name: string) => void;
  onLogout: () => void;
}

export default function AccountModal({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout
}: AccountModalProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  // Fetch client data from localStorage based on user email
  useEffect(() => {
    if (currentUser) {
      try {
        const rawCons = localStorage.getItem('lumiskin_consultations');
        const allCons: Consultation[] = rawCons ? JSON.parse(rawCons) : [];
        const userCons = allCons.filter(c => c.email.toLowerCase() === currentUser.email.toLowerCase());
        setConsultations(userCons);

        const rawOrders = localStorage.getItem('lumiskin_orders');
        const allOrders: Order[] = rawOrders ? JSON.parse(rawOrders) : [];
        const userOrders = allOrders.filter(o => o.customerEmail.toLowerCase() === currentUser.email.toLowerCase());
        setOrders(userOrders);

        const rawPayments = localStorage.getItem('lumiskin_payments');
        const allPayments = rawPayments ? JSON.parse(rawPayments) : [];
        const userPayments = allPayments.filter((p: any) => p.customerName.toLowerCase() === currentUser.name.toLowerCase());
        setPayments(userPayments);
      } catch (err) {
        console.error('Error reading localStorage cabinet data', err);
      }
    }
  }, [currentUser, isOpen]);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (isRegistering && !name) return;

    const finalName = name || email.split('@')[0];
    onLogin(email, finalName);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#EBE6DF] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4.5 bg-[#FCFBF9] border-b border-[#EBE6DF] flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[#2D211A]">
            <User className="w-5 h-5 text-[#0373bb]" />
            <h3 className="font-serif text-lg font-bold">{t('account.cabinet')}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#5C4D44] hover:text-[#2D211A] p-1 rounded-full hover:bg-neutral-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Portal body */}
        {currentUser ? (
          /* Logged In Portal Panel */
          <div className="p-6 sm:p-8 space-y-6 text-left">
            <div className="flex items-center justify-between bg-neutral-50 p-4 sm:p-5 rounded-2xl border border-neutral-200/50">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-full bg-[#0373bb]/10 text-[#0373bb] flex items-center justify-center font-bold text-lg font-serif">
                  {currentUser.name[0].toUpperCase()}
                </div>
                <div>
                  <h4 className="font-sans text-sm sm:text-base font-bold text-[#2D211A]">{t('account.welcome')} {currentUser.name}</h4>
                  <p className="text-xs text-neutral-400 mt-0.5">{currentUser.email} • Client ID #{Math.abs(currentUser.email.split('').reduce((a, b) => a + b.charCodeAt(0), 0))}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center space-x-1.5 p-2 px-3.5 rounded-full hover:bg-red-50 text-neutral-500 hover:text-red-500 transition-colors text-xs font-semibold uppercase tracking-wider cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t('account.logout')}</span>
              </button>
            </div>

            {/* Cabinet Sections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Scheduled Consultations */}
              <div className="border border-neutral-200/60 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 border-b pb-2 mb-3 text-[#2D211A]">
                    <Calendar className="w-4.5 h-4.5 text-[#0373bb]" />
                    <h5 className="font-sans text-xs sm:text-sm font-bold uppercase tracking-wider">{t('account.scheduled_title')}</h5>
                  </div>

                  {consultations.length === 0 ? (
                    <p className="text-xs text-neutral-400 py-6 text-center leading-relaxed">
                      {t('account.no_consultations')}
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                      {consultations.map((c) => (
                        <div key={c.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/40 text-xs space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="space-y-0.5">
                              <p className="font-bold text-[#2D211A]">{c.procedure}</p>
                              <p className="text-[10px] text-neutral-400">{c.date} at {c.time}</p>
                            </div>
                            <span className="text-[9px] bg-[#F2FBFB] text-[#0373bb] border border-cyan-100 font-bold px-2 py-0.5 rounded-full uppercase">
                              {c.status}
                            </span>
                          </div>
                          <div className="pt-1 border-t border-neutral-200/40 flex justify-end">
                            <AddToCalendarButton
                              procedure={c.procedure}
                              date={c.date}
                              time={c.time}
                              patientName={`${c.firstName} ${c.lastName}`}
                              variant="compact"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Purchase history & Orders */}
              <div className="border border-neutral-200/60 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 border-b pb-2 mb-3 text-[#2D211A]">
                    <ShoppingBag className="w-4.5 h-4.5 text-[#0373bb]" />
                    <h5 className="font-sans text-xs sm:text-sm font-bold uppercase tracking-wider">{t('account.clinical_history')}</h5>
                  </div>

                  {orders.length === 0 ? (
                    <p className="text-xs text-neutral-400 py-6 text-center leading-relaxed">
                      {t('account.history_placeholder')}
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                      {orders.map((o) => (
                        <div key={o.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/40 text-xs space-y-2">
                          <div className="flex justify-between items-center">
                            <p className="font-bold text-[#2D211A]">Order #{o.id.substr(6, 4).toUpperCase()}</p>
                            <span className="text-[9px] bg-green-50 text-green-600 border border-green-100 font-bold px-2 py-0.5 rounded-full uppercase">
                              {o.status}
                            </span>
                          </div>
                          <div className="space-y-1 text-[10px] text-neutral-500">
                            {o.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span>{item.name} x{item.quantity}</span>
                                <span className="font-medium text-[#2D211A]">${(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="border-t border-neutral-200/60 pt-1.5 flex justify-between text-[11px] font-bold text-[#2D211A]">
                            <span>Total</span>
                            <span>${o.total.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Payment history transactions */}
            {payments.length > 0 && (
              <div className="border border-neutral-200/60 rounded-2xl p-5 space-y-3">
                <div className="flex items-center space-x-2 border-b pb-2 text-[#2D211A]">
                  <CreditCard className="w-4.5 h-4.5 text-[#0373bb]" />
                  <h5 className="font-sans text-xs sm:text-sm font-bold uppercase tracking-wider">Secured Payments Ledger</h5>
                </div>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {payments.map((p) => (
                    <div key={p.id} className="text-xs flex justify-between items-center py-2 border-b border-neutral-100 last:border-0 text-[#5C4D44]">
                      <div className="flex items-center space-x-2">
                        <span className="text-emerald-600">✔</span>
                        <span>Clinical clearing ID: <strong>{p.id}</strong> via *{p.lastFour}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#2D211A]">${p.amount.toFixed(2)}</p>
                        <p className="text-[9px] text-neutral-400">{p.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Authentication Screen (Login / Sign Up) */
          <form onSubmit={handleAuthSubmit} className="p-6 sm:p-10 space-y-6 text-left">
            <div className="text-center max-w-sm mx-auto space-y-2.5">
              <div className="mx-auto w-12 h-12 bg-[#0373bb]/10 text-[#0373bb] rounded-full flex items-center justify-center shadow-xs">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="font-serif text-xl sm:text-2xl text-[#2D211A] font-medium tracking-tight">
                {isRegistering ? t('account.create') : t('account.login')}
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {isRegistering ? t('account.create_desc') : t('account.login_desc')}
              </p>
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              {isRegistering && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#5C4D44] uppercase tracking-wide">{t('account.full_name')}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sarah Jenkins"
                    className="w-full px-4 py-3 rounded-xl border border-[#D5CDD2] focus:ring-1 focus:ring-[#0373bb] text-xs font-sans text-[#2D211A]"
                    required
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#5C4D44] uppercase tracking-wide">{t('form.email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-[#D5CDD2] focus:ring-1 focus:ring-[#0373bb] text-xs font-sans text-[#2D211A]"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#2D211A] hover:bg-[#0373bb] text-white text-xs font-bold tracking-wider uppercase rounded-full shadow-sm hover:shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer pt-3"
              >
                <LogIn className="w-4 h-4" />
                <span>{isRegistering ? t('account.register_btn') : t('account.login_btn')}</span>
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-xs text-neutral-400 hover:text-[#0373bb] underline font-medium cursor-pointer"
              >
                {isRegistering ? 'Already have a profile? Access instead' : 'New patient? Register your clinical profile'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
