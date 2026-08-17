import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Consultation, Order, ClientQuote } from '../types';
import { 
  X, User, Calendar, ShoppingBag, CreditCard, LogIn, 
  Lock, Check, LogOut, FileText, Download, ShieldCheck,
  Clock, AlertCircle, Sparkles, Mail, Phone, ArrowRight
} from 'lucide-react';
import AddToCalendarButton from './AddToCalendarButton';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { email: string; name: string } | null;
  onLogin: (email: string, name: string) => void;
  onLogout: () => void;
  onOpenDashboard?: () => void;
}

export default function AccountModal({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  onOpenDashboard
}: AccountModalProps) {
  const { t, language } = useLanguage();
  const { profile, loginWithEmail, registerWithEmail, loginWithGoogle, logout: authLogout } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authErrorMsg, setAuthErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [verificationSentEmail, setVerificationSentEmail] = useState<string | null>(null);

  // Client Data States
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [quotes, setQuotes] = useState<ClientQuote[]>([]);
  const [activeTab, setActiveTab] = useState<'consultations' | 'quotes' | 'orders'>('consultations');

  const activeEmail = profile?.email || currentUser?.email || '';
  const activeName = profile?.displayName || currentUser?.name || '';

  // Load client consultations, orders, and quotes from local storage and mock live backend
  useEffect(() => {
    if (activeEmail) {
      try {
        const rawCons = localStorage.getItem('lumiskin_consultations');
        const allCons: Consultation[] = rawCons ? JSON.parse(rawCons) : [];
        const userCons = allCons.filter(c => c.email.toLowerCase() === activeEmail.toLowerCase());
        
        // Add sample live consultation for realistic demo if empty
        if (userCons.length === 0) {
          userCons.push({
            id: 'cons-' + Math.random().toString(36).substring(2, 7),
            firstName: activeName.split(' ')[0] || 'Patient',
            lastName: activeName.split(' ').slice(1).join(' ') || '',
            email: activeEmail,
            phone: '+1 809 555 0199',
            procedure: 'Lipoescultura HD con Marcación',
            specialistId: 'dr-victor-estrella',
            date: '2026-08-28',
            time: '10:30 AM',
            notes: 'Valoración inicial y revisión de historial médico.',
            status: 'confirmed'
          });
        }
        setConsultations(userCons);

        // Quotes
        const sampleQuotes: ClientQuote[] = [
          {
            id: 'QTE-8921',
            clientEmail: activeEmail,
            clientName: activeName,
            procedure: 'Lipoescultura HD + Definición Abdominal',
            date: '2026-08-10',
            totalAmount: 4800,
            status: 'approved',
            breakdown: [
              { item: 'Honorarios Quirúrgicos Dr. Víctor Estrella', cost: 3200 },
              { item: 'Quirófano & Sala de Recuperación Certificada', cost: 1100 },
              { item: 'Faja Quirúrgica & Masajes Linfáticos Post-Op (x5)', cost: 500 }
            ]
          }
        ];
        setQuotes(sampleQuotes);

        // Orders
        const rawOrders = localStorage.getItem('lumiskin_orders');
        const allOrders: Order[] = rawOrders ? JSON.parse(rawOrders) : [];
        const userOrders = allOrders.filter(o => o.customerEmail.toLowerCase() === activeEmail.toLowerCase());
        setOrders(userOrders);
      } catch (err) {
        console.error('Error loading patient account data', err);
      }
    }
  }, [activeEmail, activeName, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setAuthErrorMsg(null);

    // Front-end password length validation
    if (!password || password.length < 6) {
      setAuthErrorMsg(
        language === 'es'
          ? 'La contraseña debe tener al menos 6 caracteres.'
          : 'Password must be at least 6 characters.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      if (isRegistering) {
        if (!name || !name.trim()) {
          setAuthErrorMsg(language === 'es' ? 'Por favor ingrese su nombre' : 'Please enter your name');
          setIsSubmitting(false);
          return;
        }
        await registerWithEmail(email.trim(), password, name.trim(), 'client');
        setVerificationSentEmail(email.trim());
        setPassword('');
      } else {
        await loginWithEmail(email.trim(), password);
        const finalName = name || email.split('@')[0];
        onLogin(email.trim(), finalName);
        onClose();
      }
    } catch (err: any) {
      console.error('Auth submit error:', err);
      const msg = err?.message || '';
      const code = err?.code || '';

      if (code === 'auth/email-not-verified' || msg.includes('email-not-verified')) {
        setAuthErrorMsg(
          language === 'es'
            ? 'Su correo aún no ha sido verificado. Por favor revise su bandeja de entrada y haga clic en el enlace de verificación antes de iniciar sesión.'
            : 'Your email is not verified yet. Please check your inbox and verify your email before logging in.'
        );
      } else if (code === 'auth/weak-password' || msg.includes('weak-password') || msg.includes('6 characters')) {
        setAuthErrorMsg(
          language === 'es'
            ? 'La contraseña debe tener al menos 6 caracteres.'
            : 'Password must be at least 6 characters.'
        );
      } else if (code === 'auth/email-already-in-use' || msg.includes('email-already-in-use')) {
        setAuthErrorMsg(
          language === 'es'
            ? 'Este correo ya está registrado. Por favor inicie sesión.'
            : 'An account with this email already exists. Please sign in.'
        );
      } else if (
        code === 'auth/invalid-credential' ||
        code === 'auth/wrong-password' ||
        code === 'auth/user-not-found' ||
        code === 'auth/invalid-email'
      ) {
        setAuthErrorMsg(
          language === 'es'
            ? 'Correo electrónico o contraseña incorrectos.'
            : 'Email or password is incorrect.'
        );
      } else {
        setAuthErrorMsg(
          err?.message || (language === 'es' ? 'Ocurrió un error al autenticar.' : 'Authentication error. Please check your credentials.')
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthErrorMsg(null);
    setIsGoogleSubmitting(true);
    try {
      const userProfile = await loginWithGoogle();
      onLogin(userProfile.email, userProfile.displayName);
      onClose();
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        console.error('Google Sign In error:', err);
        setAuthErrorMsg(err?.message || (language === 'es' ? 'Error al iniciar con Google' : 'Google Sign In failed'));
      }
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleClientLogout = async () => {
    await authLogout();
    onLogout();
  };

  if (!isOpen) return null;

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#EBE6DF] animate-in zoom-in-95 duration-200 cursor-default"
      >
        
        {/* Header */}
        <div className="px-6 py-4.5 bg-[#FCFBF9] border-b border-[#EBE6DF] flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[#2D211A]">
            <div className="w-8 h-8 rounded-lg bg-[#0373bb]/10 flex items-center justify-center text-[#0373bb]">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold">
                {language === 'es' ? 'Portal del Paciente' : 'Patient Portal'}
              </h3>
              <p className="text-[11px] text-neutral-400">
                Dr. Víctor Estrella Plastic Surgery
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#5C4D44] hover:text-[#2D211A] p-1 rounded-full hover:bg-neutral-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Portal body */}
        {activeEmail ? (
          /* Logged In Patient Account View */
          <div className="p-6 sm:p-8 space-y-6 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#FCFBF9] p-5 rounded-2xl border border-[#EBE6DF] gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-full bg-[#0373bb] text-white flex items-center justify-center font-bold text-lg font-serif shadow-sm">
                  {activeName ? activeName[0].toUpperCase() : 'P'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-sans text-base font-bold text-[#2D211A]">{activeName || 'Paciente Estimado'}</h4>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full uppercase">
                      {language === 'es' ? 'Activo' : 'Verified'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">{activeEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onOpenDashboard && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenDashboard();
                    }}
                    className="flex items-center space-x-1.5 py-2 px-4 rounded-xl bg-[#0373bb] hover:bg-[#025a94] text-white transition-colors text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{language === 'es' ? 'Abrir Panel de Atención' : 'Open Care Dashboard'}</span>
                  </button>
                )}
                <button
                  onClick={handleClientLogout}
                  className="flex items-center space-x-1.5 py-2 px-3.5 rounded-xl hover:bg-red-50 text-neutral-600 hover:text-red-600 transition-colors text-xs font-semibold uppercase tracking-wider cursor-pointer border border-neutral-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{language === 'es' ? 'Cerrar' : 'Sign Out'}</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-neutral-200 gap-6">
              <button
                onClick={() => setActiveTab('consultations')}
                className={`pb-3 font-semibold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'consultations'
                    ? 'border-[#0373bb] text-[#0373bb]'
                    : 'border-transparent text-neutral-400 hover:text-neutral-700'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>{language === 'es' ? 'Mis Citas' : 'My Appointments'}</span>
                <span className="bg-neutral-100 text-neutral-700 px-1.5 py-0.2 rounded-full text-[10px]">
                  {consultations.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('quotes')}
                className={`pb-3 font-semibold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'quotes'
                    ? 'border-[#0373bb] text-[#0373bb]'
                    : 'border-transparent text-neutral-400 hover:text-neutral-700'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>{language === 'es' ? 'Cotizaciones & Presupuestos' : 'Quotes & Pricing'}</span>
                <span className="bg-neutral-100 text-neutral-700 px-1.5 py-0.2 rounded-full text-[10px]">
                  {quotes.length}
                </span>
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'consultations' && (
              <div className="space-y-4">
                {consultations.length === 0 ? (
                  <div className="text-center py-10 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                    <Calendar className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                    <p className="text-xs text-neutral-500 font-medium">
                      {language === 'es' ? 'No tiene citas programadas actualmente.' : 'No scheduled consultations found.'}
                    </p>
                  </div>
                ) : (
                  consultations.map((c) => (
                    <div key={c.id} className="p-4.5 bg-[#FCFBF9] rounded-2xl border border-[#EBE6DF] hover:border-[#0373bb]/40 transition-all space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0373bb] bg-[#0373bb]/10 px-2 py-0.5 rounded-md">
                            {c.procedure}
                          </span>
                          <h5 className="font-bold text-sm text-[#2D211A] mt-1.5">
                            {language === 'es' ? 'Consulta de Valoración Quirúrgica' : 'Surgical Consultation'}
                          </h5>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                          c.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {c.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-xs text-neutral-600 pt-1">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#0373bb]" />
                          <span>{c.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#0373bb]" />
                          <span>{c.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#0373bb]" />
                          <span>Dr. Víctor Estrella</span>
                        </div>
                      </div>

                      {c.notes && (
                        <p className="text-xs text-neutral-500 bg-white p-2.5 rounded-xl border border-neutral-200/60">
                          <span className="font-semibold text-neutral-700">{language === 'es' ? 'Instrucciones: ' : 'Notes: '}</span>
                          {c.notes}
                        </p>
                      )}

                      <div className="pt-2 flex justify-end">
                        <AddToCalendarButton 
                          procedure={c.procedure}
                          date={c.date}
                          time={c.time}
                          patientName={`${c.firstName} ${c.lastName}`.trim() || activeName}
                          variant="compact"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'quotes' && (
              <div className="space-y-4">
                {quotes.map((q) => (
                  <div key={q.id} className="p-5 bg-[#FCFBF9] rounded-2xl border border-[#EBE6DF] space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-neutral-400 font-mono">#{q.id}</span>
                        <h5 className="font-bold text-sm text-[#2D211A]">{q.procedure}</h5>
                        <p className="text-xs text-neutral-400">{language === 'es' ? 'Emitido el: ' : 'Issued: '}{q.date}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-[#0373bb] font-serif">${q.totalAmount.toLocaleString()} USD</span>
                        <span className="block text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase mt-1">
                          {q.status}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-3 border border-neutral-200/60 space-y-2 text-xs">
                      <p className="font-bold text-neutral-700 text-[11px] uppercase tracking-wider">{language === 'es' ? 'Desglose Quirúrgico' : 'Package Breakdown'}:</p>
                      {q.breakdown.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-neutral-600 text-xs py-0.5 border-b border-neutral-100 last:border-0">
                          <span>{item.item}</span>
                          <span className="font-semibold text-neutral-800">${item.cost.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : verificationSentEmail ? (
          /* Email Verification Sent View matching provided reference card */
          <div className="p-8 sm:p-10 space-y-6 text-center animate-in fade-in">
            <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-2 shadow-xs">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-xs">
                <Mail className="w-5 h-5 text-slate-400" />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-2xl font-bold text-slate-900 tracking-tight font-sans">
                Check Your Inbox
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed px-1">
                We have sent you a verification email to{' '}
                <span className="font-semibold text-indigo-600 break-all">{verificationSentEmail}</span>.
                <br />
                Please verify it and log in.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setVerificationSentEmail(null);
                  setIsRegistering(false);
                  setAuthErrorMsg(null);
                }}
                className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-2xl font-semibold text-sm transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Login</span>
              </button>
            </div>
          </div>
        ) : (
          /* Client Login & Registration Form */
          <div className="p-6 sm:p-8 space-y-6 text-left">
            <div className="text-center space-y-1">
              <h4 className="font-serif text-xl font-bold text-[#2D211A]">
                {isRegistering 
                  ? (language === 'es' ? 'Crear Cuenta de Paciente' : 'Create Patient Account')
                  : (language === 'es' ? 'Iniciar Sesión en su Portal' : 'Sign in to Patient Portal')}
              </h4>
              <p className="text-xs text-neutral-500">
                {language === 'es' 
                  ? 'Consulte sus citas de valoración, cotizaciones médicas y planes quirúrgicos.' 
                  : 'Access your surgical consultations, medical quotes, and recovery timeline.'}
              </p>
            </div>

            {authErrorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{authErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {/* Google One-Click Sign In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleSubmitting || isSubmitting}
                className="w-full py-2.5 px-4 bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-300 rounded-xl font-medium text-xs transition-all shadow-xs flex items-center justify-center gap-3 cursor-pointer hover:border-neutral-400 disabled:opacity-60"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>
                  {isGoogleSubmitting 
                    ? (language === 'es' ? 'Conectando con Google...' : 'Connecting with Google...') 
                    : (language === 'es' ? 'Continuar con Google / Gmail' : 'Continue with Google / Gmail')}
                </span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="grow border-t border-neutral-200"></div>
                <span className="shrink mx-3 text-[11px] text-neutral-400 font-medium uppercase tracking-wider">
                  {language === 'es' ? 'o con correo electrónico' : 'or with email & password'}
                </span>
                <div className="grow border-t border-neutral-200"></div>
              </div>

              {isRegistering && (
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    {language === 'es' ? 'Nombre Completo' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      required
                      placeholder="María González"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-[#0373bb] focus:bg-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  {language === 'es' ? 'Correo Electrónico' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="email"
                    required
                    placeholder="paciente@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-[#0373bb] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                    {language === 'es' ? 'Contraseña' : 'Password'}
                  </label>
                  <span className="text-[10px] text-neutral-400 font-medium">
                    {language === 'es' ? '(mín. 6 caracteres)' : '(min. 6 characters)'}
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-[#0373bb] focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#0373bb] hover:bg-[#025c96] text-white rounded-xl font-semibold text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{isRegistering ? (language === 'es' ? 'Registrarse' : 'Create Account') : (language === 'es' ? 'Ingresar' : 'Sign In')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setAuthErrorMsg(null);
                }}
                className="text-xs text-[#0373bb] hover:underline font-semibold"
              >
                {isRegistering
                  ? (language === 'es' ? '¿Ya tiene cuenta? Iniciar Sesión' : 'Already have an account? Sign In')
                  : (language === 'es' ? '¿Nuevo paciente? Crear cuenta' : 'New patient? Register here')}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
