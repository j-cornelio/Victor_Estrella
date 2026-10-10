import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  User, 
  ChevronRight, 
  RefreshCw, 
  Maximize2, 
  Minimize2, 
  Phone, 
  ExternalLink, 
  ShieldCheck, 
  Scale, 
  Heart, 
  Info,
  Check,
  AlertCircle
} from 'lucide-react';
import { OFFICIAL_PRICE_LIST, PRICING_CONDITIONS } from '../data';
import { createConsultation, saveCrmLead } from '../lib/firestoreService';
import { getGoogleCalendarUrl } from '../lib/calendarUtils';
import { useLanguage } from '../context/LanguageContext';
import { ChatMessage, ChatEvaluationResult, Consultation, ProcedurePricingItem } from '../types';

interface AIAestheticChatbotProps {
  isOpenExternal?: boolean;
  onCloseExternal?: () => void;
  onOpenConsultationDirect?: (procedureName?: string) => void;
}

export default function AIAestheticChatbot({
  isOpenExternal,
  onCloseExternal,
  onOpenConsultationDirect
}: AIAestheticChatbotProps) {
  const { language } = useLanguage();
  const isSpanish = language === 'es';

  // Modal open & minimize states
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showWelcomeBubble, setShowWelcomeBubble] = useState(true);

  // Sync with external triggers
  useEffect(() => {
    if (typeof isOpenExternal === 'boolean') {
      setIsOpen(isOpenExternal);
      if (isOpenExternal) {
        setIsMinimized(false);
        setShowWelcomeBubble(false);
      }
    }
  }, [isOpenExternal]);

  // Messages and conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // In-Chat Interactive Evaluation State
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [evalZone, setEvalZone] = useState('body');
  const [evalGoals, setEvalGoals] = useState<string[]>(['fat_reduction']);
  const [evalHeight, setEvalHeight] = useState<number>(165);
  const [evalWeight, setEvalWeight] = useState<number>(68);
  const [evalChildren, setEvalChildren] = useState<number>(0);
  const [evalTravel, setEvalTravel] = useState<boolean>(true);

  // In-Chat Interactive Booking State
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingProcedure, setBookingProcedure] = useState<string>('Liposucción 360° + BBL');
  const [bookingMode, setBookingMode] = useState<'virtual' | 'presencial'>('virtual');
  const [bookingDate, setBookingDate] = useState<string>('');
  const [bookingTime, setBookingTime] = useState<string>('10:00 AM');
  const [bookingName, setBookingName] = useState<string>('');
  const [bookingEmail, setBookingEmail] = useState<string>('');
  const [bookingPhone, setBookingPhone] = useState<string>('');
  const [bookingNotes, setBookingNotes] = useState<string>('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize welcome message
  useEffect(() => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 3);
    setBookingDate(defaultDate.toISOString().split('T')[0]);

    const initialGreeting: ChatMessage = {
      id: 'msg-welcome-1',
      role: 'assistant',
      content: isSpanish
        ? `¡Hola! Soy **Aura**, Asesora Clínica de Cirugía Plástica del **Dr. Víctor Estrella** en Santo Domingo (Miembro Titular SODOCIPRE).\n\nEstoy aquí para acompañarte paso a paso:\n• **Evaluar si eres candidata/o ideal** para tu procedimiento.\n• **Mostrarte precios y paquetes oficiales en USD** con gastos médicos incluidos.\n• **Orientarte sobre el viaje y recuperación** en República Dominicana.\n• **Agendar tu Consulta Médica** (Virtual o Presencial).\n\n¿Qué procedimiento o zona te gustaría mejorar?`
        : `Hello! I am **Aura**, Senior Clinical Consultation Assistant to **Dr. Víctor Estrella, MD** (Board-Certified Plastic Surgeon, SODOCIPRE, Santo Domingo).\n\nI am here to guide your aesthetic journey:\n• **Evaluate your surgical candidacy** based on your anatomical goals.\n• **Show you official USD prices** with all medical expenses included.\n• **Explain travel & recovery** for international patients in the Dominican Republic.\n• **Book your consultation** (Virtual Video or In-Person).\n\nWhat procedure or aesthetic area would you like to explore today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedProcedures: ['lipo_bbl', 'abdominoplastia_lipo360_bbl', 'mommy_makeover_implantes']
    };

    setMessages([initialGreeting]);
  }, [isSpanish]);

  // Scroll to bottom of message list on updates
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, showEvaluationForm, showBookingForm, isOpen, isMinimized]);

  // Handle sending a text query to /api/chat
  const handleSendMessage = async (customText?: string) => {
    const query = (customText || inputQuery).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputQuery('');
    setIsLoading(true);

    try {
      const payload = {
        messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
        lang: isSpanish ? 'es' : 'en',
        leadContext: {
          name: bookingName || undefined,
          email: bookingEmail || undefined,
          phone: bookingPhone || undefined,
          procedure: bookingProcedure || undefined
        }
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data && data.reply) {
        const assistantMsg: ChatMessage = {
          id: `msg_bot_${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedProcedures: data.suggestedProcedures || [],
          bookingTrigger: Boolean(data.bookingIntent),
          evaluationResult: data.evaluation || undefined
        };

        setMessages(prev => [...prev, assistantMsg]);

        if (data.bookingIntent) {
          setShowBookingForm(true);
        }
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err: any) {
      console.warn('Chat error, using clinical fallback:', err);
      // Fallback response
      const fallbackMsg: ChatMessage = {
        id: `msg_fallback_${Date.now()}`,
        role: 'assistant',
        content: isSpanish
          ? `El Dr. Víctor Estrella es especialista en contorno corporal de alta definición (Lipo 360 + BBL), Abdominoplastia y Mommy Makeover. Todos nuestros procedimientos incluyen gastos médicos completos en Santo Domingo. ¿Deseas que evaluemos tu caso o agendar una consulta virtual?`
          : `Dr. Víctor Estrella is a board-certified specialist in High-Definition Body Contouring (Lipo 360 + BBL), Tummy Tucks, and Mommy Makeovers. All our packages include full hospital & medical expenses in Santo Domingo. Would you like to evaluate your candidacy or book a virtual consultation?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedProcedures: ['lipo_bbl', 'abdominoplastia_lipo360_bbl', 'mommy_makeover_implantes'],
        bookingTrigger: true
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Run the in-chat aesthetic evaluation
  const handleRunEvaluation = async () => {
    setIsLoading(true);
    setShowEvaluationForm(false);

    const userSummary = isSpanish
      ? `He solicitado evaluar mi caso estético: Zona ${evalZone}, Objetivos: ${evalGoals.join(', ')}, Estatura: ${evalHeight}cm, Peso: ${evalWeight}kg, Hijos: ${evalChildren}, Viajo desde exterior: ${evalTravel ? 'Sí' : 'No'}.`
      : `I requested an aesthetic evaluation: Zone ${evalZone}, Goals: ${evalGoals.join(', ')}, Height: ${evalHeight}cm, Weight: ${evalWeight}kg, Children: ${evalChildren}, Travel from abroad: ${evalTravel ? 'Yes' : 'No'}.`;

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: userSummary,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await fetch('/api/chat/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zone: evalZone,
          goals: evalGoals,
          heightCm: evalHeight,
          weightKg: evalWeight,
          children: evalChildren,
          travel: evalTravel,
          lang: isSpanish ? 'es' : 'en'
        })
      });

      const data = await res.json();
      const evalData: ChatEvaluationResult = data.evaluation;

      const evalReply = isSpanish
        ? `✨ **Resultado de Evaluación Clínica Preliminar (Dr. Víctor Estrella):**\n\n• **Clasificación de Candidatura**: **${evalData.candidateLevel === 'ideal' ? 'Candidata/o Ideal' : 'Buena Candidatura (Sujeta a Laboratorios)'}**\n• **Índice de Masa Corporal (IMC)**: **${evalData.bmi}**\n• **Diagnóstico Anatómico**: ${evalData.rationale}\n• **Tiempo de Estancia Quirúrgica**: ${evalData.recoveryDays} días en Santo Domingo.\n• **Notas de Viaje**: ${evalData.travelNotes}\n\nA continuación puedes revisar los procedimientos recomendados y agendar tu consulta virtual para planificar tu fecha quirúrgica:`
        : `✨ **Preliminary Clinical Candidacy Assessment (Dr. Víctor Estrella):**\n\n• **Candidacy Status**: **${evalData.candidateLevel === 'ideal' ? 'Ideal Candidate' : 'Good Candidate (Pending Pre-op Labs)'}**\n• **Body Mass Index (BMI)**: **${evalData.bmi}**\n• **Clinical Rationale**: ${evalData.rationale}\n• **Recovery Stay**: ${evalData.recoveryDays} days in Santo Domingo.\n• **Travel Guidance**: ${evalData.travelNotes}\n\nReview your recommended procedures below and book your virtual consultation to reserve your surgical calendar:`;

      const botMsg: ChatMessage = {
        id: `msg_eval_${Date.now()}`,
        role: 'assistant',
        content: evalReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedProcedures: evalData.recommendedProcedureIds,
        evaluationResult: evalData,
        bookingTrigger: true
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('Error during evaluation request:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit in-chat appointment booking
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingName || !bookingEmail || !bookingPhone || !bookingDate) {
      alert(isSpanish ? 'Por favor completa todos los campos requeridos.' : 'Please fill in all required fields.');
      return;
    }

    setIsSubmittingBooking(true);

    try {
      // 1. Submit to server /api/consultation (triggers real email confirmation & Google Calendar link)
      const names = bookingName.trim().split(' ');
      const firstName = names[0] || 'Patient';
      const lastName = names.slice(1).join(' ') || 'Clinical';

      const consultationPayload = {
        firstName,
        lastName,
        email: bookingEmail.trim(),
        phone: bookingPhone.trim(),
        procedure: bookingProcedure,
        specialistId: 'dr-estrella',
        date: bookingDate,
        time: bookingTime,
        notes: `[Agendado vía Aura AI Chatbot] Modalidad: ${bookingMode.toUpperCase()}. ${bookingNotes || ''}`,
        lang: isSpanish ? 'es' : 'en'
      };

      const serverRes = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consultationPayload)
      });
      const serverData = await serverRes.json();

      // 2. Save into Firestore consultations and leads collection for instant CRM sync
      const firestoreConsId = await createConsultation({
        firstName,
        lastName,
        email: bookingEmail.trim(),
        phone: bookingPhone.trim(),
        procedure: bookingProcedure,
        specialistId: 'dr-estrella',
        date: bookingDate,
        time: bookingTime,
        notes: `[Aura Chatbot] ${bookingMode.toUpperCase()} - ${bookingNotes || 'Sin notas adicionales'}`,
        status: 'scheduled'
      });

      // Save CRM lead
      await saveCrmLead({
        id: `lead-${Date.now()}`,
        patientName: bookingName,
        email: bookingEmail,
        phone: bookingPhone,
        procedure: bookingProcedure,
        status: 'scheduled',
        riskCategory: 'low',
        dateCreated: new Date().toISOString().split('T')[0],
        appointmentDate: bookingDate,
        appointmentTime: bookingTime,
        estimatedValue: 5100,
        notes: `Agendado automáticamente desde Aura AI Chatbot. Modalidad: ${bookingMode}`,
        source: 'chatbot'
      });

      const confirmedConsultation: Consultation = {
        id: firestoreConsId || serverData.consultation?.id || `cons_${Date.now()}`,
        firstName,
        lastName,
        email: bookingEmail,
        phone: bookingPhone,
        procedure: bookingProcedure,
        specialistId: 'dr-estrella',
        date: bookingDate,
        time: bookingTime,
        notes: bookingNotes,
        status: 'scheduled'
      };

      // 3. Inject confirmation card in chat
      const confirmationMsg: ChatMessage = {
        id: `msg_confirmed_${Date.now()}`,
        role: 'assistant',
        content: isSpanish
          ? `🎉 **¡Tu solicitud de consulta ha sido registrada con éxito!**\n\nHemos enviado una confirmación formal a **${bookingEmail}** con tu invitación de calendario y detalles de preparación.\n\n• **Especialista**: Dr. Víctor Estrella, MD (Cirujano Plástico Acreditado)\n• **Procedimiento**: ${bookingProcedure}\n• **Fecha y Hora**: ${bookingDate} a las ${bookingTime}\n• **Modalidad**: ${bookingMode === 'virtual' ? 'Consulta Virtual (Videollamada)' : 'Consulta Presencial (Clínica Santo Domingo)'}`
          : `🎉 **Your consultation request has been successfully booked!**\n\nA confirmation email has been dispatched to **${bookingEmail}** along with your calendar invitation and pre-consultation guidelines.\n\n• **Specialist**: Dr. Víctor Estrella, MD (Board Certified)\n• **Procedure**: ${bookingProcedure}\n• **Date & Time**: ${bookingDate} at ${bookingTime}\n• **Type**: ${bookingMode === 'virtual' ? 'Virtual Video Consultation' : 'In-Person Consultation (Santo Domingo Clinic)'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        appointmentConfirmed: confirmedConsultation
      };

      setMessages(prev => [...prev, confirmationMsg]);
      setShowBookingForm(false);
    } catch (err) {
      console.error('Error submitting consultation:', err);
      alert(isSpanish ? 'Hubo un error al procesar tu cita. Por favor intenta de nuevo.' : 'Error booking consultation. Please try again.');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // Quick chip triggers
  const handleQuickPrompt = (type: 'pricing' | 'evaluation' | 'booking' | 'travel') => {
    if (type === 'pricing') {
      handleSendMessage(isSpanish ? '¿Cuáles son los precios oficiales de los procedimientos?' : 'What are the official prices of the procedures?');
    } else if (type === 'evaluation') {
      setShowEvaluationForm(true);
      setShowBookingForm(false);
    } else if (type === 'booking') {
      setShowBookingForm(true);
      setShowEvaluationForm(false);
    } else if (type === 'travel') {
      handleSendMessage(isSpanish ? '¿Cómo es el proceso de viaje y recuperación para pacientes internacionales?' : 'How does travel and recovery work for international patients?');
    }
  };

  // Helper to retrieve procedure pricing item details
  const getProcedureItem = (procId: string): ProcedurePricingItem | undefined => {
    return OFFICIAL_PRICE_LIST.find(p => p.id === procId);
  };

  // Reset conversation
  const handleRestartChat = () => {
    const greeting: ChatMessage = {
      id: `msg_restart_${Date.now()}`,
      role: 'assistant',
      content: isSpanish
        ? `Conversación reiniciada. ¿En qué procedimiento o evaluación puedo asistirte hoy?`
        : `Conversation restarted. How can I assist you with your aesthetic transformation today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedProcedures: ['lipo_bbl', 'abdominoplastia_lipo360_bbl', 'mommy_makeover_implantes']
    };
    setMessages([greeting]);
    setShowEvaluationForm(false);
    setShowBookingForm(false);
  };

  return (
    <>
      {/* Floating launcher trigger button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center space-x-3">
          {/* Welcome Speech Bubble */}
          {showWelcomeBubble && (
            <div className="relative hidden sm:flex items-center bg-[#2D211A] text-white text-xs py-2.5 px-4 rounded-2xl shadow-2xl border border-white/10 max-w-[260px] animate-in fade-in slide-in-from-right-4 duration-300">
              <span className="leading-snug">
                {isSpanish 
                  ? '💬 ¿Deseas evaluar tu caso o conocer precios? Chatea con Aura, Asesora IA.'
                  : '💬 Need pricing or a candidacy assessment? Chat with Aura, Clinic AI.'}
              </span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowWelcomeBubble(false);
                }}
                className="ml-2 text-white/50 hover:text-white p-0.5"
                title="Cerrar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Launcher Circle Button */}
          <button
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
              setShowWelcomeBubble(false);
            }}
            id="aura-chat-launcher-btn"
            className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#025c96] to-[#0373bb] text-white shadow-2xl hover:shadow-cyan-500/25 hover:scale-105 transition-all duration-300 active:scale-95 group cursor-pointer border-2 border-white/20"
            aria-label="Abrir Asistente Virtual Dr. Víctor Estrella"
          >
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#2D211A] rounded-full animate-pulse" />
            <img
              src="https://res.cloudinary.com/dkicj8zmk/image/upload/f_auto,q_auto,w_120/v1788891993/customer_service_sm_n5dq4d.png"
              alt="Asistente Virtual Dr. Víctor Estrella"
              width={36}
              height={36}
              decoding="async"
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
          </button>
        </div>
      )}

      {/* Main Chat Window */}
      {isOpen && (
        <div 
          className={`fixed z-50 transition-all duration-300 ease-in-out ${
            isMinimized 
              ? 'bottom-6 right-6 w-72 sm:w-80 h-16' 
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[94vw] sm:w-[440px] md:w-[470px] h-[85vh] max-h-[720px]'
          } bg-[#FCFBF9] rounded-3xl shadow-2xl border border-[#E5E0D8] flex flex-col overflow-hidden text-[#2D211A] font-sans antialiased`}
        >
          {/* Header Bar */}
          <div className="bg-[#2D211A] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#3D3028] shrink-0">
            <div className="flex items-center space-x-3 min-w-0">
              {/* Doctor/Avatar */}
              <div className="relative shrink-0">
                <img
                  src="https://res.cloudinary.com/dkicj8zmk/image/upload/f_auto,q_auto,w_120/v1786987014/vic_in_scrubs_ncpzcv.jpg"
                  alt="Dr. Víctor Estrella"
                  width={40}
                  height={40}
                  decoding="async"
                  className="w-10 h-10 rounded-full object-cover border-2 border-cyan-400/60 shadow-xs"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#2D211A] rounded-full" />
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="font-serif text-sm sm:text-base font-semibold tracking-wide text-white truncate">
                    Aura · Asesora Clínica IA
                  </span>
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" title="Verificado SODOCIPRE" />
                </div>
                <span className="text-[11px] text-cyan-200/80 font-sans tracking-tight truncate">
                  Dr. Víctor Estrella · Cirugía Plástica
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1 shrink-0">
              <button
                onClick={handleRestartChat}
                className="p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title={isSpanish ? 'Reiniciar conversación' : 'Restart chat'}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title={isMinimized ? 'Expandir' : 'Minimizar'}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onCloseExternal?.();
                }}
                className="p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title="Cerrar chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Section (only visible when not minimized) */}
          {!isMinimized && (
            <div className="flex-1 flex flex-col min-h-0 bg-[#FCFBF9]">
              
              {/* Quick Navigation / Action Bar */}
              <div className="bg-[#F4F1EA] px-3 py-2 border-b border-[#E8E2D6] flex items-center space-x-2 overflow-x-auto text-[11px] scrollbar-none shrink-0">
                <button
                  onClick={() => handleQuickPrompt('evaluation')}
                  className={`px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                    showEvaluationForm 
                      ? 'bg-[#0373bb] text-white shadow-xs' 
                      : 'bg-white text-[#2D211A] border border-[#DDD6C8] hover:border-[#0373bb]'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-cyan-600" />
                  <span>{isSpanish ? 'Evaluar mi caso' : 'Assess candidacy'}</span>
                </button>

                <button
                  onClick={() => handleQuickPrompt('pricing')}
                  className="px-3 py-1.5 rounded-full font-medium bg-white text-[#2D211A] border border-[#DDD6C8] hover:border-[#0373bb] transition-all whitespace-nowrap flex items-center space-x-1.5"
                >
                  <DollarSign className="w-3 h-3 text-emerald-600" />
                  <span>{isSpanish ? 'Precios oficiales' : 'Official Pricing'}</span>
                </button>

                <button
                  onClick={() => handleQuickPrompt('booking')}
                  className={`px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                    showBookingForm 
                      ? 'bg-[#0373bb] text-white shadow-xs' 
                      : 'bg-white text-[#2D211A] border border-[#DDD6C8] hover:border-[#0373bb]'
                  }`}
                >
                  <Calendar className="w-3 h-3 text-[#0373bb]" />
                  <span>{isSpanish ? 'Agendar cita' : 'Book consultation'}</span>
                </button>

                <button
                  onClick={() => handleQuickPrompt('travel')}
                  className="px-3 py-1.5 rounded-full font-medium bg-white text-[#2D211A] border border-[#DDD6C8] hover:border-[#0373bb] transition-all whitespace-nowrap flex items-center space-x-1.5"
                >
                  <span>🌴 {isSpanish ? 'Viaje a Rep. Dominicana' : 'Travel & Recovery'}</span>
                </button>
              </div>

              {/* In-Chat Interactive Evaluation Modal / Dropdown */}
              {showEvaluationForm && (
                <div className="p-4 bg-amber-50/70 border-b border-amber-200/80 shrink-0 text-xs space-y-3 animate-in fade-in duration-200 max-h-[300px] overflow-y-auto">
                  <div className="flex items-center justify-between pb-1 border-b border-amber-200/60">
                    <div className="flex items-center space-x-2 text-amber-900 font-bold">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>{isSpanish ? 'Formulario de Evaluación Estética Rápida' : 'Quick Aesthetic Assessment Form'}</span>
                    </div>
                    <button 
                      onClick={() => setShowEvaluationForm(false)}
                      className="text-neutral-500 hover:text-neutral-800 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Zone */}
                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1">
                      {isSpanish ? '1. Zona que deseas transformar:' : '1. Target area:'}
                    </label>
                    <select
                      value={evalZone}
                      onChange={(e) => setEvalZone(e.target.value)}
                      className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#0373bb]"
                    >
                      <option value="body">{isSpanish ? 'Abdomen, Cintura y Glúteos (Lipo 360 / BBL)' : 'Abdomen, Waist & Buttocks (Lipo 360 / BBL)'}</option>
                      <option value="mommy">{isSpanish ? 'Post-Embarazo / Flacidez (Mommy Makeover)' : 'Post-Pregnancy / Laxity (Mommy Makeover)'}</option>
                      <option value="breast">{isSpanish ? 'Senos (Aumento, Levantamiento o Reducción)' : 'Breasts (Augmentation, Lift or Reduction)'}</option>
                      <option value="arms">{isSpanish ? 'Brazos o Muslos (Braquioplastia / Cruroplastia)' : 'Arms or Thighs (Brachioplasty / Thigh Lift)'}</option>
                    </select>
                  </div>

                  {/* BMI metrics */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-neutral-700 block mb-1">
                        {isSpanish ? 'Estatura (cm):' : 'Height (cm):'}
                      </label>
                      <input
                        type="number"
                        min="130"
                        max="220"
                        value={evalHeight}
                        onChange={(e) => setEvalHeight(Number(e.target.value))}
                        className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-neutral-700 block mb-1">
                        {isSpanish ? 'Peso aprox (kg):' : 'Weight (kg):'}
                      </label>
                      <input
                        type="number"
                        min="40"
                        max="160"
                        value={evalWeight}
                        onChange={(e) => setEvalWeight(Number(e.target.value))}
                        className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-xs"
                      />
                    </div>
                  </div>

                  {/* Travel and children */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={evalTravel}
                        onChange={(e) => setEvalTravel(e.target.checked)}
                        className="rounded text-[#0373bb] focus:ring-[#0373bb]"
                      />
                      <span className="text-neutral-700">
                        {isSpanish ? 'Viajaré desde el exterior a Santo Domingo' : 'Traveling from abroad to Santo Domingo'}
                      </span>
                    </label>
                  </div>

                  <button
                    onClick={handleRunEvaluation}
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl bg-[#0373bb] hover:bg-[#025c96] text-white font-semibold text-xs tracking-wider uppercase shadow-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isSpanish ? 'Generar Evaluación Clínica' : 'Generate Clinical Assessment'}</span>
                  </button>
                </div>
              )}

              {/* In-Chat Interactive Booking Widget */}
              {showBookingForm && (
                <div className="p-4 bg-sky-50/80 border-b border-sky-200/80 shrink-0 text-xs space-y-3 animate-in fade-in duration-200 max-h-[340px] overflow-y-auto">
                  <div className="flex items-center justify-between pb-1 border-b border-sky-200">
                    <div className="flex items-center space-x-2 text-sky-950 font-bold">
                      <Calendar className="w-4 h-4 text-[#0373bb]" />
                      <span>{isSpanish ? 'Agendar Consulta con Dr. Víctor Estrella' : 'Book Consultation with Dr. Víctor Estrella'}</span>
                    </div>
                    <button 
                      onClick={() => setShowBookingForm(false)}
                      className="text-neutral-500 hover:text-neutral-800 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmitBooking} className="space-y-2.5">
                    {/* Procedure */}
                    <div>
                      <label className="font-semibold text-neutral-700 block mb-0.5">
                        {isSpanish ? 'Procedimiento de interés:' : 'Procedure of interest:'}
                      </label>
                      <select
                        value={bookingProcedure}
                        onChange={(e) => setBookingProcedure(e.target.value)}
                        className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-xs"
                      >
                        {OFFICIAL_PRICE_LIST.map(p => (
                          <option key={p.id} value={isSpanish ? p.name : p.nameEn}>
                            {isSpanish ? p.name : p.nameEn} {p.estimatedTotal ? `(~$${p.estimatedTotal.toLocaleString()} USD)` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Mode: Virtual vs In-person */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setBookingMode('virtual')}
                        className={`p-2 rounded-lg border text-left font-medium transition-all ${
                          bookingMode === 'virtual'
                            ? 'bg-[#0373bb] text-white border-[#0373bb]'
                            : 'bg-white text-neutral-700 border-neutral-300'
                        }`}
                      >
                        <div className="font-bold text-[11px]">💻 {isSpanish ? 'Virtual (Video)' : 'Virtual (Video)'}</div>
                        <div className="text-[10px] opacity-85">{isSpanish ? 'Pacientes internacionales' : 'International patients'}</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setBookingMode('presencial')}
                        className={`p-2 rounded-lg border text-left font-medium transition-all ${
                          bookingMode === 'presencial'
                            ? 'bg-[#0373bb] text-white border-[#0373bb]'
                            : 'bg-white text-neutral-700 border-neutral-300'
                        }`}
                      >
                        <div className="font-bold text-[11px]">🏥 {isSpanish ? 'Presencial' : 'In-Person'}</div>
                        <div className="text-[10px] opacity-85">{isSpanish ? 'Clínica Santo Domingo' : 'Santo Domingo Clinic'}</div>
                      </button>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-semibold text-neutral-700 block mb-0.5">
                          {isSpanish ? 'Fecha preferida:' : 'Preferred date:'}
                        </label>
                        <input
                          type="date"
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          className="w-full bg-white border border-neutral-300 rounded-lg p-1.5 text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-neutral-700 block mb-0.5">
                          {isSpanish ? 'Horario:' : 'Time:'}
                        </label>
                        <select
                          value={bookingTime}
                          onChange={(e) => setBookingTime(e.target.value)}
                          className="w-full bg-white border border-neutral-300 rounded-lg p-1.5 text-xs"
                        >
                          <option value="10:00 AM">10:00 AM</option>
                          <option value="11:30 AM">11:30 AM</option>
                          <option value="02:30 PM">02:30 PM</option>
                          <option value="04:00 PM">04:00 PM</option>
                          <option value="05:30 PM">05:30 PM</option>
                        </select>
                      </div>
                    </div>

                    {/* Patient Name */}
                    <div>
                      <label className="font-semibold text-neutral-700 block mb-0.5">
                        {isSpanish ? 'Nombre completo:' : 'Full name:'}
                      </label>
                      <input
                        type="text"
                        placeholder={isSpanish ? 'Tu nombre y apellido' : 'Your full name'}
                        value={bookingName}
                        onChange={(e) => setBookingName(e.target.value)}
                        className="w-full bg-white border border-neutral-300 rounded-lg p-1.5 text-xs"
                        required
                      />
                    </div>

                    {/* Email and Phone */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-semibold text-neutral-700 block mb-0.5">
                          {isSpanish ? 'Correo electrónico:' : 'Email address:'}
                        </label>
                        <input
                          type="email"
                          placeholder="email@example.com"
                          value={bookingEmail}
                          onChange={(e) => setBookingEmail(e.target.value)}
                          className="w-full bg-white border border-neutral-300 rounded-lg p-1.5 text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-neutral-700 block mb-0.5">
                          {isSpanish ? 'WhatsApp / Teléfono:' : 'WhatsApp / Phone:'}
                        </label>
                        <input
                          type="tel"
                          placeholder="+1 809 ..."
                          value={bookingPhone}
                          onChange={(e) => setBookingPhone(e.target.value)}
                          className="w-full bg-white border border-neutral-300 rounded-lg p-1.5 text-xs"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingBooking}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs tracking-wider uppercase shadow-xs flex items-center justify-center space-x-2 transition-all cursor-pointer mt-2"
                    >
                      {isSubmittingBooking ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{isSpanish ? 'Confirmar y Agendar Cita' : 'Confirm & Schedule Appointment'}</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* Chat Message Scrollable Container */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    {/* Role Header */}
                    <div className="flex items-center space-x-1.5 mb-1 px-1 text-[10px] text-neutral-400 font-medium">
                      {msg.role === 'assistant' ? (
                        <>
                          <Bot className="w-3 h-3 text-[#0373bb]" />
                          <span className="font-semibold text-neutral-600">Aura AI</span>
                        </>
                      ) : (
                        <>
                          <User className="w-3 h-3 text-neutral-500" />
                          <span className="font-semibold text-neutral-600">{bookingName || (isSpanish ? 'Tú' : 'You')}</span>
                        </>
                      )}
                      <span>· {msg.timestamp}</span>
                    </div>

                    {/* Speech Bubble */}
                    <div
                      className={`max-w-[88%] sm:max-w-[84%] rounded-2xl px-4 py-3 text-xs sm:text-[13px] leading-relaxed shadow-xs ${
                        msg.role === 'user'
                          ? 'bg-[#0373bb] text-white rounded-tr-xs'
                          : 'bg-white text-[#2D211A] border border-[#EBE6DC] rounded-tl-xs'
                      }`}
                    >
                      {/* Render text paragraphs */}
                      <div className="whitespace-pre-line space-y-1.5">
                        {msg.content}
                      </div>

                      {/* Embed Suggested Procedure Cards */}
                      {msg.suggestedProcedures && msg.suggestedProcedures.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-neutral-100 space-y-2">
                          <span className="text-[11px] font-bold tracking-wider text-cyan-800 uppercase block">
                            {isSpanish ? 'Procedimientos Destacados:' : 'Recommended Procedures:'}
                          </span>
                          
                          <div className="grid grid-cols-1 gap-2">
                            {msg.suggestedProcedures.slice(0, 3).map(procId => {
                              const proc = getProcedureItem(procId);
                              if (!proc) return null;

                              return (
                                <div 
                                  key={proc.id}
                                  className="bg-[#FCFBF9] border border-[#E2DDD3] rounded-xl p-2.5 hover:border-[#0373bb] transition-all shadow-xs flex flex-col justify-between space-y-2"
                                >
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h4 className="font-serif font-bold text-xs text-[#2D211A] leading-tight">
                                        {isSpanish ? proc.name : proc.nameEn}
                                      </h4>
                                      <div className="flex items-center space-x-1 mt-0.5">
                                        <span className="text-[10px] text-neutral-500">
                                          {proc.category === 'combo' ? 'Combo Especial' : proc.category === 'breast' ? 'Senos' : 'Contorno Corporal'}
                                        </span>
                                      </div>
                                    </div>

                                    {proc.estimatedTotal && (
                                      <div className="text-right shrink-0">
                                        <div className="font-bold text-[#0373bb] text-xs">
                                          ${proc.estimatedTotal.toLocaleString()} USD
                                        </div>
                                        {proc.medicalExpenses && (
                                          <div className="text-[9px] text-emerald-700">
                                            {isSpanish ? 'Gastos médicos incluidos' : 'Medical expenses incl.'}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center justify-between pt-1 border-t border-neutral-200/50 text-[10px]">
                                    <span className="text-neutral-600 flex items-center space-x-1">
                                      <Clock className="w-3 h-3 text-cyan-700" />
                                      <span>{isSpanish ? 'Estancia: 10-14 días' : 'Stay: 10-14 days'}</span>
                                    </span>

                                    <div className="flex items-center space-x-1.5">
                                      <button
                                        onClick={() => {
                                          setBookingProcedure(isSpanish ? proc.name : proc.nameEn);
                                          setShowBookingForm(true);
                                        }}
                                        className="bg-[#0373bb] hover:bg-[#025c96] text-white px-2.5 py-1 rounded-full font-semibold text-[10px] tracking-wide cursor-pointer transition-colors shadow-2xs"
                                      >
                                        {isSpanish ? 'Agendar' : 'Book'}
                                      </button>
                                      
                                      <button
                                        onClick={() => handleSendMessage(isSpanish ? `Deseo más información detallada sobre ${proc.name}` : `Tell me more details about ${proc.nameEn}`)}
                                        className="text-neutral-500 hover:text-neutral-800 p-1 font-medium"
                                        title={isSpanish ? 'Preguntar sobre esto' : 'Ask about this'}
                                      >
                                        <ChevronRight className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Embed Confirmed Appointment Receipt Card */}
                      {msg.appointmentConfirmed && (
                        <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 space-y-2">
                          <div className="flex items-center space-x-2 font-bold text-xs text-emerald-800">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{isSpanish ? 'Cita Registrada en Sistema Clínico' : 'Appointment Confirmed in Clinical System'}</span>
                          </div>

                          <div className="text-[11px] space-y-0.5 text-neutral-700">
                            <div><strong>{isSpanish ? 'Paciente' : 'Patient'}:</strong> {msg.appointmentConfirmed.firstName} {msg.appointmentConfirmed.lastName}</div>
                            <div><strong>{isSpanish ? 'Procedimiento' : 'Procedure'}:</strong> {msg.appointmentConfirmed.procedure}</div>
                            <div><strong>{isSpanish ? 'Fecha y Hora' : 'Date & Time'}:</strong> {msg.appointmentConfirmed.date} ({msg.appointmentConfirmed.time})</div>
                          </div>

                          <div className="pt-2 flex flex-wrap gap-2">
                            {/* Add to Google Calendar button */}
                            <a
                              href={getGoogleCalendarUrl({
                                title: `Consulta Cirugía Plástica: ${msg.appointmentConfirmed.procedure} - Dr. Víctor Estrella`,
                                description: `Consulta médica con el Dr. Víctor Estrella para ${msg.appointmentConfirmed.procedure}.\nPaciente: ${msg.appointmentConfirmed.firstName} ${msg.appointmentConfirmed.lastName}\nTel: ${msg.appointmentConfirmed.phone}`,
                                location: 'Clínica Dr. Víctor Estrella, Santo Domingo, República Dominicana',
                                date: msg.appointmentConfirmed.date,
                                time: msg.appointmentConfirmed.time
                              })}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold transition-all shadow-2xs"
                            >
                              <Calendar className="w-3 h-3" />
                              <span>{isSpanish ? 'Google Calendar' : 'Add to Calendar'}</span>
                            </a>

                            {/* WhatsApp Direct Chat */}
                            <a
                              href={`https://wa.me/18299358121?text=${encodeURIComponent(`Hola Dr. Víctor Estrella, he agendado una consulta para ${msg.appointmentConfirmed.procedure} el día ${msg.appointmentConfirmed.date} a nombre de ${msg.appointmentConfirmed.firstName} ${msg.appointmentConfirmed.lastName}.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white text-[10px] font-bold transition-all shadow-2xs"
                            >
                              <Phone className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Animated Typing Indicator */}
                {isLoading && (
                  <div className="flex flex-col items-start space-y-1">
                    <div className="flex items-center space-x-1.5 text-[10px] text-neutral-400 font-medium px-1">
                      <Bot className="w-3 h-3 text-[#0373bb]" />
                      <span className="font-semibold text-neutral-600">Aura AI</span>
                    </div>
                    <div className="bg-white border border-[#EBE6DC] rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs flex items-center space-x-2">
                      <span className="text-xs text-neutral-500 font-medium">
                        {isSpanish ? 'Aura está evaluando...' : 'Aura is thinking...'}
                      </span>
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-[#0373bb] rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-1.5 h-1.5 bg-[#0373bb] rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-1.5 h-1.5 bg-[#0373bb] rounded-full animate-bounce" />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Input Area */}
              <div className="p-3 bg-white border-t border-[#E8E2D6] shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center space-x-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    placeholder={
                      isSpanish
                        ? 'Pregunta sobre cirugías, precios o recuperación...'
                        : 'Ask about procedures, pricing, or travel...'
                    }
                    className="flex-1 bg-[#F7F5F0] border border-[#DDD6C8] rounded-full px-4 py-2.5 text-xs text-[#2D211A] placeholder:text-neutral-400 focus:outline-none focus:border-[#0373bb] focus:ring-1 focus:ring-[#0373bb] transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!inputQuery.trim() || isLoading}
                    className="p-2.5 rounded-full bg-[#0373bb] hover:bg-[#025c96] text-white disabled:opacity-40 disabled:hover:bg-[#0373bb] transition-colors cursor-pointer shadow-xs shrink-0"
                    aria-label="Enviar mensaje"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                <div className="text-center mt-2">
                  <span className="text-[10px] text-neutral-600 tracking-tight">
                    {isSpanish 
                      ? 'Asistente IA clínico · Certificado SODOCIPRE · Santo Domingo, RD'
                      : 'Clinical AI Assistant · SODOCIPRE Certified · Santo Domingo, DR'}
                  </span>
                </div>
              </div>

            </div>
          )}
        </div>
      )}
    </>
  );
}
