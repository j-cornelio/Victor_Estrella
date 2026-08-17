import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { GALLERY_ITEMS, TESTIMONIALS } from '../data';
import { 
  CheckCircle2, 
  Video, 
  MapPin, 
  Calendar, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Star, 
  MessageSquare, 
  Send, 
  Check, 
  SlidersHorizontal,
  Clock,
  User,
  Mail,
  Phone,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';

interface InstagramLandingPageProps {
  onClose: () => void;
  onOpenConsultation?: (specialistId?: string, procedureName?: string) => void;
}

export default function InstagramLandingPage({ onClose, onOpenConsultation }: InstagramLandingPageProps) {
  const { t, language } = useLanguage();
  const isEs = language === 'es';

  // Lead Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    procedure: 'Liposuction HD & BBL',
    travelTimeline: '1-3 Months',
    country: 'United States',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Before/After Slider State
  const [sliderPositions, setSliderPositions] = useState<{ [key: string]: number }>({
    g3: 50,
    g4: 50,
    g5: 50
  });

  const handleSliderChange = (id: string, val: number) => {
    setSliderPositions(prev => ({
      ...prev,
      [id]: val
    }));
  };

  const scrollToForm = () => {
    const formEl = document.getElementById('instagram-lead-form');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) return;

    setIsSubmitting(true);

    setTimeout(() => {
      // Save lead into Dr. Estrella CRM leads storage so it appears in the CRM Portal
      try {
        const existingRaw = localStorage.getItem('dr_estrella_crm_leads');
        const existingLeads = existingRaw ? JSON.parse(existingRaw) : [];

        const newLead = {
          id: `lead_ig_${Date.now()}`,
          patientName: formData.fullName,
          procedure: formData.procedure,
          email: formData.email,
          phone: formData.phone,
          status: 'Evaluation Requested',
          riskLevel: 'Low',
          date: new Date().toISOString().split('T')[0],
          source: 'Instagram Landing Page',
          country: formData.country,
          notes: `[Timeline: ${formData.travelTimeline}] ${formData.notes}`
        };

        const updated = [newLead, ...existingLeads];
        localStorage.setItem('dr_estrella_crm_leads', JSON.stringify(updated));

        // Also save in consultations
        const existingConsRaw = localStorage.getItem('lumiskin_consultations');
        const existingCons = existingConsRaw ? JSON.parse(existingConsRaw) : [];
        const newCons = {
          id: `cons_${Date.now()}`,
          specialistName: 'Dr. Víctor Estrella',
          specialistTitle: 'Board Certified Plastic Surgeon',
          procedureName: formData.procedure,
          date: new Date().toISOString().split('T')[0],
          timeSlot: '02:00 PM (Virtual)',
          notes: `[Instagram Lead] ${formData.notes}`,
          status: 'Confirmed'
        };
        localStorage.setItem('lumiskin_consultations', JSON.stringify([newCons, ...existingCons]));
      } catch (err) {
        console.error('Error saving lead to CRM', err);
      }

      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 800);
  };

  const selectedGallery = GALLERY_ITEMS.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FCFBF9] text-[#2D211A] flex flex-col justify-between font-sans selection:bg-[#0373bb]/20 selection:text-[#0373bb]">
      
      {/* Navigation Header */}
      <div className="bg-white border-b border-[#EBE6DF] sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#5C4D44] hover:text-[#0373bb] transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-[#0373bb]" />
            <span>{isEs ? 'Volver al Sitio Principal' : 'Back to Main Site'}</span>
          </button>

          <div className="flex items-center space-x-3">
            <span className="hidden sm:inline-block text-[10px] bg-cyan-50 border border-cyan-100 text-[#0373bb] px-3 py-1 rounded-full uppercase tracking-widest font-bold">
              Santo Domingo • DR
            </span>
            <a
              href="https://wa.me/18299358121?text=Hello%20Dr.%20Victor%20Estrella%20Team%2C%20I%20came%20from%20Instagram%20and%20would%20like%20to%20book%20a%20virtual%20consultation."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      <main className="flex-1">

        {/* 1. CANVA-INSPIRED BLUE & WHITE HERO SECTION */}
        <section className="relative bg-gradient-to-br from-[#025a94] via-[#0373bb] to-[#013d66] text-white overflow-hidden py-16 sm:py-24">
          
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Value Proposition & Direct CTAs */}
              <div className="lg:col-span-7 text-left space-y-6">
                
                {/* Eyebrow Tag */}
                <div className="inline-flex items-center space-x-2 bg-white/15 backdrop-blur-md border border-white/25 text-cyan-200 text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full">
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>PLASTIC SURGERY IN THE DOMINICAN REPUBLIC</span>
                </div>

                {/* Main Headline */}
                <h1 className="font-serif text-3.5xl sm:text-5.5xl text-white font-light tracking-tight leading-[1.15]">
                  Your journey can start <br className="hidden sm:inline" />
                  <span className="font-normal text-cyan-200 italic">from anywhere.</span>
                </h1>

                {/* Subtitle / Core Pitch */}
                <p className="text-base sm:text-xl text-white/90 max-w-2xl font-light leading-relaxed">
                  Meet virtually with <strong className="text-white font-semibold">Dr. Víctor Estrella</strong> before making your travel plans.
                </p>

                {/* CTA Buttons */}
                <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <motion.button
                    onClick={scrollToForm}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white text-[#0373bb] hover:bg-cyan-50 px-8 py-4 rounded-xl font-bold text-sm tracking-wide shadow-xl flex items-center justify-center space-x-3 cursor-pointer uppercase"
                  >
                    <span>BOOK YOUR VIRTUAL CONSULTATION</span>
                    <ArrowRight className="w-4 h-4 text-[#0373bb]" />
                  </motion.button>

                  <a
                    href="https://wa.me/18299358121?text=Hi%20Dr.%20Victor%20Estrella%20Team!%20I'm%20interested%20in%20a%20virtual%20consultation."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-6 py-4 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center space-x-2.5 transition-all text-center"
                  >
                    <MessageSquare className="w-4 h-4 text-[#25D366]" />
                    <span>WhatsApp Direct Chat</span>
                  </a>
                </div>

                {/* Credentials / Trust Badges */}
                <div className="pt-6 border-t border-white/15 flex flex-wrap items-center gap-6 text-xs text-white/80">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-300" />
                    <span>SODOCIPRE Board Certified Surgeon</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>5.0 Stars (200+ International Cases)</span>
                  </div>
                </div>

              </div>

              {/* Right Column: Doctor Preview Card */}
              <div className="lg:col-span-5">
                <div className="relative bg-white/10 backdrop-blur-md p-3 rounded-3xl border border-white/25 shadow-2xl overflow-hidden">
                  <div className="relative h-[380px] sm:h-[420px] rounded-2xl overflow-hidden bg-[#013d66]">
                    <img
                      src="https://res.cloudinary.com/dkicj8zmk/image/upload/v1786987014/vic_in_scrubs_ncpzcv.jpg"
                      alt="Dr. Victor Estrella Plastic Surgeon"
                      className="w-full h-full object-cover object-top"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#013d66] via-black/20 to-transparent opacity-85" />

                    <div className="absolute bottom-6 left-6 right-6 text-left text-white space-y-1 z-10">
                      <div className="bg-[#0373bb]/95 backdrop-blur-md inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-cyan-200 border border-cyan-400/30 shadow-sm">
                        Lead Surgeon • Santo Domingo HQ
                      </div>
                      <h3 className="font-serif text-2xl font-medium text-white">Dr. Víctor Estrella</h3>
                      <p className="text-xs text-white/90 font-sans">
                        Aesthetic & Reconstructive Surgery Specialist
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* 2. FLOATING HIGHLIGHT BAR (Matching Canva template bottom bar) */}
            <div className="mt-12 bg-white text-[#2D211A] rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/30 grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-neutral-200">
              
              {/* Feature 1 */}
              <div className="pt-4 md:pt-0 md:px-6 first:pl-0 flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-[#0373bb] shrink-0">
                  <Video className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-base text-[#2D211A]">Virtual Consultation</h4>
                  <p className="text-xs text-[#7C6C63] mt-1 leading-relaxed">
                    Evaluate your candidacy remotely via HD WhatsApp video call before booking travel.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="pt-4 md:pt-0 md:px-6 flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-[#0373bb] shrink-0">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-base text-[#2D211A]">Personalized Surgical Planning</h4>
                  <p className="text-xs text-[#7C6C63] mt-1 leading-relaxed">
                    Receive exact procedure quotes, recovery duration timelines, and medical guidelines.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="pt-4 md:pt-0 md:px-6 last:pr-0 flex items-start space-x-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-[#0373bb] shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-base text-[#2D211A]">Santo Domingo, DR</h4>
                  <p className="text-xs text-[#7C6C63] mt-1 leading-relaxed">
                    State-of-the-art clinical suites in Gazcue with full recovery house network options.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </section>


        {/* 3. WHY START WITH A VIRTUAL CONSULTATION? SECTION */}
        <section className="py-20 bg-white border-b border-[#EBE6DF]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            
            <span className="text-xs uppercase tracking-widest text-[#0373bb] font-bold">
              International Patient Experience
            </span>
            <h2 className="font-serif text-3xl sm:text-4.5xl text-[#2D211A] font-light mt-2 mb-4">
              Why start with a virtual consultation?
            </h2>
            <p className="text-sm sm:text-base text-[#7C6C63] max-w-2xl mx-auto leading-relaxed mb-12">
              Preparing for surgery abroad is seamless when guided by an experienced surgical team from step one.
            </p>

            {/* Checklist items requested */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              
              <div className="bg-[#FCFBF9] p-6 rounded-2xl border border-[#EBE6DF] hover:border-[#0373bb] transition-all flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-[#0373bb] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#2D211A]">Discuss your aesthetic goals</h3>
                  <p className="text-xs text-[#7C6C63] mt-1 leading-relaxed">
                    Share your exact desired outcomes, photo references, and medical history with Dr. Estrella's surgical board.
                  </p>
                </div>
              </div>

              <div className="bg-[#FCFBF9] p-6 rounded-2xl border border-[#EBE6DF] hover:border-[#0373bb] transition-all flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-[#0373bb] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#2D211A]">Learn which procedures are appropriate for you</h3>
                  <p className="text-xs text-[#7C6C63] mt-1 leading-relaxed">
                    Get expert evaluation on Liposuction HD, Tummy Tuck, BBL, Breast Augmentation, or combination Mommy Makeover.
                  </p>
                </div>
              </div>

              <div className="bg-[#FCFBF9] p-6 rounded-2xl border border-[#EBE6DF] hover:border-[#0373bb] transition-all flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-[#0373bb] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#2D211A]">Ask questions about your surgical journey</h3>
                  <p className="text-xs text-[#7C6C63] mt-1 leading-relaxed">
                    Clarify anesthesia protocols, hospital stay duration, lymphatic massage care, and garment specifications.
                  </p>
                </div>
              </div>

              <div className="bg-[#FCFBF9] p-6 rounded-2xl border border-[#EBE6DF] hover:border-[#0373bb] transition-all flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-[#0373bb] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#2D211A]">Discuss what to expect before traveling</h3>
                  <p className="text-xs text-[#7C6C63] mt-1 leading-relaxed">
                    Review required pre-op blood work, cardiology clearances, flight timing, and recovery house accommodations.
                  </p>
                </div>
              </div>

              <div className="bg-[#FCFBF9] p-6 rounded-2xl border border-[#EBE6DF] hover:border-[#0373bb] transition-all flex items-start space-x-4 md:col-span-2">
                <div className="w-8 h-8 rounded-full bg-[#0373bb] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#2D211A]">Connect with Dr. Victor's team</h3>
                  <p className="text-xs text-[#7C6C63] mt-1 leading-relaxed">
                    Meet your dedicated international patient coordinator who will assist with scheduling, arrival, and post-op care.
                  </p>
                </div>
              </div>

            </div>

            <div className="mt-10">
              <button
                onClick={scrollToForm}
                className="inline-flex items-center space-x-2 bg-[#0373bb] hover:bg-[#025c96] text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>BOOK YOUR VIRTUAL CONSULTATION NOW</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </section>


        {/* 4. BEFORE & AFTER TRANSFORMATION GALLERY */}
        <section className="py-20 bg-[#FCFBF9] border-b border-[#EBE6DF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            
            <span className="text-xs uppercase tracking-widest text-[#0373bb] font-bold">
              Real Clinical Cases
            </span>
            <h2 className="font-serif text-3xl sm:text-4.5xl text-[#2D211A] font-light mt-2 mb-3">
              Before & After Transformations
            </h2>
            <p className="text-sm sm:text-base text-[#7C6C63] max-w-xl mx-auto mb-12">
              Slide to compare real patient transformations performed by Dr. Víctor Estrella in Santo Domingo.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              {selectedGallery.map((item) => {
                const sliderPos = sliderPositions[item.id] !== undefined ? sliderPositions[item.id] : 50;

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-3xl border border-[#EBE6DF] hover:border-[#0373bb] p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    {/* Sliding Comparison Frame */}
                    <div className="relative h-[240px] rounded-2xl overflow-hidden select-none bg-neutral-100">
                      
                      {/* Before image */}
                      <img
                        src={item.before}
                        alt="Before Procedure"
                        className="w-full h-full object-cover"
                      />

                      {/* After image overlay */}
                      <div
                        className="absolute inset-y-0 left-0 right-0 overflow-hidden"
                        style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
                      >
                        <img
                          src={item.after}
                          alt="After Procedure"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>

                      {/* Badges */}
                      <div className="absolute top-3 left-3 bg-[#0373bb]/90 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full z-10 pointer-events-none">
                        After
                      </div>
                      <div className="absolute top-3 right-3 bg-black/60 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full z-10 pointer-events-none">
                        Before
                      </div>

                      {/* Divider line */}
                      <div
                        className="absolute inset-y-0 w-0.5 bg-white z-20 pointer-events-none"
                        style={{ left: `${sliderPos}%` }}
                      >
                        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white border border-[#0373bb] text-[#0373bb] flex items-center justify-center shadow-md">
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* Range slider */}
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={sliderPos}
                        onChange={(e) => handleSliderChange(item.id, Number(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                      />
                    </div>

                    <div className="pt-4 pb-1 px-1 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#0373bb]">
                          {item.category}
                        </span>
                        <h4 className="font-serif text-base font-medium text-[#2D211A] mt-0.5">
                          {item.title}
                        </h4>
                      </div>
                      <div className="text-[10px] bg-cyan-50 text-[#0373bb] font-bold px-2.5 py-1 rounded-full uppercase border border-cyan-100">
                        Santo Domingo
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        </section>


        {/* 5. REVIEWS & TESTIMONIALS SECTION */}
        <section className="py-20 bg-[#b8e1ef] border-b border-[#EBE6DF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            
            <span className="text-xs uppercase tracking-widest text-[#0373bb] font-bold">
              Patient Verified Feedback
            </span>
            <h2 className="font-serif text-3xl sm:text-4.5xl text-[#2D211A] font-light mt-2 mb-3">
              International Patient Reviews
            </h2>
            <p className="text-sm sm:text-base text-[#7C6C63] max-w-xl mx-auto mb-12">
              Read real stories from patients who traveled from the US, Puerto Rico, and Europe to Santo Domingo.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              {TESTIMONIALS.slice(0, 3).map((item) => (
                <div key={item.id} className="bg-white rounded-3xl p-7 border border-[#EBE6DF] shadow-xs flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-1 text-yellow-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <h4 className="font-bold text-sm text-[#2D211A] uppercase tracking-tight">
                      {item.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-[#5C4D44] italic leading-relaxed">
                      "{item.quote}"
                    </p>
                  </div>

                  <div className="pt-5 mt-5 border-t border-neutral-100 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs sm:text-sm text-[#2D211A]">{item.author}</p>
                      <p className="text-[10px] text-neutral-400 font-semibold uppercase">{item.source}</p>
                    </div>
                    <span className="text-[9px] bg-cyan-50 text-[#0373bb] font-bold px-2 py-0.5 rounded-full border border-cyan-100 uppercase">
                      Verified Patient
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>


        {/* 6. INSTAGRAM LEAD CAPTURE FORM SECTION */}
        <section id="instagram-lead-form" className="py-20 bg-white scroll-mt-10">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="bg-[#FCFBF9] rounded-3xl border-2 border-[#0373bb]/30 p-6 sm:p-10 shadow-2xl relative overflow-hidden text-left">
              
              <div className="absolute -right-12 -top-12 w-40 h-40 bg-cyan-100/50 rounded-full blur-2xl pointer-events-none" />

              <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#0373bb] bg-cyan-50 px-3.5 py-1 rounded-full border border-cyan-100 inline-block">
                  INSTAGRAM EXCLUSIVE PORTAL
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl text-[#2D211A] font-light">
                  Book Your Virtual Consultation
                </h2>
                <p className="text-xs sm:text-sm text-[#7C6C63]">
                  Fill out your details below to schedule your pre-surgical virtual evaluation with Dr. Víctor Estrella's team.
                </p>
              </div>

              {isSubmitted ? (
                <div className="bg-white rounded-2xl p-8 border border-cyan-200 text-center space-y-4 shadow-sm animate-in fade-in duration-300">
                  <div className="w-16 h-16 bg-[#25D366]/10 text-[#25D366] rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-[#2D211A]">Consultation Requested!</h3>
                  <p className="text-xs sm:text-sm text-[#5C4D44] max-w-md mx-auto leading-relaxed">
                    Thank you, <strong className="text-[#0373bb]">{formData.fullName}</strong>. Our international patient coordinator has received your request for <strong>{formData.procedure}</strong>.
                  </p>
                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={`https://wa.me/18299358121?text=Hi!%20I%20just%20submitted%20my%20virtual%20consultation%20form%20for%20${encodeURIComponent(formData.procedure)}.%20My%20name%20is%20${encodeURIComponent(formData.fullName)}.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20ba5a] text-white px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-md"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Speed Up via WhatsApp Chat</span>
                    </a>
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="w-full sm:w-auto bg-neutral-100 hover:bg-neutral-200 text-[#5C4D44] px-5 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider"
                    >
                      Submit Another Request
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  {/* Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#2D211A] uppercase tracking-wide mb-1.5">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          required
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          placeholder="e.g. Maria Santos"
                          className="w-full pl-10 pr-4 py-3 bg-white border border-[#EBE6DF] focus:border-[#0373bb] rounded-xl text-xs sm:text-sm text-[#2D211A] outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2D211A] uppercase tracking-wide mb-1.5">
                        WhatsApp / Phone *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+1 (555) 000-0000"
                          className="w-full pl-10 pr-4 py-3 bg-white border border-[#EBE6DF] focus:border-[#0373bb] rounded-xl text-xs sm:text-sm text-[#2D211A] outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email & Country */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#2D211A] uppercase tracking-wide mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="maria@example.com"
                          className="w-full pl-10 pr-4 py-3 bg-white border border-[#EBE6DF] focus:border-[#0373bb] rounded-xl text-xs sm:text-sm text-[#2D211A] outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2D211A] uppercase tracking-wide mb-1.5">
                        Country / State
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          placeholder="e.g. United States, New York"
                          className="w-full pl-10 pr-4 py-3 bg-white border border-[#EBE6DF] focus:border-[#0373bb] rounded-xl text-xs sm:text-sm text-[#2D211A] outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Procedure & Travel Timeline */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#2D211A] uppercase tracking-wide mb-1.5">
                        Procedure of Interest *
                      </label>
                      <select
                        value={formData.procedure}
                        onChange={(e) => setFormData({ ...formData, procedure: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-[#EBE6DF] focus:border-[#0373bb] rounded-xl text-xs sm:text-sm text-[#2D211A] outline-none transition-all font-medium"
                      >
                        <option value="Liposuction HD & BBL">Liposuction HD & BBL</option>
                        <option value="Tummy Tuck / Abdominoplasty">Tummy Tuck / Abdominoplasty</option>
                        <option value="Mommy Makeover Combo">Mommy Makeover Combo</option>
                        <option value="Breast Augmentation / Lift">Breast Augmentation / Lift</option>
                        <option value="Rhinoplasty / Facial Surgery">Rhinoplasty / Facial Surgery</option>
                        <option value="Reconstructive Surgery">Reconstructive Surgery</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2D211A] uppercase tracking-wide mb-1.5">
                        Expected Travel Timeline
                      </label>
                      <select
                        value={formData.travelTimeline}
                        onChange={(e) => setFormData({ ...formData, travelTimeline: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-[#EBE6DF] focus:border-[#0373bb] rounded-xl text-xs sm:text-sm text-[#2D211A] outline-none transition-all font-medium"
                      >
                        <option value="As Soon As Possible">As Soon As Possible (Within 30 Days)</option>
                        <option value="1-3 Months">1 - 3 Months</option>
                        <option value="3-6 Months">3 - 6 Months</option>
                        <option value="Just Exploring Options">Just Exploring Options</option>
                      </select>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label className="block text-xs font-bold text-[#2D211A] uppercase tracking-wide mb-1.5">
                      Tell us about your goals / questions
                    </label>
                    <textarea
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="e.g. Interested in Lipo HD with BBL contouring, looking for travel recommendations for recovery house..."
                      className="w-full p-3.5 bg-white border border-[#EBE6DF] focus:border-[#0373bb] rounded-xl text-xs sm:text-sm text-[#2D211A] outline-none transition-all"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#0373bb] hover:bg-[#025c96] text-white py-4 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center space-x-2"
                    >
                      {isSubmitting ? (
                        <span>Processing Request...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>BOOK YOUR VIRTUAL CONSULTATION</span>
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-center text-neutral-400 mt-2">
                      🔒 Your medical info is kept 100% confidential under Dr. Víctor Estrella privacy standards.
                    </p>
                  </div>

                </form>
              )}

            </div>

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-[#2D211A] text-white/70 py-10 border-t border-neutral-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-[#0373bb]">
            <span className="font-serif text-lg text-white font-light tracking-widest uppercase">
              DR. VICTOR ESTRELLA
            </span>
            <span className="hidden sm:inline text-neutral-600">•</span>
            <span className="text-cyan-300 font-sans font-bold">Santo Domingo, Dominican Republic</span>
          </div>
          <p className="max-w-xl mx-auto text-[11px] text-neutral-400 leading-relaxed">
            IPBMA Medical Associates, Av Independencia 655, Gazcue, Santo Domingo, Dominican Republic. <br />
            Phone / WhatsApp: (829) 935-8121
          </p>
          <div className="pt-2 text-[10px] text-neutral-500">
            © {new Date().getFullYear()} Dr. Víctor Estrella. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
