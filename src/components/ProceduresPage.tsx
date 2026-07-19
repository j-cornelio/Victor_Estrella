import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { PROCEDURES_DATA, ProcedureDetail } from '../data/proceduresData';
import { 
  ArrowLeft, Search, Clock, ShieldCheck, Heart, 
  HelpCircle, Calendar, Sparkles, Check, 
  ChevronRight, Info, AlertCircle, FileText, X
} from 'lucide-react';

interface ProceduresPageProps {
  onClose: () => void;
  onOpenConsultation: (specialistId?: string, procedureName?: string) => void;
  initialCategory?: string;
  initialProcedureId?: string | null;
}

export default function ProceduresPage({
  onClose,
  onOpenConsultation,
  initialCategory = 'all',
  initialProcedureId = null
}: ProceduresPageProps) {
  const { t, language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProcedure, setSelectedProcedure] = useState<ProcedureDetail | null>(
    initialProcedureId ? PROCEDURES_DATA.find(p => p.id === initialProcedureId) || null : null
  );
  const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'guidelines' | 'faqs'>('overview');

  const categories = [
    { value: 'all', labelKey: 'gallery.all' },
    { value: 'face', labelKey: 'category.surgical_face' },
    { value: 'breast', labelKey: 'category.breast_aesthetics' },
    { value: 'body', labelKey: 'category.body_contouring' },
    { value: 'skin', labelKey: 'category.injectables' }
  ];

  // Concrete strongly-typed helpers to resolve localized clinical content safely
  const getLocalizedStr = (field: { en: string; es: string }): string => {
    if (language === 'es') return field.es;
    return field.en;
  };

  const getLocalizedArray = (field: { en: string[]; es: string[] }): string[] => {
    if (language === 'es') return field.es;
    return field.en;
  };

  // Filter & Search Logic
  const filteredProcedures = useMemo(() => {
    return PROCEDURES_DATA.filter(proc => {
      // Category Filter
      if (activeCategory !== 'all' && proc.category !== activeCategory) {
        return false;
      }
      
      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const procName = t(proc.nameKey).toLowerCase();
        const overview = getLocalizedStr(proc.overview).toLowerCase();
        return procName.includes(query) || overview.includes(query);
      }
      
      return true;
    });
  }, [activeCategory, searchQuery, language]);

  const handleBookProcedure = (proc: ProcedureDetail) => {
    const procName = t(proc.nameKey);
    onOpenConsultation(undefined, procName);
  };

  return (
    <div className="min-h-screen bg-[#FCFBF9] text-[#2D211A] flex flex-col justify-between font-sans selection:bg-[#0373bb]/20 selection:text-[#0373bb] animate-in fade-in duration-300">
      
      {/* Upper Navigation Bar */}
      <div className="border-b border-[#EBE6DF] bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#5C4D44] hover:text-[#0373bb] transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>{t('account.welcome').includes('Bienvenido') ? 'Volver al Inicio' : 'Back to Home'}</span>
          </button>

          <span className="text-[10px] bg-cyan-50 border border-cyan-100 text-[#0373bb] px-3 py-1 rounded-full uppercase tracking-widest font-bold">
            Santo Domingo • Clinical Guidelines
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        
        {/* Header Title Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <span className="text-xs uppercase tracking-widest text-[#0373bb] font-bold block">
            {language === 'es' ? 'PROCEDIMIENTOS Y GUIAS' : 'PROCEDURES & GUIDELINES LIBRARY'}
          </span>
          <h1 className="font-serif text-3.5xl sm:text-5xl text-[#2D211A] tracking-tight leading-tight">
            {language === 'es' 
              ? 'Explora Tu Viaje de Transformación Estética' 
              : 'Explore Your Journey of Aesthetic Transformation'}
          </h1>
          <p className="text-sm sm:text-base text-[#7C6C63] leading-relaxed">
            {language === 'es'
              ? 'Conozca los detalles clínicos de cada cirugía, instrucciones pre y postoperatorias, y respuestas directas de nuestro equipo médico liderado por el Dr. Victor Estrella.'
              : 'Learn the clinical details behind each surgery, pre and post-operative instructions, and direct answers from our medical board led by Dr. Victor Estrella.'}
          </p>
        </div>

        {/* Filters and Search Bar Container */}
        <div className="bg-white border border-[#EBE6DF] rounded-3xl p-4 sm:p-6 mb-10 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {categories.map((cat) => {
              const label = t(cat.labelKey);
              return (
                <button
                  key={cat.value}
                  onClick={() => {
                    setActiveCategory(cat.value);
                    setSelectedProcedure(null);
                  }}
                  className={`px-4.5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    activeCategory === cat.value
                      ? 'bg-[#0373bb] text-white shadow-xs'
                      : 'bg-neutral-50 text-[#5C4D44] hover:bg-neutral-100 border border-[#EBE6DF]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder={language === 'es' ? 'Buscar cirugía...' : 'Search procedure...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[#D5CDD2] focus:outline-none focus:ring-1 focus:ring-[#0373bb] text-xs font-sans text-[#2D211A] bg-neutral-50"
            />
            <Search className="w-4 h-4 text-[#7C6C63] absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

        </div>

        {/* Dynamic Split Grid View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT: Grid of Procedures (Col-span: 5 if detail selected, col-span: 12 if none selected) */}
          <div className={`${selectedProcedure ? 'lg:col-span-5' : 'lg:col-span-12'} grid grid-cols-1 md:grid-cols-2 ${selectedProcedure ? 'md:grid-cols-1 gap-6' : 'lg:grid-cols-3 gap-8'} transition-all duration-300`}>
            {filteredProcedures.length === 0 ? (
              <div className="col-span-full py-16 text-center space-y-4 bg-white rounded-3xl border border-[#EBE6DF]">
                <Info className="w-12 h-12 text-[#7C6C63]/50 mx-auto" />
                <p className="text-sm font-semibold text-[#5C4D44]">
                  {language === 'es' ? 'No se encontraron procedimientos.' : 'No procedures matched your filter.'}
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                  className="px-4 py-2 bg-[#0373bb] text-white text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-[#0373bb]/90"
                >
                  {language === 'es' ? 'Mostrar Todos' : 'Reset Filters'}
                </button>
              </div>
            ) : (
              filteredProcedures.map((proc) => {
                const isCurrent = selectedProcedure?.id === proc.id;
                return (
                  <div
                    key={proc.id}
                    className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col justify-between text-left ${
                      isCurrent 
                        ? 'border-[#0373bb] ring-1 ring-[#0373bb] shadow-md' 
                        : 'border-[#EBE6DF] hover:border-[#0373bb]/60 hover:shadow-sm'
                    }`}
                  >
                    <div>
                      {/* Image Thumbnail */}
                      <div className="relative h-44 overflow-hidden bg-neutral-100">
                        <img
                          src={proc.image}
                          alt={t(proc.nameKey)}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute top-3 left-3 bg-[#2D211A]/80 backdrop-blur-xs text-white text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full border border-white/10">
                          {t(`category.${proc.category === 'skin' ? 'injectables' : proc.category === 'face' ? 'surgical_face' : proc.category === 'breast' ? 'breast_aesthetics' : 'body_contouring'}`)}
                        </span>
                      </div>

                      {/* Info body */}
                      <div className="p-5.5 space-y-3.5">
                        <h3 className="font-serif text-lg font-bold text-[#2D211A] tracking-tight">
                          {t(proc.nameKey)}
                        </h3>
                        
                        <p className="text-xs text-[#7C6C63] leading-relaxed line-clamp-2">
                          {getLocalizedStr(proc.overview)}
                        </p>

                        {/* Quick technical badges */}
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-100 text-[10px]">
                          <div className="flex items-center space-x-1.5 text-[#5C4D44]">
                            <Clock className="w-3.5 h-3.5 text-[#0373bb] shrink-0" />
                            <span className="truncate">{getLocalizedStr(proc.duration)}</span>
                          </div>
                          <div className="flex items-center space-x-1.5 text-[#5C4D44]">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#0373bb] shrink-0" />
                            <span className="truncate">{getLocalizedStr(proc.anesthesia).split(' ')[0]}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="p-5.5 pt-0 flex gap-2">
                      <button
                        onClick={() => setSelectedProcedure(proc)}
                        className="flex-1 py-2 bg-neutral-100 hover:bg-[#0373bb] text-[#5C4D44] hover:text-white rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer text-center"
                      >
                        {language === 'es' ? 'Ver Detalles' : 'View Details'}
                      </button>
                      <button
                        onClick={() => handleBookProcedure(proc)}
                        className="p-2 bg-[#0373bb]/10 hover:bg-[#0373bb] text-[#0373bb] hover:text-white rounded-full transition-colors cursor-pointer"
                        title={language === 'es' ? 'Reservar consulta' : 'Schedule consultation'}
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </div>

          {/* RIGHT: Selected Procedure Details (Col-span: 7) */}
          {selectedProcedure && (
            <div className="lg:col-span-7 bg-white rounded-3xl border border-[#EBE6DF] shadow-md overflow-hidden text-left animate-in fade-in slide-in-from-right-4 duration-300 sticky top-24">
              
              {/* Header Banner */}
              <div className="relative h-60 overflow-hidden bg-neutral-100">
                <img
                  src={selectedProcedure.image}
                  alt={t(selectedProcedure.nameKey)}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent flex flex-col justify-end p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] tracking-widest text-cyan-200 uppercase font-bold">
                        {t(`category.${selectedProcedure.category === 'skin' ? 'injectables' : selectedProcedure.category === 'face' ? 'surgical_face' : selectedProcedure.category === 'breast' ? 'breast_aesthetics' : 'body_contouring'}`)}
                      </span>
                      <h2 className="font-serif text-2.5xl sm:text-3.5xl text-white mt-1 leading-tight tracking-tight">
                        {t(selectedProcedure.nameKey)}
                      </h2>
                    </div>
                    <button
                      onClick={() => setSelectedProcedure(null)}
                      className="p-1.5 bg-black/40 text-white hover:text-cyan-300 rounded-full border border-white/20 cursor-pointer self-start"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Technical Parameter Quick Matrix Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-[#EBE6DF] bg-[#FCFBF9] text-xs">
                <div className="p-4 border-r border-b sm:border-b-0 border-[#EBE6DF]">
                  <p className="text-[10px] text-[#7C6C63] uppercase font-bold tracking-wider">{language === 'es' ? 'Duración' : 'Duration'}</p>
                  <p className="font-semibold text-[#2D211A] mt-1">{getLocalizedStr(selectedProcedure.duration)}</p>
                </div>
                <div className="p-4 border-r border-b sm:border-b-0 border-[#EBE6DF]">
                  <p className="text-[10px] text-[#7C6C63] uppercase font-bold tracking-wider">{language === 'es' ? 'Anestesia' : 'Anesthesia'}</p>
                  <p className="font-semibold text-[#2D211A] mt-1">{getLocalizedStr(selectedProcedure.anesthesia)}</p>
                </div>
                <div className="p-4 border-r border-[#EBE6DF]">
                  <p className="text-[10px] text-[#7C6C63] uppercase font-bold tracking-wider">{language === 'es' ? 'Internación' : 'Hospital Stay'}</p>
                  <p className="font-semibold text-[#2D211A] mt-1">{getLocalizedStr(selectedProcedure.hospitalStay)}</p>
                </div>
                <div className="p-4">
                  <p className="text-[10px] text-[#7C6C63] uppercase font-bold tracking-wider">{language === 'es' ? 'Recuperación' : 'Recovery'}</p>
                  <p className="font-semibold text-[#2D211A] mt-1">{getLocalizedStr(selectedProcedure.recovery)}</p>
                </div>
              </div>

              {/* Scars Notice Alert Banner */}
              <div className="px-6 py-3 bg-cyan-50/50 border-b border-[#EBE6DF] flex items-start space-x-2.5 text-xs text-[#5C4D44]">
                <Info className="w-4.5 h-4.5 text-[#0373bb] shrink-0 mt-0.5" />
                <p>
                  <strong>{language === 'es' ? 'Cicatrices Clínicas: ' : 'Incisions & Scars: '}</strong>
                  {getLocalizedStr(selectedProcedure.scars)}
                </p>
              </div>

              {/* Detail Navigation Tabs */}
              <div className="flex border-b border-[#EBE6DF]">
                <button
                  onClick={() => setActiveDetailTab('overview')}
                  className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 text-center cursor-pointer transition-all ${
                    activeDetailTab === 'overview'
                      ? 'border-[#0373bb] text-[#0373bb] bg-cyan-50/10'
                      : 'border-transparent text-neutral-400 hover:text-[#2D211A]'
                  }`}
                >
                  {language === 'es' ? 'Descripción y Beneficios' : 'Overview & Benefits'}
                </button>
                <button
                  onClick={() => setActiveDetailTab('guidelines')}
                  className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 text-center cursor-pointer transition-all ${
                    activeDetailTab === 'guidelines'
                      ? 'border-[#0373bb] text-[#0373bb] bg-cyan-50/10'
                      : 'border-transparent text-neutral-400 hover:text-[#2D211A]'
                  }`}
                >
                  {language === 'es' ? 'Instrucciones Pre / Post' : 'Pre / Post-Op Guidelines'}
                </button>
                <button
                  onClick={() => setActiveDetailTab('faqs')}
                  className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 text-center cursor-pointer transition-all ${
                    activeDetailTab === 'faqs'
                      ? 'border-[#0373bb] text-[#0373bb] bg-cyan-50/10'
                      : 'border-transparent text-neutral-400 hover:text-[#2D211A]'
                  }`}
                >
                  {language === 'es' ? 'Preguntas Frecuentes' : 'Procedure FAQs'}
                </button>
              </div>

              {/* Tab Contents Frame */}
              <div className="p-6 sm:p-8 space-y-6 max-h-[460px] overflow-y-auto">
                
                {/* 1. Overview & Benefits */}
                {activeDetailTab === 'overview' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    
                    <div className="space-y-2">
                      <h4 className="text-xs uppercase tracking-wider text-[#0373bb] font-bold">
                        {language === 'es' ? 'Resumen del Procedimiento' : 'Procedure Summary'}
                      </h4>
                      <p className="text-xs sm:text-sm text-[#5C4D44] leading-relaxed">
                        {getLocalizedStr(selectedProcedure.overview)}
                      </p>
                    </div>

                    <div className="space-y-2 p-4.5 bg-neutral-50 rounded-2xl border border-neutral-100">
                      <div className="flex items-center space-x-2 text-[#2D211A]">
                        <Heart className="w-4 h-4 text-rose-500" />
                        <h4 className="font-sans text-xs font-bold uppercase tracking-wide">
                          {language === 'es' ? 'Candidato Ideal' : 'The Ideal Candidate'}
                        </h4>
                      </div>
                      <p className="text-xs text-[#7C6C63] leading-relaxed mt-1">
                        {getLocalizedStr(selectedProcedure.idealCandidate)}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs uppercase tracking-wider text-[#0373bb] font-bold">
                        {language === 'es' ? 'Beneficios Principales' : 'Key Aesthetic Benefits'}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {getLocalizedArray(selectedProcedure.benefits).map((benefit, idx) => (
                          <div key={idx} className="flex items-start space-x-2.5 text-xs text-[#2D211A]">
                            <div className="bg-emerald-50 text-emerald-600 p-0.5 rounded-full shrink-0 mt-0.5">
                              <Check className="w-3 h-3" />
                            </div>
                            <span className="leading-tight">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* 2. Guidelines (Pre and Post Operative Care) */}
                {activeDetailTab === 'guidelines' && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    
                    {/* Pre-Op Instructions */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 border-b pb-2">
                        <FileText className="w-4 h-4 text-[#0373bb]" />
                        <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-[#2D211A]">
                          {language === 'es' ? 'Preparación Pre-Operatoria' : 'Pre-Operative Preparation'}
                        </h4>
                      </div>
                      <div className="space-y-3.5">
                        {getLocalizedArray(selectedProcedure.preOp).map((step, idx) => (
                          <div key={idx} className="flex items-start space-x-3 text-xs text-[#5C4D44]">
                            <span className="w-5 h-5 bg-[#0373bb]/10 text-[#0373bb] rounded-full flex items-center justify-center font-bold shrink-0 text-[10px]">
                              {idx + 1}
                            </span>
                            <p className="leading-relaxed pt-0.5">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Post-Op Recovery */}
                    <div className="space-y-4 pt-4">
                      <div className="flex items-center space-x-2 border-b pb-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-[#2D211A]">
                          {language === 'es' ? 'Recuperación Post-Operatoria' : 'Post-Operative Recovery Care'}
                        </h4>
                      </div>
                      <div className="space-y-3.5">
                        {getLocalizedArray(selectedProcedure.postOp).map((step, idx) => (
                          <div key={idx} className="flex items-start space-x-3 text-xs text-[#5C4D44]">
                            <span className="w-5 h-5 bg-amber-500/10 text-amber-600 rounded-full flex items-center justify-center font-bold shrink-0 text-[10px]">
                              {idx + 1}
                            </span>
                            <p className="leading-relaxed pt-0.5">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* 3. Interactive FAQs */}
                {activeDetailTab === 'faqs' && (
                  <div className="space-y-4.5 animate-in fade-in duration-300">
                    {selectedProcedure.faqs.map((faq, idx) => (
                      <div key={idx} className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/40 space-y-2">
                        <div className="flex items-start space-x-2 text-xs font-bold text-[#2D211A]">
                          <HelpCircle className="w-4 h-4 text-[#0373bb] shrink-0 mt-0.5" />
                          <p className="leading-tight">{getLocalizedStr(faq.q)}</p>
                        </div>
                        <p className="text-xs text-[#7C6C63] leading-relaxed pl-6">
                          {getLocalizedStr(faq.a)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

              </div>

              {/* Footer Booking Bar */}
              <div className="px-6 py-5 bg-[#FCFBF9] border-t border-[#EBE6DF] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-[10px] text-neutral-400 font-semibold uppercase">{language === 'es' ? 'Atención Bilingüe Especializada' : 'Bilingual Clinical Assistance'}</p>
                  <p className="text-xs text-[#2D211A] font-bold mt-0.5">Santo Domingo Clinic Board</p>
                </div>
                <button
                  onClick={() => handleBookProcedure(selectedProcedure)}
                  className="w-full sm:w-auto px-6 py-3 bg-[#0373bb] hover:bg-[#025c96] text-white text-xs font-bold tracking-wider uppercase rounded-full shadow-xs hover:shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{language === 'es' ? 'Programar Procedimiento' : 'Book This Procedure'}</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Footer Branding Bar */}
      <div className="bg-[#2D211A] py-6 border-t border-[#3D3028] text-white/50 text-[11px] font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <span>Dr. Victor Estrella • Aesthetic & Reconstructive Surgery</span>
          <span>© 2026 Santo Domingo, Dominican Republic.</span>
        </div>
      </div>

    </div>
  );
}
