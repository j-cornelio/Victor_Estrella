import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { TESTIMONIALS } from '../data';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

export default function TestimonialsSection() {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1));
  };

  return (
    <section id="testimonials" className="py-20 bg-[#b8e1ef] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-[#EBE6DF]">
          <div className="max-w-2xl text-left">
            <span className="text-xs uppercase tracking-widest text-[#0373bb] font-bold">
              {t('testimonials.subtitle')}
            </span>
            <h2 className="font-serif text-3xl sm:text-4.5xl text-[#2D211A] tracking-tight mt-1">
              {t('testimonials.heading')}
            </h2>
            <p className="text-sm sm:text-base text-[#7C6C63] mt-3 leading-relaxed">
              {t('testimonials.desc')}
            </p>
          </div>

          {/* Slider Arrows */}
          <div className="mt-6 md:mt-0 flex items-center space-x-2.5">
            <button
              onClick={handlePrev}
              className="p-3 bg-white border border-[#EBE6DF] hover:border-[#0373bb] rounded-full text-[#5C4D44] hover:text-[#0373bb] shadow-xs hover:shadow-sm transition-all cursor-pointer"
              aria-label="Previous Testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="p-3 bg-white border border-[#EBE6DF] hover:border-[#0373bb] rounded-full text-[#5C4D44] hover:text-[#0373bb] shadow-xs hover:shadow-sm transition-all cursor-pointer"
              aria-label="Next Testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel / Grid Display */}
        <div className="relative overflow-hidden py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.slice(0, 3).map((item, idx) => {
              // Highlight the middle card on desktop
              const isCenter = idx === 1;

              // Translate Quote / Title if keys exist
              const titleKey = `testimonial.${item.id}.title`;
              const translatedTitle = t(titleKey) !== titleKey ? t(titleKey) : item.title;

              const quoteKey = `testimonial.${item.id}.quote`;
              const translatedQuote = t(quoteKey) !== quoteKey ? t(quoteKey) : item.quote;

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-3xl p-8 border hover:border-[#0373bb] flex flex-col justify-between text-left transition-all duration-300 shadow-xs hover:shadow-md ${
                    isCenter 
                      ? 'border-[#0373bb] md:translate-y-[-8px]' 
                      : 'border-[#EBE6DF]'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Stars and Quote sign */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-yellow-500">
                        {Array.from({ length: item.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <Quote className="w-7 h-7 text-[#0373bb]/15" />
                    </div>

                    {/* Testimonial text info */}
                    <h4 className="font-sans text-sm font-bold tracking-tight text-[#2D211A] uppercase">
                      {translatedTitle}
                    </h4>
                    
                    <p className="text-xs sm:text-sm text-[#5C4D44] leading-relaxed italic">
                      "{translatedQuote}"
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-neutral-100 flex items-center justify-between">
                    <div>
                      <h5 className="font-sans text-xs sm:text-sm font-bold text-[#2D211A]">
                        {item.author}
                      </h5>
                      <span className="text-[10px] text-neutral-400 font-semibold uppercase">
                        {item.source}
                      </span>
                    </div>
                    <span className="text-[10px] bg-[#F2FBFB] text-[#0373bb] px-2.5 py-1 rounded-full uppercase tracking-wider font-bold border border-cyan-100">
                      RealSelf Verified
                    </span>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center space-x-2 mt-10">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i % TESTIMONIALS.length)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  currentIndex === i ? 'w-8 bg-[#0373bb]' : 'w-2.5 bg-[#EBE6DF]'
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
