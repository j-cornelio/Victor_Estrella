import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Heart, 
  Calendar, 
  FileText, 
  Clock, 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  ShieldCheck, 
  Phone, 
  MessageSquare, 
  Download, 
  ChevronRight, 
  ArrowLeft, 
  User, 
  Pill, 
  Stethoscope, 
  Thermometer, 
  Droplets, 
  Sparkles,
  LogOut,
  Bell,
  Search,
  ExternalLink,
  Mail,
  Lock,
  LogIn,
  Check,
  Upload,
  Trash2,
  DollarSign,
  Plus,
  Eye,
  FileCheck
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  PatientRecord, 
  PatientFile, 
  PatientAppointment, 
  PatientMedication, 
  PatientLabResult 
} from '../types';
import { 
  subscribeToPatientRecord, 
  savePatientRecord, 
  uploadPatientFile, 
  deletePatientFile,
  createDefaultPatientRecord
} from '../lib/firestoreService';

interface PatientDashboardProps {
  onClose: () => void;
  onOpenConsultation?: (specialistId?: string, procedureName?: string) => void;
  onLoginSuccess?: (email: string, name: string) => void;
}

export default function PatientDashboard({ onClose, onOpenConsultation, onLoginSuccess }: PatientDashboardProps) {
  const { t, language } = useLanguage();
  const { profile, loginWithEmail, registerWithEmail, loginWithGoogle, logout } = useAuth();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'recovery' | 'medications' | 'labs' | 'quotes' | 'files'>('dashboard');
  
  // Real-time Firestore patient record state
  const [patientRecord, setPatientRecord] = useState<PatientRecord | null>(null);
  const [isRecordLoading, setIsRecordLoading] = useState(true);

  // File upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<PatientFile['category']>('pdf_records');
  const [fileNotes, setFileNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Login / Register state for unauthenticated view
  const [isRegistering, setIsRegistering] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authErrorMsg, setAuthErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [verificationSentEmail, setVerificationSentEmail] = useState<string | null>(null);

  // Subscribe to real-time patient record in Firestore when authenticated
  useEffect(() => {
    if (!profile?.uid) {
      setPatientRecord(null);
      setIsRecordLoading(false);
      return;
    }

    setIsRecordLoading(true);
    const unsubscribe = subscribeToPatientRecord(
      profile.uid,
      {
        uid: profile.uid,
        email: profile.email,
        displayName: profile.displayName
      },
      (record) => {
        setPatientRecord(record);
        setIsRecordLoading(false);
      },
      (err) => {
        console.warn('Firestore subscription notice:', err);
        // Fallback to local default if offline
        setPatientRecord(prev => prev || createDefaultPatientRecord({
          uid: profile.uid,
          email: profile.email,
          displayName: profile.displayName
        }));
        setIsRecordLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [profile?.uid, profile?.email, profile?.displayName]);

  // Toggle medication dose and sync to Firestore
  const handleToggleMedication = async (medId: string) => {
    if (!patientRecord) return;
    const updatedMeds = patientRecord.medications.map(m => 
      m.id === medId ? { ...m, isDone: !m.isDone } : m
    );
    const updatedRecord = { ...patientRecord, medications: updatedMeds };
    setPatientRecord(updatedRecord);
    try {
      await savePatientRecord(updatedRecord);
    } catch (e) {
      console.error('Failed to save medication state', e);
    }
  };

  // Toggle appointment completed
  const handleToggleAppointment = async (appId: string) => {
    if (!patientRecord) return;
    const updatedApps = patientRecord.appointments.map(a => 
      a.id === appId ? { ...a, completed: !a.completed } : a
    );
    const updatedRecord = { ...patientRecord, appointments: updatedApps };
    setPatientRecord(updatedRecord);
    try {
      await savePatientRecord(updatedRecord);
    } catch (e) {
      console.error('Failed to save appointment state', e);
    }
  };

  // File Upload Handler (Base64 storage in Firestore)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !patientRecord || !profile?.uid) return;

    setUploadError(null);
    setUploadSuccess(null);
    setIsUploading(true);

    try {
      if (file.size > 800 * 1024) {
        throw new Error(language === 'es' 
          ? 'El archivo excede el límite de 800KB de Firestore. Por favor seleccione un archivo PDF más pequeño o comprimido.'
          : 'File size exceeds the 800KB document limit. Please select a smaller or compressed PDF.');
      }

      await uploadPatientFile(
        profile.uid,
        patientRecord,
        file,
        selectedCategory,
        'patient',
        fileNotes.trim()
      );

      setUploadSuccess(language === 'es' ? '¡Documento PDF subido y guardado exitosamente en Firestore!' : 'PDF file uploaded and securely stored in Firestore!');
      setFileNotes('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      setUploadError(err?.message || (language === 'es' ? 'Error al subir el archivo.' : 'Failed to upload file.'));
    } finally {
      setIsUploading(false);
    }
  };

  // Delete file
  const handleDeleteFile = async (fileId: string) => {
    if (!patientRecord) return;
    try {
      await deletePatientFile(patientRecord, fileId);
    } catch (err) {
      console.error('Failed to delete file', err);
    }
  };

  // Download / View Base64 PDF
  const handleDownloadFile = (file: PatientFile) => {
    const link = document.createElement('a');
    link.href = file.dataUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle in-page auth submission
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail) return;
    setAuthErrorMsg(null);

    if (!authPassword || authPassword.length < 6) {
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
        if (!authName || !authName.trim()) {
          setAuthErrorMsg(language === 'es' ? 'Por favor ingrese su nombre' : 'Please enter your name');
          setIsSubmitting(false);
          return;
        }
        await registerWithEmail(authEmail.trim(), authPassword, authName.trim(), 'client');
        setVerificationSentEmail(authEmail.trim());
        setAuthPassword('');
      } else {
        await loginWithEmail(authEmail.trim(), authPassword);
        const finalName = authName || authEmail.split('@')[0];
        onLoginSuccess?.(authEmail.trim(), finalName);
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
      onLoginSuccess?.(userProfile.email, userProfile.displayName);
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        console.error('Google Sign In error:', err);
        setAuthErrorMsg(err?.message || (language === 'es' ? 'Error al iniciar con Google' : 'Google Sign In failed'));
      }
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const patientName = patientRecord?.patientName || profile?.displayName || profile?.email?.split('@')[0] || 'Patient';
  const mrnCode = patientRecord?.mrn || `MRN: #VE-2026-${profile?.uid?.slice(0, 4)?.toUpperCase() || '8942'}`;

  // If user is not logged in, render the dedicated Full-Page Portal Login / Verification Screen
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans antialiased flex flex-col justify-between">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#0373bb] transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-100 border border-slate-200 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{language === 'es' ? 'Volver al Sitio Web' : 'Back to Website'}</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#0373bb] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                VE
              </div>
              <div className="text-left">
                <h1 className="text-sm font-bold text-slate-900 leading-tight">Dr. Víctor Estrella</h1>
                <p className="text-[11px] text-slate-500 font-medium">Plastic & Reconstructive Surgery</p>
              </div>
            </div>

            <div className="w-20"></div>
          </div>
        </header>

        {/* Auth / Verification Full Page Container */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
          {verificationSentEmail ? (
            /* Email Verification Sent Screen */
            <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-8 sm:p-10 text-center animate-in fade-in zoom-in-95">
              <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-6 shadow-xs">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-xs">
                  <Mail className="w-5 h-5 text-slate-400" />
                </div>
              </div>

              <h2 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight font-sans mb-4">
                Check Your Inbox
              </h2>

              <p className="text-slate-600 text-sm leading-relaxed mb-8 px-2 font-normal">
                We have sent you a verification email to{' '}
                <span className="font-semibold text-indigo-600 break-all">{verificationSentEmail}</span>.
                <br />
                Please verify it and log in.
              </p>

              <div>
                <button
                  type="button"
                  onClick={() => {
                    setVerificationSentEmail(null);
                    setIsRegistering(false);
                    setAuthErrorMsg(null);
                  }}
                  className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm rounded-2xl transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Login</span>
                </button>
              </div>
            </div>
          ) : (
            /* Normal Login / Register Card */
            <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 sm:p-10 text-left">
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-[#0373bb]/10 text-[#0373bb] flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-serif">
                  {language === 'es' ? 'Portal del Paciente' : 'Patient Care Portal'}
                </h2>
                <p className="text-xs text-slate-500 mt-1.5">
                  {isRegistering 
                    ? (language === 'es' ? 'Cree su cuenta médica para acceder a su panel clínico.' : 'Create your secure medical account to access your dashboard.')
                    : (language === 'es' ? 'Inicie sesión para ver su recuperación, medicamentos y citas.' : 'Sign in to access your recovery tracking, medications, and records.')}
                </p>
              </div>

              {/* Error Message Alert */}
              {authErrorMsg && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 font-medium animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{authErrorMsg}</span>
                </div>
              )}

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleSubmitting || isSubmitting}
                className="w-full py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all flex items-center justify-center gap-3 shadow-xs mb-5 cursor-pointer disabled:opacity-60"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>
                  {isGoogleSubmitting 
                    ? (language === 'es' ? 'Conectando con Google...' : 'Connecting with Google...')
                    : (language === 'es' ? 'Continuar con Google' : 'Continue with Google')}
                </span>
              </button>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-slate-200"></div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase">{language === 'es' ? 'o con correo' : 'or with email'}</span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>

              {/* Email & Password Form */}
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {isRegistering && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {language === 'es' ? 'Nombre Completo' : 'Full Name'}
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="Ej. María Gómez"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#0373bb] focus:ring-2 focus:ring-[#0373bb]/20 text-xs font-medium bg-slate-50/50"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {language === 'es' ? 'Correo Electrónico' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="paciente@correo.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#0373bb] focus:ring-2 focus:ring-[#0373bb]/20 text-xs font-medium bg-slate-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {language === 'es' ? 'Contraseña' : 'Password'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#0373bb] focus:ring-2 focus:ring-[#0373bb]/20 text-xs font-medium bg-slate-50/50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#0373bb] hover:bg-[#025a94] text-white font-bold text-xs rounded-xl transition-all shadow-md mt-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  <span>
                    {isSubmitting 
                      ? (language === 'es' ? 'Procesando...' : 'Authenticating...')
                      : isRegistering 
                      ? (language === 'es' ? 'Crear Cuenta y Abrir Panel' : 'Sign Up & Open Dashboard')
                      : (language === 'es' ? 'Iniciar Sesión y Abrir Panel' : 'Sign In & Open Dashboard')}
                  </span>
                </button>
              </form>

              <div className="text-center mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setAuthErrorMsg(null);
                  }}
                  className="text-xs text-[#0373bb] font-bold hover:underline cursor-pointer"
                >
                  {isRegistering 
                    ? (language === 'es' ? '¿Ya tiene cuenta? Inicie sesión aquí' : 'Already have an account? Sign in here')
                    : (language === 'es' ? '¿Nuevo paciente? Regístrese aquí' : "Don't have an account? Sign up here")}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <footer className="py-4 text-center text-[11px] text-slate-400 border-t border-slate-200">
          Dr. Víctor Estrella Southeastern Aesthetic Surgery • HIPAA Compliant Patient Portal
        </footer>
      </div>
    );
  }

  const appointments = patientRecord?.appointments || [];
  const medications = patientRecord?.medications || [];
  const labs = patientRecord?.labs || [];
  const files = patientRecord?.files || [];
  const vitals = patientRecord?.vitalSigns || {
    bloodPressureSys: 118,
    bloodPressureDia: 76,
    heartRate: 72,
    fajaHours: 23.5,
    painScore: 2,
    healingProgress: 'Normal / En tiempo',
    lastUpdated: new Date().toISOString()
  };

  // If user IS authenticated, render the complete Hospital-style Patient Care Dashboard!
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans antialiased flex flex-col">
      {/* Top Clinical Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Return to website */}
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#0373bb] transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-100 border border-slate-200 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{language === 'es' ? 'Volver al Sitio Web' : 'Back to Website'}</span>
            </button>

            {/* Clinic Brand */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#0373bb] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                VE
              </div>
              <div className="text-left">
                <h1 className="text-sm font-bold text-slate-900 leading-tight">Dr. Víctor Estrella</h1>
                <p className="text-[11px] text-slate-500 font-medium">Plastic & Reconstructive Surgery</p>
              </div>
            </div>

            {/* Main Hospital / Portal Tabs */}
            <nav className="hidden md:flex items-center gap-1 ml-4">
              {[
                { id: 'dashboard', label: language === 'es' ? 'Panel Principal' : 'Dashboard' },
                { id: 'recovery', label: language === 'es' ? 'Recuperación' : 'My Recovery' },
                { id: 'medications', label: language === 'es' ? 'Medicamentos' : 'Medications' },
                { id: 'labs', label: language === 'es' ? 'Laboratorios' : 'Lab Results' },
                { id: 'quotes', label: language === 'es' ? 'Presupuesto' : 'Surgical Quotes' },
                { id: 'files', label: language === 'es' ? 'Expediente & PDFs' : 'Medical PDFs' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-[#0373bb]/10 text-[#0373bb] font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Right Action Icons & User Profile */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-900">{patientName}</span>
              <span className="text-[10px] text-slate-500 font-mono">{mrnCode}</span>
            </div>

            <div className="w-8 h-8 rounded-full bg-[#0373bb] text-white flex items-center justify-center font-bold text-xs">
              {patientName ? patientName[0].toUpperCase() : 'P'}
            </div>

            <button
              onClick={() => logout()}
              title={language === 'es' ? 'Cerrar Sesión' : 'Sign Out'}
              className="flex items-center gap-1.5 py-1.5 px-2.5 text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-slate-200 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{language === 'es' ? 'Salir' : 'Sign Out'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Tab Scroller */}
        <div className="md:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 border-t border-slate-100 bg-slate-50">
          {[
            { id: 'dashboard', label: language === 'es' ? 'Panel' : 'Dashboard' },
            { id: 'recovery', label: language === 'es' ? 'Recuperación' : 'Recovery' },
            { id: 'medications', label: language === 'es' ? 'Medicamentos' : 'Meds' },
            { id: 'labs', label: language === 'es' ? 'Laboratorios' : 'Labs' },
            { id: 'quotes', label: language === 'es' ? 'Presupuesto' : 'Quotes' },
            { id: 'files', label: language === 'es' ? 'PDFs' : 'PDFs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#0373bb] text-white'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Dashboard Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Header Title Section with Live Financial Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight font-serif">
                {language === 'es' ? 'Panel de Atención Médica del Paciente' : 'Patient Care Dashboard'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {language === 'es' ? 'Aprobado Quirúrgicamente' : 'Cleared for Surgery'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                {patientRecord?.paymentStatus === 'paid_in_full' 
                  ? (language === 'es' ? '✓ Pagado Completo ($' + (patientRecord?.paidAmount || 5800) + ' USD)' : '✓ Paid in Full ($' + (patientRecord?.paidAmount || 5800) + ' USD)')
                  : (language === 'es' ? 'Saldo Pagado: $' + (patientRecord?.paidAmount || 0) + ' USD' : 'Paid to date: $' + (patientRecord?.paidAmount || 0) + ' USD')}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'es' 
                ? 'Monitoreo de recuperación, signos vitales, expediente digital en Firestore y autorizaciones quirúrgicas.' 
                : 'Plastic surgery recovery tracking, vital sign monitoring, Firestore digital chart, and surgical clearance.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('files')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all border border-slate-200 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#0373bb]" />
              <span>{language === 'es' ? 'Subir Archivo PDF' : 'Upload Medical PDF'}</span>
            </button>
            <a
              href="https://wa.me/18299358121?text=Hola%20Dr.%20Victor%20Estrella,%20tengo%20una%20consulta%20sobre%20mi%20procedimiento."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{language === 'es' ? 'Coordinador Quirúrgico' : 'Surgical Coordinator'}</span>
            </a>
          </div>
        </div>

        {/* TAB 1: DASHBOARD (MAIN VIEW) */}
        {activeTab === 'dashboard' && (
          <>
            {/* Top 3 Cards Grid (Matching Hospital Image archetype) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Card 1: Vital Signs Trend */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#0373bb]" />
                      {language === 'es' ? 'Signos Vitales y Recuperación' : 'Vital Signs & Recovery'}
                    </h3>
                    <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {language === 'es' ? 'Sincronizado' : 'Live Firestore'}
                    </span>
                  </div>

                  {/* Chart Visual Simulation */}
                  <div className="h-32 w-full pt-2">
                    <div className="h-24 relative flex items-end">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 300 80">
                        <defs>
                          <linearGradient id="vitalGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0373bb" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#0373bb" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M 10 50 Q 50 30, 90 45 T 160 25 T 230 40 T 290 20"
                          fill="none"
                          stroke="#0373bb"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 10 65 Q 60 55, 120 60 T 200 50 T 290 45"
                          fill="none"
                          stroke="#0ea5e9"
                          strokeWidth="2"
                          strokeDasharray="4,4"
                        />
                        <circle cx="290" cy="20" r="4" fill="#0373bb" />
                      </svg>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1 mt-1 border-t border-slate-100 pt-1">
                      <span>9:00 AM</span>
                      <span>12:00 PM</span>
                      <span>4:00 PM</span>
                      <span>8:00 PM</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">{language === 'es' ? 'Presión Arterial' : 'Blood Pressure'}</span>
                    <span className="text-sm font-bold text-slate-800">{vitals.bloodPressureSys} / {vitals.bloodPressureDia} <span className="text-[10px] text-slate-400 font-normal">mmHg</span></span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">{language === 'es' ? 'Frecuencia Cardíaca' : 'Heart Rate'}</span>
                    <span className="text-sm font-bold text-slate-800">{vitals.heartRate} <span className="text-[10px] text-slate-400 font-normal">bpm</span></span>
                  </div>
                </div>
              </div>

              {/* Card 2: Post-Op Drainage & Swelling / Vital Tracking */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-500" />
                      {language === 'es' ? 'Control de Inflamación y Drenajes' : 'Drainage & Swelling Index'}
                    </h3>
                    <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {vitals.healingProgress || (language === 'es' ? 'Progreso Normal' : 'Optimal Healing')}
                    </span>
                  </div>

                  {/* Chart Visual Simulation */}
                  <div className="h-32 w-full pt-2">
                    <div className="h-24 relative flex items-end">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 300 80">
                        <path
                          d="M 10 30 Q 70 25, 130 35 T 210 15 T 290 28"
                          fill="none"
                          stroke="#0d9488"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 10 70 Q 70 65, 140 70 T 220 55 T 290 60"
                          fill="none"
                          stroke="#14b8a6"
                          strokeWidth="2"
                        />
                        <circle cx="290" cy="28" r="4" fill="#0d9488" />
                      </svg>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1 mt-1 border-t border-slate-100 pt-1">
                      <span>11:00 AM</span>
                      <span>12:00 PM</span>
                      <span>4:00 PM</span>
                      <span>80.5 °F</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">{language === 'es' ? 'Uso de Faja / Prenda' : 'Faja Garment'}</span>
                    <span className="text-sm font-bold text-teal-700">{vitals.fajaHours} / 24 <span className="text-[10px] text-slate-400 font-normal">hrs</span></span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">{language === 'es' ? 'Escala de Molestia' : 'Pain Score'}</span>
                    <span className="text-sm font-bold text-teal-700">{vitals.painScore} / 10 <span className="text-[10px] text-emerald-600 font-normal">({vitals.painScore <= 3 ? 'Leve' : 'Moderado'})</span></span>
                  </div>
                </div>
              </div>

              {/* Card 3: Lab Results */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-[#0373bb]" />
                    {language === 'es' ? 'Resultados de Laboratorio' : 'Lab Results & Clearances'}
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-500">Dr. Víctor Estrella</span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 my-auto">
                  {labs.slice(0, 3).map((lab) => (
                    <div key={lab.id} className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-3 text-center flex flex-col justify-between">
                      <span className="text-[11px] font-medium text-slate-500 block truncate">{lab.name}</span>
                      <span className="text-lg font-bold text-slate-900 my-1">{lab.value}</span>
                      <span className="text-[9px] text-slate-400 font-mono block mb-2">{lab.unit}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 capitalize">
                        {lab.status}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{language === 'es' ? 'Valoración Cardíaca / EKG:' : 'Cardiac & EKG Clearance:'}</span>
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {language === 'es' ? 'Aprobado ASA I' : 'Approved ASA I'}
                  </span>
                </div>
              </div>

            </div>

            {/* Middle Row: Medication Schedule Timeline (Left) & Upcoming Procedures (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Card 4: Medication Schedule */}
              <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Pill className="w-4 h-4 text-teal-600" />
                      {language === 'es' ? 'Cronograma de Medicamentos Quirúrgicos' : 'Medication Schedule'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {language === 'es' ? 'Haga clic para confirmar las dosis administradas en tiempo real.' : 'Click nodes to toggle taken doses and persist to Firestore.'}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                    {language === 'es' ? 'Protocolo Post-Quirúrgico Activo' : 'Active Surgical Protocol'}
                  </span>
                </div>

                {/* Horizontal Timeline Bar */}
                <div className="relative py-6 px-4">
                  <div className="absolute top-1/2 left-8 right-8 h-1 bg-teal-600 -translate-y-1/2 rounded-full"></div>
                  
                  <div className="relative z-10 flex justify-between">
                    {medications.map((med) => {
                      return (
                        <div 
                          key={med.id} 
                          onClick={() => handleToggleMedication(med.id)}
                          className="flex flex-col items-center text-center cursor-pointer group"
                        >
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all shadow-xs ${
                            med.isDone 
                              ? 'bg-teal-600 text-white ring-4 ring-teal-100' 
                              : 'bg-white text-slate-400 border-2 border-teal-600 hover:scale-110'
                          }`}>
                            {med.isDone ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                          </div>
                          <span className="text-xs font-bold text-slate-900 mt-3">{med.time}</span>
                          <span className="text-[11px] font-semibold text-teal-800 max-w-[100px] truncate">{med.name}</span>
                          <span className="text-[9px] text-slate-400 hidden sm:block">{med.desc}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Post-Op Instructions Banner */}
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                  <span>{language === 'es' ? 'ℹ️ Recuerde tomar los medicamentos con alimentos para proteger su estómago.' : 'ℹ️ Remember to take oral medications with food to prevent gastric discomfort.'}</span>
                  <button 
                    onClick={() => setActiveTab('medications')}
                    className="font-bold text-[#0373bb] hover:underline shrink-0 ml-2 cursor-pointer"
                  >
                    {language === 'es' ? 'Ver prospecto completo →' : 'View Full Details →'}
                  </button>
                </div>
              </div>

              {/* Card 5: Upcoming Procedures & Milestones (Calendar & Booking info) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#0373bb]" />
                      {language === 'es' ? 'Próximos Procedimientos y Citas' : 'Upcoming Procedures & Calendar'}
                    </h3>
                    <span className="text-[11px] font-semibold text-slate-500">2026</span>
                  </div>

                  <div className="space-y-2.5">
                    {appointments.map((proc) => (
                      <div
                        key={proc.id}
                        onClick={() => handleToggleAppointment(proc.id)}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                          proc.highlight 
                            ? 'bg-[#0373bb]/5 border-[#0373bb]/30 ring-1 ring-[#0373bb]/20' 
                            : proc.completed 
                            ? 'bg-slate-50 border-slate-200/60 text-slate-500' 
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`shrink-0 ${proc.completed ? 'text-teal-600' : proc.highlight ? 'text-[#0373bb]' : 'text-slate-300'}`}>
                            {proc.completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                          </div>
                          <div>
                            <span className={`text-xs font-bold block ${proc.highlight ? 'text-[#0373bb]' : proc.completed ? 'text-slate-600 line-through' : 'text-slate-800'}`}>
                              {proc.title}
                            </span>
                            <span className="text-[10px] text-slate-400">{proc.time} {proc.location ? `• ${proc.location}` : ''}</span>
                          </div>
                        </div>

                        <span className="text-xs font-mono font-bold text-slate-600 shrink-0 ml-2">
                          {proc.date}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => onOpenConsultation?.()}
                  className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors text-center cursor-pointer"
                >
                  {language === 'es' ? '+ Agendar Nueva Cita / Seguimiento' : '+ Schedule Follow-up Appointment'}
                </button>
              </div>

            </div>

            {/* Card 6: Safety Advisory */}
            <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {language === 'es' 
                      ? 'Aviso Clínico Post-Quirúrgico y Cuidados Especiales' 
                      : 'Clinical Care Advisory & Safety Protocol'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {language === 'es'
                      ? 'Su recuperación avanza de forma satisfactoria. Mantenga la hidratación (>2.5L diarios) y evite levantar peso (>10 lbs).'
                      : 'Patient is in optimal healing phase. Ensure Stage 1 compression garment is worn continuously and maintain 2.5L daily hydration.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="tel:+18299358121"
                  className="px-3.5 py-2 bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{language === 'es' ? 'Línea de Urgencia 24/7' : '24/7 Medical Hotline'}</span>
                </a>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: RECOVERY */}
        {activeTab === 'recovery' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500" />
                  {language === 'es' ? 'Bitácora y Monitoreo de Recuperación' : 'Recovery Tracking & Vital Monitoring'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {language === 'es' ? 'Registro permanente guardado en Firestore vinculado a su ID de paciente.' : 'Persistent medical records saved to Firestore linked to your patient ID.'}
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold">
                {language === 'es' ? 'Fase: Post-Op Día 8' : 'Phase: Post-Op Day 8'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                <span className="text-xs text-slate-500 block mb-1">{language === 'es' ? 'Presión Arterial' : 'Blood Pressure'}</span>
                <span className="text-xl font-bold text-slate-900">{vitals.bloodPressureSys}/{vitals.bloodPressureDia}</span>
                <span className="text-[10px] text-slate-400 block mt-1">mmHg</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                <span className="text-xs text-slate-500 block mb-1">{language === 'es' ? 'Frecuencia Cardíaca' : 'Heart Rate'}</span>
                <span className="text-xl font-bold text-slate-900">{vitals.heartRate}</span>
                <span className="text-[10px] text-slate-400 block mt-1">bpm</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                <span className="text-xs text-slate-500 block mb-1">{language === 'es' ? 'Horas de Faja' : 'Faja Compliance'}</span>
                <span className="text-xl font-bold text-teal-700">{vitals.fajaHours} / 24</span>
                <span className="text-[10px] text-emerald-600 block mt-1">Óptimo</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                <span className="text-xs text-slate-500 block mb-1">{language === 'es' ? 'Escala de Dolor' : 'Pain Score'}</span>
                <span className="text-xl font-bold text-teal-700">{vitals.painScore} / 10</span>
                <span className="text-[10px] text-emerald-600 block mt-1">Controlado</span>
              </div>
            </div>

            {/* Surgical Notes */}
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100">
              <h4 className="text-xs font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-[#0373bb]" />
                {language === 'es' ? 'Notas Clínicas de Evolución (Dr. Víctor Estrella)' : 'Clinical Evolution Notes (Dr. Víctor Estrella)'}
              </h4>
              <p className="text-xs text-blue-800 leading-relaxed">
                {patientRecord?.surgicalNotes || (language === 'es' ? 'Paciente evoluciona favorablemente. Tejidos blandos con adecuada retracción y sin presencia de hematomas ni seromas. Continuar uso estricto de prenda compresiva y masajes de drenaje.' : 'Patient progressing smoothly. Adequate soft tissue retraction with no seroma or hematoma present. Continue full compression garment.')}
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: MEDICATIONS */}
        {activeTab === 'medications' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Pill className="w-5 h-5 text-teal-600" />
                  {language === 'es' ? 'Prescripción Médica Post-Quirúrgica' : 'Post-Op Surgical Prescription'}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'es' ? 'Actualice las tomas haciendo clic en cada medicamento para sincronizar con su historial clínico.' : 'Click to toggle doses and save in real-time to your patient database.'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {medications.map((med) => (
                <div
                  key={med.id}
                  onClick={() => handleToggleMedication(med.id)}
                  className={`p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                    med.isDone 
                      ? 'bg-teal-50/50 border-teal-200' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      med.isDone ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {med.isDone ? <Check className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold ${med.isDone ? 'text-teal-900' : 'text-slate-900'}`}>{med.name}</h4>
                      <p className="text-xs text-slate-500">{med.desc} • {med.dosage || 'Dosis indicada'}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-700 block">{med.time}</span>
                    <span className={`text-[10px] font-bold uppercase ${med.isDone ? 'text-teal-700' : 'text-amber-600'}`}>
                      {med.isDone ? (language === 'es' ? 'Administrado' : 'Taken') : (language === 'es' ? 'Pendiente' : 'Pending')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: LABS */}
        {activeTab === 'labs' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-[#0373bb]" />
                  {language === 'es' ? 'Panel de Laboratorios y Autorizaciones Médicas' : 'Lab Results & Surgical Clearances'}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'es' ? 'Resultados validados por el equipo médico del Dr. Víctor Estrella.' : 'Validated laboratory panel and pre-operative cardiac evaluations.'}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedCategory('lab_results');
                  setActiveTab('files');
                }}
                className="px-3.5 py-2 bg-[#0373bb] text-white hover:bg-[#025a94] text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{language === 'es' ? 'Subir Nuevos Laboratorios PDF' : 'Upload Lab PDF'}</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="p-3">{language === 'es' ? 'Examen / Panel' : 'Test / Panel'}</th>
                    <th className="p-3">{language === 'es' ? 'Resultado' : 'Value'}</th>
                    <th className="p-3">{language === 'es' ? 'Unidad' : 'Unit'}</th>
                    <th className="p-3">{language === 'es' ? 'Rango / Estado' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {labs.map((lab) => (
                    <tr key={lab.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-semibold text-slate-900">{lab.name}</td>
                      <td className="p-3 font-mono font-bold text-slate-800">{lab.value}</td>
                      <td className="p-3 text-slate-500 font-mono">{lab.unit}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 capitalize">
                          {lab.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: QUOTES & FINANCIAL RECORDS */}
        {activeTab === 'quotes' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  {language === 'es' ? 'Presupuesto Quirúrgico y Registro de Pagos' : 'Surgical Quote & Payment Records'}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'es' ? 'Estado financiero oficial emitido por la clínica del Dr. Víctor Estrella.' : 'Official financial and quotation summary linked to your record.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                  {patientRecord?.paymentStatus === 'paid_in_full' 
                    ? (language === 'es' ? '✓ Pagado Completo ($5,800 USD)' : '✓ Paid in Full ($5,800 USD)') 
                    : (language === 'es' ? `Pagado: $${patientRecord?.paidAmount || 0} USD` : `Paid: $${patientRecord?.paidAmount || 0} USD`)}
                </span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div>
                  <span className="text-xs font-mono text-[#0373bb] font-bold">#ESTRELLA-QT-2026</span>
                  <h4 className="text-sm font-bold text-slate-900">{patientRecord?.procedure || 'Lipoescultura HD 360° + Marcación Abdominal + BBL'}</h4>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-slate-900">${patientRecord?.totalAmount || 5800} USD</span>
                  <span className="text-[10px] text-emerald-600 block font-bold">
                    {language === 'es' ? 'Monto Pagado: $' + (patientRecord?.paidAmount || 5800) + ' USD' : 'Amount Paid: $' + (patientRecord?.paidAmount || 5800) + ' USD'}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1.5">
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{language === 'es' ? 'Honorarios quirúrgicos de Dr. Víctor Estrella y equipo especializado.' : 'Surgical fees for Dr. Víctor Estrella and surgical team.'}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{language === 'es' ? 'Derecho a quirófano y hospitalización en CECIP Center.' : 'Operating room rights & overnight recovery stay at CECIP.'}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{language === 'es' ? 'Valoración pre-anestésica y anestesiólogo certificado.' : 'Pre-anesthesia evaluation & board-certified anesthesiologist.'}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{language === 'es' ? 'Faja post-quirúrgica etapa 1 y medicamentos iniciales incluidos.' : 'Stage 1 compression garment & initial post-op medications.'}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{language === 'es' ? 'Imprimir Recibo / Presupuesto PDF' : 'Download / Print Receipt PDF'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: MEDICAL FILES & PDF STORAGE (STORED IN FIRESTORE DIRECTLY) */}
        {activeTab === 'files' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#0373bb]" />
                  {language === 'es' ? 'Expediente Digital y Documentos PDF' : 'Digital Medical PDFs & Clinical Files'}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'es' 
                    ? 'Suba y consulte sus consentimientos, resultados de laboratorio y presupuestos guardados de forma permanente en Firestore.' 
                    : 'Upload and view consents, lab panels, and quotes stored directly & permanently in Firestore.'}
                </p>
              </div>
            </div>

            {/* Upload Feedback */}
            {uploadError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{uploadError}</span>
              </div>
            )}
            {uploadSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            {/* PDF Upload Card */}
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 border-dashed space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-[#0373bb]" />
                {language === 'es' ? 'Subir Nuevo Documento o PDF' : 'Upload New PDF / Medical Record'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'es' ? 'Categoría del Archivo' : 'File Category'}
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#0373bb]/20 focus:border-[#0373bb]"
                  >
                    <option value="pdf_records">{language === 'es' ? 'Expediente Médico / Consentimiento' : 'Medical PDF / Consent'}</option>
                    <option value="lab_results">{language === 'es' ? 'Resultados de Laboratorio' : 'Lab Results'}</option>
                    <option value="surgical_clearance">{language === 'es' ? 'Autorización Quirúrgica / EKG' : 'Surgical Clearance / EKG'}</option>
                    <option value="quote">{language === 'es' ? 'Presupuesto / Cotización' : 'Surgical Quote'}</option>
                    <option value="id_insurance">{language === 'es' ? 'Identificación / Seguro' : 'ID / Insurance'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'es' ? 'Notas / Observaciones (Opcional)' : 'Notes / Description (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={fileNotes}
                    onChange={(e) => setFileNotes(e.target.value)}
                    placeholder={language === 'es' ? 'Ej. Análisis de sangre marzo 2026' : 'e.g. Blood panel March 2026'}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#0373bb]/20 focus:border-[#0373bb]"
                  />
                </div>
              </div>

              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,application/pdf,image/png,image/jpeg"
                  className="hidden"
                  id="pdfFileInput"
                />
                <label
                  htmlFor="pdfFileInput"
                  className={`w-full py-4 px-4 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl flex items-center justify-center gap-3 cursor-pointer transition-all ${
                    isUploading ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  <Upload className="w-5 h-5 text-[#0373bb]" />
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-800 block">
                      {isUploading 
                        ? (language === 'es' ? 'Subiendo y guardando en Firestore...' : 'Storing Base64 PDF in Firestore...')
                        : (language === 'es' ? 'Haga clic para seleccionar archivo PDF' : 'Click to select PDF document')}
                    </span>
                    <span className="text-[10px] text-slate-400">PDF, PNG, JPG (máx. 800 KB para almacenamiento en Firestore)</span>
                  </div>
                </label>
              </div>
            </div>

            {/* List of Uploaded Documents */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {language === 'es' ? 'Documentos Guardados en su Expediente' : 'Stored Files in Your Record'} ({files.length})
              </h4>

              {files.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/60 text-slate-500 text-xs">
                  {language === 'es' ? 'Aún no tiene documentos PDF subidos.' : 'No PDF documents uploaded yet.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {files.map((file) => (
                    <div 
                      key={file.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 flex items-start justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-slate-900 truncate" title={file.name}>
                            {file.name}
                          </h5>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {file.uploadDate} • {Math.round(file.size / 1024)} KB • <span className="capitalize">{file.category.replace('_', ' ')}</span>
                          </span>
                          {file.notes && (
                            <p className="text-[11px] text-slate-600 mt-1 italic line-clamp-1">{file.notes}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleDownloadFile(file)}
                          title={language === 'es' ? 'Descargar / Abrir PDF' : 'Download / Open PDF'}
                          className="p-1.5 text-slate-500 hover:text-[#0373bb] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          title={language === 'es' ? 'Eliminar' : 'Delete'}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
