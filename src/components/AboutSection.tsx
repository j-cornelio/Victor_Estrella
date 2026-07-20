import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Award, BookOpen, ShieldCheck, Heart, MapPin, CheckCircle2 } from 'lucide-react';

export default function AboutSection() {
  const { t } = useLanguage();

  const credentials = [
    {
      icon: <BookOpen className="w-5 h-5 text-cyan-500" />,
      title: t('about.cred.1.title'),
      description: t('about.cred.1.desc'),
      description2: t('about.cred.1.desc_extra')
    },
    {
      icon: <Award className="w-5 h-5 text-cyan-500" />,
      title: t('about.cred.2.title'),
      description: t('about.cred.2.desc_extra'),
      description2: t('about.cred.2.desc')
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-cyan-500" />,
      title: t('about.cred.3.title'),
      description: t('about.cred.3.desc')
    }
  ];

  const pillars = [
    {
      title: t('about.pillar.1.title'),
      subtitle: t('about.pillar.1.desc')
    },
    {
      title: t('about.pillar.2.title'),
      subtitle: t('about.pillar.2.desc')
    },
    {
      title: t('about.pillar.3.title'),
      subtitle: t('about.pillar.3.desc')
    },
    {
      title: t('about.pillar.4.title'),
      subtitle: t('about.pillar.4.desc')
    }
  ];

  return (
    <section id="about" className="py-20 bg-white scroll-mt-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-6 border-b border-[#EBE6DF]">
          <div className="max-w-2xl text-left">
            <span className="text-xs uppercase tracking-widest text-[#0373bb] font-bold">
              {t('about.title')}
            </span>
            <h2 className="font-serif text-3xl sm:text-4.5xl text-[#2D211A] tracking-tight mt-2">
              {t('about.heading')}
            </h2>
          </div>
          <div className="mt-4 md:mt-0 max-w-sm text-left md:text-right">
            <p className="text-xs sm:text-sm text-[#7C6C63] font-medium uppercase tracking-wider">
              {t('about.subheading')}
            </p>
          </div>
        </div>

        {/* Hero Bio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-24 bg-[#5ab6cf] p-8 sm:p-12 rounded-none text-white">
          
          {/* Column 1: Portrait */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-[#EBE6DF]/20 rounded-none translate-x-4 translate-y-4 -z-10" />
            <div className="relative rounded-none overflow-hidden border border-[#FCFBF9] shadow-xl bg-neutral-100 aspect-[3/4]">
              <img
                src="https://res.cloudinary.com/dkicj8zmk/image/upload/v1784122805/vic_light_gray_bg_cr2ltw.png"
                alt="Dr. Victor Estrella, MD"
                className="w-full h-full object-cover hover:scale-102 transition-all duration-700 border border-white/10"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 text-white text-left">
                <p className="text-xs tracking-widest uppercase text-cyan-300 font-semibold">{t('about.chief')}</p>
                <h3 className="font-serif text-2xl font-light mt-1">Dr. Victor Estrella, MD</h3>
                <p className="text-xs text-white/85 mt-1 font-mono tracking-wider">{t('about.reg')}</p>
              </div>
            </div>
          </div>

          {/* Column 2: Biography details */}
          <div className="lg:col-span-7 text-left space-y-6">
            <span className="inline-block px-4 py-1.5 bg-white/10 border border-white/20 rounded-none text-[13px] uppercase tracking-wider font-bold text-white">
              {t('about.visionary')}
            </span>
            <h3 className="font-serif text-2.5xl sm:text-3.5xl text-white leading-tight font-light">
              {t('about.quote')}
            </h3>
            
            <div className="space-y-4 text-sm sm:text-base text-white/95 leading-relaxed">
              <p>
                {t('about.para1')}
              </p>
              <p>
                {t('about.para2')}
              </p>
            </div>

            {/* Signature or Badge */}
            <div className="pt-4 flex items-center space-x-4 border-t border-white/20">
              <div className="w-12 h-12 rounded-none bg-white/15 flex items-center justify-center text-white">
                <Heart className="w-6 h-6 fill-current" />
              </div>
              <div>
                <p className="font-serif text-sm font-bold text-white">{t('about.mission_title')}</p>
                <p className="text-xs text-white/80">{t('about.mission_desc')}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Credentials & Affiliations section */}
        <div className="bg-neutral-50 rounded-3xl p-8 sm:p-12 border border-[#EBE6DF] text-left mb-24">
          <div className="max-w-3xl mb-10">
            <h3 className="font-serif text-xl sm:text-2xl text-[#2D211A] font-medium">
              {t('about.board_title')}
            </h3>
            <p className="text-xs sm:text-sm text-[#7C6C63] mt-2">
              {t('about.board_desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {credentials.map((cred, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-neutral-200/60 shadow-xs space-y-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center">
                  {cred.icon}
                </div>
                <h4 className="font-sans text-sm font-bold text-[#2D211A] uppercase tracking-wide">
                  {cred.title}
                </h4>
                <p className="text-xs text-[#7C6C63] leading-relaxed">
                  {cred.description}
                </p>
                {cred.description2 && (
                  <p className="text-xs text-[#7C6C63] leading-relaxed mt-2">
                    {cred.description2}
                  </p>
                )}
                {idx === 1 && (
                  <p className="text-xs text-[#7C6C63] leading-relaxed mt-2">
                    Sodocipre
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Core Pillars / Philosophy of Care */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-4 text-left space-y-4">
            <span className="text-xs uppercase tracking-widest text-[#0373bb] font-bold block">
              {t('about.pillars.title')}
            </span>
            <h3 className="font-serif text-2xl sm:text-3.5xl text-[#2D211A] leading-tight font-light">
              {t('about.pillars.heading')}
            </h3>
            <p className="text-xs sm:text-sm text-[#7C6C63] leading-relaxed">
              {t('about.pillars.desc')}
            </p>

          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            {pillars.map((pillar, idx) => (
              <div key={idx} className="p-6 bg-white rounded-2xl border border-[#EBE6DF] hover:border-cyan-200 transition-all duration-300 flex items-start space-x-4">
                <CheckCircle2 className="w-5 h-5 text-[#0373bb] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-sans text-sm font-bold text-[#2D211A] uppercase tracking-wider">
                    {pillar.title}
                  </h4>
                  <p className="text-xs text-[#7C6C63] mt-1.5 leading-relaxed">
                    {pillar.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
