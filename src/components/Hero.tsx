import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface HeroProps {
  onOpenConsultation: () => void;
}

export default function Hero({ onOpenConsultation }: HeroProps) {
  const { t } = useLanguage();
  return (
    <section id="hero" className="relative bg-[#0373bb] text-white overflow-hidden">
      {/* Dynamic Keyframes for Background Contour Lines */}
      <style>{`
        @keyframes contourDash {
          to {
            stroke-dashoffset: -160;
          }
        }
        @keyframes contourPulse {
          0%, 100% {
            transform: scale(1) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.06) rotate(3deg);
            opacity: 0.6;
          }
        }
        @keyframes contourPulseSlow {
          0%, 100% {
            transform: scale(1) rotate(0deg);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.08) rotate(-4deg);
            opacity: 0.55;
          }
        }
        @keyframes driftHorizontal {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-20px) translateX(15px);
          }
        }
        .contour-line {
          animation: contourDash 10s linear infinite;
        }
        .contour-group-1 {
          animation: contourPulse 12s ease-in-out infinite;
          transform-origin: center;
        }
        .contour-group-2 {
          animation: contourPulseSlow 18s ease-in-out infinite;
          transform-origin: center;
        }
        .contour-drift {
          animation: driftHorizontal 15s ease-in-out infinite;
        }
      `}</style>

      {/* Background patterns */}
      <div className="absolute inset-0 opacity-15">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Floating background contour lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <svg className="absolute w-full h-full opacity-40" viewBox="0 0 1000 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Huge swirling flow lines in the background */}
          <path
            d="M-100,200 Q200,100 500,400 T1100,200"
            stroke="#a5f3fc"
            strokeWidth="2"
            strokeDasharray="15 15"
            className="contour-line"
            style={{ animationDuration: '14s' }}
          />
          <path
            d="M-50,350 Q300,150 700,600 T1200,300"
            stroke="#67e8f9"
            strokeWidth="1.5"
            strokeDasharray="10 10"
            className="contour-line"
            style={{ animationDuration: '20s', animationDirection: 'reverse' }}
          />
          <path
            d="M-200,600 Q250,500 600,800 T1300,700"
            stroke="#22d3ee"
            strokeWidth="2"
            strokeDasharray="20 15"
            className="contour-line"
            style={{ animationDuration: '16s' }}
          />
        </svg>
      </div>

      {/* Decorative large circles */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full border border-white/20 pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full border border-white/10 pointer-events-none" />

      {/* Giant repeating stacked outline text (Inspired by image 2) */}
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex flex-col justify-center space-y-2 select-none pointer-events-none z-0 overflow-hidden w-full max-w-7xl">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="text-[12vw] font-bold text-center tracking-widest text-transparent opacity-10 leading-none uppercase"
            style={{
              WebkitTextStroke: '1px rgba(255, 255, 255, 0.4)',
              transform: `translateX(${(i % 2 === 0 ? 1 : -1) * 30}px)`
            }}
          >
            {t('hero.dr_estrella')}
          </div>
        ))}
      </div>

      {/* Absolute Image for Desktop, spanning exactly from top to bottom of the blue background block */}
      <div className="hidden lg:flex absolute right-[6%] xl:right-[10%] bottom-0 top-0 w-[40%] items-end justify-center overflow-hidden pointer-events-none z-10">
        <img
          src="https://res.cloudinary.com/dkicj8zmk/image/upload/v1784121483/model_transparent_foefx8.png"
          alt="Model Transparent Lines"
          className="h-full w-auto object-contain object-bottom select-none relative z-10"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Hero Content Grid */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-16 md:pt-24 md:pb-24 lg:pt-28 lg:pb-28 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Badges & Brand Intentions */}
          <div className="flex flex-col justify-center items-center lg:items-start space-y-6 text-center lg:text-left order-2 lg:order-1">
            <div className="inline-flex flex-col space-y-2 border-l-0 lg:border-l-4 border-white pl-0 lg:pl-6 items-center lg:items-start">
              <span className="text-[18px] sm:text-[23px] lg:text-xl tracking-[0.25em] font-semibold text-cyan-100 uppercase">
                {t('hero.renew')}
              </span>
              <span className="text-[23px] sm:text-[31px] lg:text-3xl tracking-[0.15em] font-light text-white uppercase leading-tight">
                {t('hero.aesthetic')}
              </span>
              <span className="text-[18px] sm:text-[23px] lg:text-xl tracking-[0.2em] font-semibold text-cyan-200 uppercase">
                {t('hero.newlife')}
              </span>
            </div>
            
            <p className="text-cyan-50/90 text-sm sm:text-base max-w-md leading-relaxed font-sans mx-auto lg:mx-0">
              {t('hero.description')}
            </p>

            <div className="pt-2">
              <button
                onClick={onOpenConsultation}
                className="group flex items-center space-x-3 text-white text-xs sm:text-sm tracking-widest uppercase font-bold hover:text-cyan-200 transition-colors cursor-pointer"
              >
                <span>{t('hero.schedulenow')}</span>
                <span className="bg-white/15 p-2 rounded-full group-hover:translate-x-1.5 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </button>
            </div>
          </div>

          {/* Right Column (Mobile/Tablet Only): Model Transparent Lines Illustration */}
          <div className="flex lg:hidden justify-center items-end relative h-[450px] sm:h-[600px] overflow-hidden order-1 lg:order-2">
            <img
              src="https://res.cloudinary.com/dkicj8zmk/image/upload/v1784121483/model_transparent_foefx8.png"
              alt="Model Transparent Lines"
              className="h-full w-auto max-w-full object-contain relative z-10 select-none border-2 border-cyan-300/60 lg:border-0 rounded-2xl"
              referrerPolicy="no-referrer"
            />
          </div>

        </div>
      </div>

      {/* Sub-hero 3 Columns (Exactly mirroring bottom of image 2) */}
      <div className="bg-white text-[#2D211A] border-y border-[#EBE6DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 divide-y md:divide-y-0 md:divide-x divide-[#EBE6DF] lg:max-w-[60%] w-full">
            
            {/* Column 1 */}
            <div className="pt-6 md:pt-0 lg:px-6 first:pl-0 flex flex-col space-y-3 group hover:translate-y-[-4px] transition-transform duration-300">
              <span className="font-serif text-3xl font-light text-[#0373bb]/80">1</span>
              <h3 className="font-sans text-base font-bold tracking-tight text-[#2D211A] group-hover:text-[#0373bb] transition-colors">
                {t('subhero.2.title')}
              </h3>
              <p className="text-xs sm:text-sm text-[#7C6C63] leading-relaxed">
                {t('subhero.2.desc')}
              </p>
            </div>

            {/* Column 2 */}
            <div className="pt-6 md:pt-0 lg:px-6 flex flex-col space-y-3 group hover:translate-y-[-4px] transition-transform duration-300">
              <span className="font-serif text-3xl font-light text-[#0373bb]/80">2</span>
              <h3 className="font-sans text-base font-bold tracking-tight text-[#2D211A] group-hover:text-[#0373bb] transition-colors">
                {t('subhero.3.title')}
              </h3>
              <p className="text-xs sm:text-sm text-[#7C6C63] leading-relaxed">
                {t('subhero.3.desc')}
              </p>
            </div>

            {/* Column 3 */}
            <div className="pt-6 md:pt-0 lg:px-6 last:pr-0 flex flex-col space-y-3 group hover:translate-y-[-4px] transition-transform duration-300">
              <span className="font-serif text-3xl font-light text-[#0373bb]/80">3</span>
              <h3 className="font-sans text-base font-bold tracking-tight text-[#2D211A] group-hover:text-[#0373bb] transition-colors">
                {t('subhero.4.title')}
              </h3>
              <p className="text-xs sm:text-sm text-[#7C6C63] leading-relaxed">
                {t('subhero.4.desc')}
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
