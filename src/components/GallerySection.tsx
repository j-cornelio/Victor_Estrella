import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { GALLERY_ITEMS } from '../data';
import { GalleryItem } from '../types';
import { ChevronLeft, ChevronRight, Sparkles, SlidersHorizontal, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface GallerySectionProps {
  isPageMode?: boolean;
  onClose?: () => void;
  onNavigateToGallery?: () => void;
}

export default function GallerySection({
  isPageMode = false,
  onClose,
  onNavigateToGallery
}: GallerySectionProps) {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [sliderPositions, setSliderPositions] = useState<{ [key: string]: number }>({
    g3: 50,
    g4: 50,
    g5: 50,
    g6: 50,
    g7: 50,
    g8: 50
  });

  const categories = ['all', 'Breast Aesthetics', 'Body Contouring'];

  const filteredItems = activeCategory === 'all'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter(item => item.category === activeCategory);

  const displayedItems = isPageMode ? filteredItems : filteredItems.slice(0, 2);

  const handleSliderChange = (id: string, val: number) => {
    setSliderPositions(prev => ({
      ...prev,
      [id]: val
    }));
  };

  return (
    <div className={isPageMode ? "min-h-screen bg-[#FCFBF9] flex flex-col justify-between" : ""}>
      
      {isPageMode && (
        /* Upper Navigation Bar */
        <div className="border-b border-[#EBE6DF] bg-white sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <button
              onClick={onClose}
              className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#5C4D44] hover:text-[#0373bb] transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>{t('gallery.back_home')}</span>
            </button>

            <span className="text-[10px] bg-cyan-50 border border-cyan-100 text-[#0373bb] px-3 py-1 rounded-full uppercase tracking-widest font-bold font-sans">
              Santo Domingo • Clinical Outcomes
            </span>
          </div>
        </div>
      )}

      <section id="gallery" className={`py-20 ${isPageMode ? 'bg-[#FCFBF9] flex-1' : 'bg-white'} scroll-mt-20`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-[#EBE6DF]">
            <div className="max-w-2xl text-left">
              <span className="text-xs uppercase tracking-widest text-[#0373bb] font-bold">
                {t('gallery.subtitle')}
              </span>
              <h2 className="font-serif text-3xl sm:text-4.5xl text-[#2D211A] tracking-tight mt-1">
                {t('gallery.heading')}
              </h2>
              <p className="text-sm sm:text-base text-[#7C6C63] mt-3 leading-relaxed">
                {t('gallery.desc')}
              </p>
            </div>

            {/* Categories Tab Filters */}
            <div className="mt-6 md:mt-0 flex flex-wrap gap-2">
              {categories.map((cat) => {
                // Translate Tab Label
                let label = cat;
                if (cat === 'all') {
                  label = t('gallery.all');
                } else {
                  const catKey = `category.${cat.toLowerCase().replace(/\s+/g, '_')}`;
                  label = t(catKey) !== catKey ? t(catKey) : cat;
                }

                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4.5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                      activeCategory === cat
                        ? 'bg-[#0373bb] text-white shadow-xs'
                        : 'bg-neutral-100 text-[#5C4D44] hover:bg-neutral-200'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Interactive Slide comparison grid */}
          <div className="flex flex-wrap justify-center gap-10">
            {displayedItems.map((item) => {
              const sliderPos = sliderPositions[item.id] !== undefined ? sliderPositions[item.id] : 50;
              
              // Translate case title if needed
              const caseKey = `gallery.${item.id}.title`;
              const translatedTitle = t(caseKey) !== caseKey ? t(caseKey) : item.title;

              // Translate category if needed
              const catKey = `category.${item.category.toLowerCase().replace(/\s+/g, '_')}`;
              const translatedCategory = t(catKey) !== catKey ? t(catKey) : item.category;

              return (
                <div
                  key={item.id}
                  className="w-full md:w-[35%] bg-white rounded-3xl border border-[#EBE6DF] hover:border-[#0373bb] overflow-hidden transition-all duration-300 p-4 shadow-xs hover:shadow-md flex flex-col justify-between"
                >
                  {/* The before / after interactive sliding canvas */}
                  <div
                    className="relative h-[220px] sm:h-[280px] rounded-2xl overflow-hidden select-none"
                    onMouseEnter={() => setHoveredItemId(item.id)}
                    onMouseLeave={() => setHoveredItemId(null)}
                  >
                    {/* Before state (Full width background) */}
                    <div className="absolute inset-0 bg-[#FCFBF9]">
                      <img
                        src={item.before}
                        alt="Before treatment"
                        className={`w-full h-full ${item.objectFit === 'contain' ? 'object-contain bg-white' : 'object-cover'}`}
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* After state (Clipped width based on slider) */}
                    <div
                      className="absolute inset-y-0 left-0 right-0 overflow-hidden bg-[#FCFBF9]"
                      style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
                    >
                      <img
                        src={item.after}
                        alt="After treatment"
                        className={`absolute inset-0 w-full h-full ${item.objectFit === 'contain' ? 'object-contain bg-white' : 'object-cover'}`}
                        referrerPolicy="no-referrer"
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>

                    {/* After Badge (On the left) */}
                    <div className={`absolute top-4 left-4 bg-[#0373bb]/90 text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border border-cyan-400/20 z-10 pointer-events-none transition-opacity duration-300 ${
                      sliderPos <= 5 ? 'opacity-0' : 'opacity-100'
                    }`}>
                      {t('gallery.after')}
                    </div>

                    {/* Before Badge (On the right) */}
                    <div className={`absolute top-4 right-4 bg-black/60 text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border border-white/20 z-10 pointer-events-none transition-opacity duration-300 ${
                      sliderPos >= 95 ? 'opacity-0' : 'opacity-100'
                    }`}>
                      {t('gallery.before')}
                    </div>

                    {/* Vertical bar dividing before and after */}
                    <div
                      className="absolute inset-y-0 w-1 bg-white cursor-ew-resize flex items-center justify-center z-20 shadow-lg pointer-events-none"
                      style={{ left: `${sliderPos}%` }}
                    >
                      <div className="w-8 h-8 rounded-full bg-white border-2 border-[#0373bb] flex items-center justify-center text-[#0373bb] shadow-md">
                        <SlidersHorizontal className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Hidden Slider Range Input overlays to allow dragging */}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderPos}
                      onChange={(e) => handleSliderChange(item.id, Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                    />
                  </div>

                  {/* Patient / procedure footer data */}
                  <div className="pt-5 pb-1 px-2 text-left flex items-start justify-between">
                    <div>
                      <span className="text-[10px] tracking-widest font-bold text-[#0373bb] uppercase">
                        {translatedCategory}
                      </span>
                      <h3 className="font-serif text-lg text-[#2D211A] font-medium mt-0.5">
                        {translatedTitle}
                      </h3>
                    </div>
                    <div className="bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-100 flex items-center space-x-1.5 text-[11px] text-neutral-500">
                      <Sparkles className="w-3.5 h-3.5 text-[#0373bb]" />
                      <span>{t('gallery.drag_compare')}</span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Homepage Preview Only: SEE MORE Button */}
          {!isPageMode && onNavigateToGallery && (
            <div className="mt-12 flex justify-center">
              <motion.button
                onClick={onNavigateToGallery}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2.5 bg-[#0373bb] hover:bg-[#025c96] text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer group"
              >
                <span>{t('gallery.see_more')}</span>
                <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          )}

        </div>
      </section>

      {isPageMode && (
        /* Footer Branding Bar */
        <div className="bg-[#2D211A] py-6 border-t border-[#3D3028] text-white/50 text-[11px] font-mono">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <span>Dr. Victor Estrella • Aesthetic & Reconstructive Surgery</span>
            <span>© 2026 Santo Domingo, Dominican Republic.</span>
          </div>
        </div>
      )}

    </div>
  );
}
