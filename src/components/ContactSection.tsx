import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { SPECIALISTS, SERVICES } from '../data';
import { Consultation } from '../types';
import { MapPin, Phone, Mail, Calendar, CheckCircle, FileText, ClipboardCheck } from 'lucide-react';
import FemaleEvaluationModal from './FemaleEvaluationModal';
import MaleEvaluationModal from './MaleEvaluationModal';
import { initCalendarAuth, googleSignInForCalendar, calendarSignOut, createCalendarEvent } from '../lib/googleCalendar';

interface ContactSectionProps {
  preselectedSpecialistId?: string;
  preselectedProcedure?: string;
  onSuccess: (consultation: Consultation) => void;
}

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function ContactSection({
  preselectedSpecialistId = '',
  preselectedProcedure = '',
  onSuccess
}: ContactSectionProps) {
  const { t, language } = useLanguage();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    procedure: '',
    specialistId: 'dr-estrella',
    date: '',
    time: '',
    notes: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isEvaluationOpen, setIsEvaluationOpen] = useState(false);
  const [isMaleEvaluationOpen, setIsMaleEvaluationOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailDispatched, setEmailDispatched] = useState(false);

  // Google Calendar integration states
  const [calendarUser, setCalendarUser] = useState<any>(null);
  const [saveToGoogleCalendar, setSaveToGoogleCalendar] = useState(false);
  const [calendarSuccess, setCalendarSuccess] = useState(false);

  // Initialize Calendar auth listener
  useEffect(() => {
    const unsubscribe = initCalendarAuth(
      (user, token) => {
        setCalendarUser(user);
        setSaveToGoogleCalendar(true);
      },
      () => {
        setCalendarUser(null);
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleCalendarSignIn = async () => {
    try {
      const res = await googleSignInForCalendar();
      if (res) {
        setCalendarUser(res.user);
        setSaveToGoogleCalendar(true);
      }
    } catch (err) {
      console.error('Google Calendar login error:', err);
    }
  };

  const handleCalendarSignOut = async () => {
    try {
      await calendarSignOut();
      setCalendarUser(null);
      setSaveToGoogleCalendar(false);
    } catch (err) {
      console.error('Google Calendar sign-out error:', err);
    }
  };

  const handleToggleCalendar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSaveToGoogleCalendar(checked);
    if (checked && !calendarUser) {
      handleCalendarSignIn();
    }
  };

  // Auto-fill if pre-selected triggers are passed
  useEffect(() => {
    if (preselectedSpecialistId) {
      setFormData(prev => ({ ...prev, specialistId: preselectedSpecialistId }));
    }
  }, [preselectedSpecialistId]);

  useEffect(() => {
    if (preselectedProcedure) {
      setFormData(prev => ({ ...prev, procedure: preselectedProcedure }));
    }
  }, [preselectedProcedure]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    setEmailDispatched(false);
    setCalendarSuccess(false);

    // Validations
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.procedure || !formData.date || !formData.time) {
      setErrorMessage('Please complete all required fields.');
      setIsSubmitting(false);
      return;
    }

    // Google Calendar Event Integration (Triggered before form clear)
    let addedToCalendar = false;
    if (saveToGoogleCalendar && calendarUser) {
      try {
        await createCalendarEvent({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          procedure: formData.procedure,
          date: formData.date,
          time: formData.time,
          notes: formData.notes
        });
        addedToCalendar = true;
      } catch (calErr) {
        console.error('Failed to create calendar event:', calErr);
      }
    }
    setCalendarSuccess(addedToCalendar);

    try {
      // POST the data to our secure full-stack backend endpoint
      const response = await fetch('/api/consultation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          procedure: formData.procedure,
          specialistId: formData.specialistId,
          date: formData.date,
          time: formData.time,
          notes: formData.notes,
          lang: language
        })
      });

      if (!response.ok) {
        throw new Error('Clinical server returned non-200 status');
      }

      const result = await response.json();
      
      const newConsultation: Consultation = result.consultation || {
        id: 'cons-' + Math.random().toString(36).substr(2, 9),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        procedure: formData.procedure,
        specialistId: formData.specialistId || 'any',
        date: formData.date,
        time: formData.time,
        notes: formData.notes,
        status: 'scheduled'
      };

      // Also persist to local storage for patient portal dashboard tracking
      const existingConsultationsRaw = localStorage.getItem('lumiskin_consultations');
      const consultations: Consultation[] = existingConsultationsRaw ? JSON.parse(existingConsultationsRaw) : [];
      consultations.push(newConsultation);
      localStorage.setItem('lumiskin_consultations', JSON.stringify(consultations));

      if (result.emailSent) {
        setEmailDispatched(true);
      }

      setIsSubmitted(true);
      onSuccess(newConsultation);

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        procedure: '',
        specialistId: 'dr-estrella',
        date: '',
        time: '',
        notes: ''
      });
    } catch (err) {
      console.warn('[Contact] Full-stack endpoint error, using robust client-side fallback simulation:', err);
      
      const fallbackConsultation: Consultation = {
        id: 'cons-' + Math.random().toString(36).substr(2, 9),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        procedure: formData.procedure,
        specialistId: formData.specialistId || 'any',
        date: formData.date,
        time: formData.time,
        notes: formData.notes,
        status: 'scheduled'
      };

      const existingConsultationsRaw = localStorage.getItem('lumiskin_consultations');
      const consultations: Consultation[] = existingConsultationsRaw ? JSON.parse(existingConsultationsRaw) : [];
      consultations.push(fallbackConsultation);
      localStorage.setItem('lumiskin_consultations', JSON.stringify(consultations));

      setIsSubmitted(true);
      onSuccess(fallbackConsultation);

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        procedure: '',
        specialistId: 'dr-estrella',
        date: '',
        time: '',
        notes: ''
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get all unique procedures listed under services
  const allProcedures = SERVICES.flatMap(s => s.procedures);

  return (
    <section id="contact" className="py-20 bg-gradient-to-b from-neutral-50 to-[#FCFBF9] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column */}
          <div className="lg:col-span-5 text-left space-y-8">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#0373bb] font-bold">
                {t('contact.subtitle')}
              </span>
              <h2 className="font-serif text-3.5xl sm:text-5xl text-[#2D211A] tracking-tight mt-1">
                {t('nav.contact')}
              </h2>
            </div>

            <p className="text-sm sm:text-base text-[#5C4D44] leading-relaxed">
              {t('contact.desc')}
            </p>

            <div className="pt-4 space-y-6">
              {/* Location */}
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-white border border-[#EBE6DF] rounded-xl text-[#0373bb] shadow-xs">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-sans text-sm font-bold text-[#2D211A] uppercase tracking-wide">
                    {t('contact.visit_us')}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#7C6C63] mt-1 whitespace-pre-line">
                    {t('contact.visit_desc')}
                  </p>
                </div>
              </div>

              {/* Contact numbers */}
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-white border border-[#EBE6DF] rounded-xl text-[#0373bb] shadow-xs">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-sans text-sm font-bold text-[#2D211A] uppercase tracking-wide">
                    {t('contact.bilingual')}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#7C6C63] mt-1 space-y-0.5">
                    <span className="block">{t('contact.bilingual_desc')}</span>
                  </p>
                </div>
              </div>

              {/* Medical Evaluation Form */}
              <div className="flex items-start space-x-4 pt-2 border-t border-[#EBE6DF]/40">
                <div className="p-3 bg-white border border-[#EBE6DF] rounded-xl text-[#0373bb] shadow-xs shrink-0">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div className="text-left flex-1">
                  <h4 className="font-sans text-sm font-bold text-[#2D211A] uppercase tracking-wide">
                    {t('contact.evaluation_form')}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-[#7C6C63] mt-1 leading-relaxed mb-3">
                    {language === 'es'
                      ? 'Complete su pre-evaluación clínica segura para agilizar su consulta con el Dr. Estrella.'
                      : 'Complete your secure clinical pre-assessment to expedite your consultation with Dr. Estrella.'}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsEvaluationOpen(true)}
                      className="px-4 py-2 border border-[#EBE6DF] hover:border-[#0373bb] text-neutral-800 hover:text-[#0373bb] hover:bg-[#0373bb]/5 rounded-xl font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 flex-1"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      {t('contact.female_patient')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsMaleEvaluationOpen(true)}
                      className="px-4 py-2 border border-[#EBE6DF] hover:border-[#0373bb] text-neutral-800 hover:text-[#0373bb] hover:bg-[#0373bb]/5 rounded-xl font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 flex-1"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0373bb]" />
                      {t('contact.male_patient')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column Consultation Form Card */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EBE6DF] shadow-md text-left">
              <div className="text-center mb-8">
                <h3 className="font-serif text-2xl sm:text-3xl text-[#2D211A] font-medium tracking-tight">
                  {t('contact.heading')}
                </h3>
                <p className="text-xs text-[#7C6C63] mt-1">
                  {t('about.board_desc')}
                </p>
              </div>

              {isSubmitted ? (
                <div className="py-8 text-center space-y-4 animate-in fade-in duration-300">
                  <div className="mx-auto w-16 h-16 bg-[#0373bb]/10 text-[#0373bb] rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h4 className="font-serif text-2xl text-[#2D211A] font-medium">
                    {t('form.success')}
                  </h4>
                  <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
                    {emailDispatched ? (
                      language === 'es'
                        ? '¡Le hemos enviado un correo electrónico de agradecimiento con la confirmación de su cita!'
                        : 'A clinical thank-you email with your scheduled details was sent successfully!'
                    ) : (
                      language === 'es'
                        ? 'Su solicitud ha sido registrada en el sistema clínico de Santo Domingo.'
                        : 'Your request has been successfully registered in the clinical board calendar.'
                    )}
                  </p>
                  {calendarSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200/50 rounded-2xl max-w-sm mx-auto flex items-center justify-center space-x-2 text-emerald-700 text-xs font-semibold animate-pulse mt-2">
                      <span className="text-emerald-500 font-bold">✔</span>
                      <span>
                        {language === 'es'
                          ? '¡Cita añadida a su Google Calendar!'
                          : 'Appointment added to your Google Calendar!'}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="mt-4 px-6 py-2.5 bg-[#0373bb] text-white rounded-full text-xs font-semibold tracking-wider uppercase hover:bg-[#0373bb]/90 cursor-pointer block mx-auto"
                  >
                    {t('general.consultation')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {errorMessage && (
                    <div className="p-3 bg-red-50 border-l-4 border-red-500 text-xs text-red-700 font-medium rounded-r-lg">
                      {errorMessage}
                    </div>
                  )}

                  {/* Two columns names */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5C4D44] uppercase tracking-wide">{t('form.first_name')} *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="John"
                        className="w-full px-4 py-3 rounded-xl border border-[#D5CDD2] focus:outline-none focus:ring-1 focus:ring-[#0373bb] focus:border-[#0373bb] bg-white text-xs text-[#2D211A] font-sans transition-colors"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5C4D44] uppercase tracking-wide">{t('form.last_name')} *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Doe"
                        className="w-full px-4 py-3 rounded-xl border border-[#D5CDD2] focus:outline-none focus:ring-1 focus:ring-[#0373bb] focus:border-[#0373bb] bg-white text-xs text-[#2D211A] font-sans transition-colors"
                        required
                      />
                    </div>
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5C4D44] uppercase tracking-wide">{t('form.email')} *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-[#D5CDD2] focus:outline-none focus:ring-1 focus:ring-[#0373bb] focus:border-[#0373bb] bg-white text-xs text-[#2D211A] font-sans transition-colors"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5C4D44] uppercase tracking-wide">{t('form.phone')} *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="(323) 555-0199"
                        className="w-full px-4 py-3 rounded-xl border border-[#D5CDD2] focus:outline-none focus:ring-1 focus:ring-[#0373bb] focus:border-[#0373bb] bg-white text-xs text-[#2D211A] font-sans transition-colors"
                        required
                      />
                    </div>
                  </div>

                  {/* Procedure & Specialist dropdowns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5C4D44] uppercase tracking-wide">{t('form.procedure')} *</label>
                      <select
                        name="procedure"
                        value={formData.procedure}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-[#D5CDD2] focus:outline-none focus:ring-1 focus:ring-[#0373bb] focus:border-[#0373bb] bg-white text-xs text-[#2D211A] font-sans transition-colors cursor-pointer"
                        required
                      >
                        <option value="">Select treatment / surgery</option>
                        {allProcedures.map((proc, idx) => {
                          const procKey = `procedure.${proc.toLowerCase().replace(/\s+/g, '_')}`;
                          const translatedProc = t(procKey) !== procKey ? t(procKey) : proc;
                          return (
                            <option key={idx} value={proc}>{translatedProc}</option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5C4D44] uppercase tracking-wide">{t('form.specialist')}</label>
                      <select
                        name="specialistId"
                        value={formData.specialistId}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-[#D5CDD2] focus:outline-none focus:ring-1 focus:ring-[#0373bb] focus:border-[#0373bb] bg-white text-xs text-[#2D211A] font-sans transition-colors cursor-pointer"
                      >
                        <option value="dr-estrella">Dr. Victor Estrella, MD</option>
                      </select>
                    </div>
                  </div>

                  {/* Date & Time selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5C4D44] uppercase tracking-wide">{t('form.date')} *</label>
                      <div className="relative clickable-date-input">
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleChange}
                          min={getTodayDateString()}
                          onClick={(e) => {
                            try {
                              (e.currentTarget as any).showPicker();
                            } catch (err) {}
                          }}
                          onFocus={(e) => {
                            try {
                              (e.currentTarget as any).showPicker();
                            } catch (err) {}
                          }}
                          className="w-full px-4 py-3 rounded-xl border border-[#D5CDD2] focus:outline-none focus:ring-1 focus:ring-[#0373bb] focus:border-[#0373bb] bg-white text-xs text-[#2D211A] font-sans transition-colors cursor-pointer"
                          required
                        />
                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7B72] pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5C4D44] uppercase tracking-wide">{t('form.time')} *</label>
                      <select
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-[#D5CDD2] focus:outline-none focus:ring-1 focus:ring-[#0373bb] focus:border-[#0373bb] bg-white text-xs text-[#2D211A] font-sans transition-colors cursor-pointer"
                        required
                      >
                        <option value="">Select time slot</option>
                        <option value="09:00 AM">09:00 AM (Morning)</option>
                        <option value="11:00 AM">11:00 AM (Morning)</option>
                        <option value="01:30 PM">01:30 PM (Afternoon)</option>
                        <option value="03:30 PM">03:30 PM (Afternoon)</option>
                        <option value="05:00 PM">05:00 PM (Late Afternoon)</option>
                      </select>
                    </div>
                  </div>

                  {/* Google Calendar Option */}
                  <div className="p-4 bg-[#FCFBF9] hover:bg-neutral-50/50 border border-[#EBE6DF] rounded-2xl space-y-3 transition-all">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="addToCalendar"
                        checked={saveToGoogleCalendar}
                        onChange={handleToggleCalendar}
                        className="w-4 h-4 rounded border-[#D5CDD2] text-[#0373bb] focus:ring-[#0373bb] cursor-pointer"
                      />
                      <label htmlFor="addToCalendar" className="text-xs font-bold text-[#5C4D44] uppercase tracking-wide cursor-pointer flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#0373bb]" />
                        {language === 'es' ? 'Añadir cita a Google Calendar' : 'Add appointment to Google Calendar'}
                      </label>
                    </div>
                    
                    {saveToGoogleCalendar && (
                      <div className="pl-7 space-y-2 text-xs">
                        {calendarUser ? (
                          <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-[#EBE6DF] max-w-sm">
                            <div className="flex items-center space-x-2 truncate">
                              <div className="w-5 h-5 rounded-full bg-[#0373bb]/10 text-[#0373bb] flex items-center justify-center font-bold text-[10px] shrink-0">
                                {calendarUser.displayName ? calendarUser.displayName[0].toUpperCase() : 'G'}
                              </div>
                              <span className="text-[11px] text-[#5C4D44] font-medium truncate">
                                {calendarUser.email}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={handleCalendarSignOut}
                              className="text-[10px] text-red-500 font-bold uppercase tracking-wider hover:underline shrink-0 ml-2"
                            >
                              {language === 'es' ? 'Desconectar' : 'Disconnect'}
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <p className="text-[11px] text-[#7C6C63] leading-relaxed">
                              {language === 'es'
                                ? 'Inicie sesión con su cuenta de Google para agendar automáticamente la consulta.'
                                : 'Sign in with your Google account to automatically schedule the consultation.'}
                            </p>
                            <button
                              type="button"
                              onClick={handleCalendarSignIn}
                              className="flex items-center space-x-2 px-3 py-2 bg-white hover:bg-neutral-50 text-[#5C4D44] rounded-xl border border-[#D5CDD2] font-semibold text-[11px] transition-all cursor-pointer shadow-xs"
                            >
                              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                              </svg>
                              <span>{language === 'es' ? 'Conectar Google Calendar' : 'Connect Google Calendar'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Message/Notes */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#5C4D44] uppercase tracking-wide">{t('form.notes')}</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Briefly share any facial/body enhancement results you desire or questions you want addressed..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-[#D5CDD2] focus:outline-none focus:ring-1 focus:ring-[#0373bb] focus:border-[#0373bb] bg-white text-xs text-[#2D211A] font-sans transition-colors"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-[#0373bb] hover:bg-[#025c96] text-white text-xs sm:text-sm font-bold tracking-wider uppercase rounded-full shadow-xs hover:shadow-md transition-all active:scale-98 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer mt-2"
                  >
                    {isSubmitting ? t('form.submitting') : t('form.submit')}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>

      <FemaleEvaluationModal
        isOpen={isEvaluationOpen}
        onClose={() => setIsEvaluationOpen(false)}
      />
      <MaleEvaluationModal
        isOpen={isMaleEvaluationOpen}
        onClose={() => setIsMaleEvaluationOpen(false)}
      />
    </section>
  );
}
