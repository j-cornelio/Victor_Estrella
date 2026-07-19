import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { SERVICES } from '../data';
import { Sparkles, Calendar, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface ServicesSectionProps {
  onOpenConsultation: (specialistId?: string, procedureName?: string) => void;
  onNavigateToProcedures: (category?: string, procedureId?: string | null) => void;
}

export default function ServicesSection({ onOpenConsultation, onNavigateToProcedures }: ServicesSectionProps) {
  const { t, language } = useLanguage();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  return (
    <section id="services" className="py-20 bg-neutral-50 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-[#EBE6DF]">
          <div className="max-w-2xl text-left">
            <span className="text-xs uppercase tracking-widest text-[#0373bb] font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {t('services.portfolio')}
            </span>
            <h2 className="font-serif text-3xl sm:text-4.5xl text-[#2D211A] tracking-tight mt-1">
              {t('services.heading')}
            </h2>
            <p className="text-sm sm:text-base text-[#7C6C63] mt-3 leading-relaxed">
              {t('services.desc')}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => onNavigateToProcedures('all', null)}
              className="inline-flex items-center space-x-2 border border-[#0373bb] text-[#0373bb] hover:bg-[#0373bb] hover:text-white px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 cursor-pointer"
            >
              <span>{language === 'es' ? 'Ver Biblioteca de Cirugías' : 'View Surgical Library'}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {SERVICES.map((service) => {
            const isExpanded = selectedServiceId === service.id;
            
            // Translate values with fallback
            const titleTranslation = t(`services.${service.id}.title`);
            const descTranslation = t(`services.${service.id}.desc`);
            const detailsTranslation = t(`services.${service.id}.details`);

            return (
              <div
                key={service.id}
                id={`service-card-${service.id}`}
                className="bg-white rounded-2xl border border-[#EBE6DF] hover:border-[#0373bb] overflow-hidden transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                {/* Image & Title Header */}
                <div>
                  <div className="relative h-64 sm:h-72 overflow-hidden group">
                    <img
                      src={service.image}
                      alt={`${service.title} aesthetics`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end p-6">
                      <div className="text-left">
                        <span className="text-[10px] tracking-widest text-cyan-200 uppercase font-bold">
                          {t('services.premium_category')}
                        </span>
                        <h3 className="font-serif text-2xl sm:text-3xl text-white mt-1">
                          {titleTranslation} {t('nav.aesthetics')}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Description & List */}
                  <div className="p-6 sm:p-8 space-y-5 text-left">
                    <p className="text-[#5C4D44] text-sm sm:text-base leading-relaxed">
                      {descTranslation}
                    </p>

                    <div className="space-y-2.5">
                      <span className="text-xs uppercase tracking-wider text-neutral-400 font-bold block mb-1">
                        {t('services.featured_treatments')}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {service.procedures.map((proc, index) => {
                          // Extensible: check if we have a specific procedure translation
                          const procKey = `procedure.${proc.toLowerCase().replace(/\s+/g, '_')}`;
                          const translatedProc = t(procKey) !== procKey ? t(procKey) : proc;
                          
                          // Resolve target procedure ID for deep-linking
                          let procId = proc.toLowerCase().replace(/[^a-z0-9_]/g, '_');
                          if (procId.includes('rhinoplasty')) procId = 'rhinoplasty';
                          else if (procId.includes('facelift') || procId.includes('lifting')) procId = 'facelift';
                          else if (procId.includes('blepharoplasty') || procId.includes('blef')) procId = 'blepharoplasty';
                          else if (procId.includes('augmentation')) procId = 'breast_augmentation';
                          else if (procId.includes('lift') && service.id === 'breast') procId = 'breast_lift';
                          else if (procId.includes('lipo')) procId = 'liposuction';
                          else if (procId.includes('tuck') || procId.includes('abdominoplasty')) procId = 'abdominoplasty';
                          else if (procId.includes('botox') || procId.includes('filler') || service.id === 'skin') procId = 'botox_fillers';

                          return (
                            <button
                              key={index}
                              onClick={() => onNavigateToProcedures(service.id, procId)}
                              className="flex items-center space-x-2 text-xs sm:text-sm text-[#2D211A] hover:text-[#0373bb] font-medium transition-colors cursor-pointer text-left group"
                            >
                              <CheckCircle2 className="w-4 h-4 text-[#0373bb] shrink-0 group-hover:scale-110 transition-transform" />
                              <span className="underline decoration-dotted group-hover:decoration-solid">{translatedProc}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Detailed info expandable */}
                    {isExpanded && (
                      <div className="pt-4 border-t border-neutral-100 text-xs sm:text-sm text-[#7C6C63] leading-relaxed animate-in fade-in duration-300 space-y-3">
                        <p>{detailsTranslation}</p>
                        <button
                          onClick={() => onNavigateToProcedures(service.id, null)}
                          className="inline-flex items-center space-x-1 text-xs text-[#0373bb] font-bold hover:underline"
                        >
                          <span>{language === 'es' ? 'Ver guías clínicas de recuperación' : 'View full recovery guidelines'}</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card footer actions */}
                <div className="p-6 sm:p-8 pt-0 border-t border-[#FCFBF9] flex items-center justify-between">
                  <button
                    onClick={() => setSelectedServiceId(isExpanded ? null : service.id)}
                    className="text-xs font-semibold uppercase tracking-wider text-[#0373bb] hover:text-[#0373bb]/85 transition-colors cursor-pointer"
                  >
                    {isExpanded ? t('services.show_less') : t('services.learn_more')}
                  </button>
                  <button
                    onClick={() => onNavigateToProcedures(service.id, null)}
                    className="flex items-center space-x-2 bg-[#0373bb] hover:bg-[#0373bb]/90 text-white text-xs sm:text-sm font-semibold tracking-wide px-5 py-2.5 rounded-full shadow-xs hover:shadow-sm transition-all cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{language === 'es' ? `Ver ${titleTranslation}` : `View ${titleTranslation}`}</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
