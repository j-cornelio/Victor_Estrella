import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { SPECIALISTS } from '../data';
import { Specialist } from '../types';
import { Star, Shield, ArrowUpRight, Award } from 'lucide-react';

interface SpecialistsSectionProps {
  onSelectSpecialist: (specialistId: string) => void;
}

export default function SpecialistsSection({ onSelectSpecialist }: SpecialistsSectionProps) {
  const { t } = useLanguage();

  return (
    <section id="specialists" className="py-20 bg-neutral-50 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-[#EBE6DF]">
          <div className="max-w-2xl text-left">
            <span className="text-xs uppercase tracking-widest text-[#0373bb] font-bold">
              {t('specialists.subtitle')}
            </span>
            <h2 className="font-serif text-3xl sm:text-4.5xl text-[#2D211A] tracking-tight mt-1">
              {t('specialists.heading')}
            </h2>
            <p className="text-sm sm:text-base text-[#7C6C63] mt-3 leading-relaxed">
              {t('specialists.desc')}
            </p>
          </div>
        </div>

        {/* Specialists grid - exactly styled like the sixth image */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {SPECIALISTS.map((specialist) => {
            // Translate Bio
            const bioKey = `specialist.${specialist.id}.bio`;
            const translatedBio = t(bioKey) !== bioKey ? t(bioKey) : specialist.bio;

            // Translate Role
            let translatedRole = specialist.role;
            if (specialist.id === 'dr_estrella') {
              translatedRole = t('specialists.role.director');
            } else if (specialist.id === 'dr_sinclair') {
              translatedRole = t('specialists.role.associate');
            }

            return (
              <div
                key={specialist.id}
                className="bg-white rounded-2xl border border-[#EBE6DF] hover:border-[#0373bb] overflow-hidden transition-all duration-300 shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Photo container */}
                  <div className="relative h-64 bg-neutral-50 overflow-hidden">
                    <img
                      src={specialist.image}
                      alt={specialist.name}
                      className="w-full h-full object-cover grayscale-25 group-hover:grayscale-0 transition-all duration-500"
                      referrerPolicy="no-referrer"
                    />
                    {specialist.role.includes('MD') && (
                      <span className="absolute top-3.5 left-3.5 bg-[#0373bb] text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center space-x-1 shadow-sm">
                        <Award className="w-3 h-3" />
                        <span>MD Surgeon</span>
                      </span>
                    )}
                  </div>

                  {/* Professional Data */}
                  <div className="p-5 text-left space-y-2.5">
                    <div className="flex items-center space-x-1 text-yellow-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>

                    <div>
                      <h3 className="font-sans text-base font-bold text-[#2D211A]">
                        {specialist.name}
                      </h3>
                      <p className="text-[10px] tracking-wider font-semibold text-[#0373bb] uppercase mt-1">
                        {translatedRole}
                      </p>
                    </div>

                    <p className="text-xs text-[#7C6C63] leading-relaxed line-clamp-3">
                      {translatedBio}
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <div className="p-5 pt-0">
                  <button
                    onClick={() => onSelectSpecialist(specialist.id)}
                    className="w-full py-2.5 bg-neutral-100 hover:bg-[#0373bb] text-[#5C4D44] hover:text-white rounded-full text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <span>{t('general.consultation').split(' ')[0]}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
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
