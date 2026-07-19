import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, Language } from '../context/LanguageContext';
import { Globe, ChevronDown, Check } from 'lucide-react';

interface LanguageOption {
  code: Language;
  label: string;
  flag: string;
  abbreviation: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'es', label: 'Español', flag: '🇪🇸', abbreviation: 'ES' },
  { code: 'en', label: 'English', flag: '🇺🇸', abbreviation: 'EN' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', abbreviation: 'FR' },
  { code: 'pt', label: 'Português', flag: '🇧🇷', abbreviation: 'PT' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪', abbreviation: 'DE' },
];

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOption = LANGUAGES.find((l) => l.code === language) || LANGUAGES[1];

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        id="language-selector-trigger"
        className="flex items-center space-x-2 bg-white/10 hover:bg-white/15 text-white/90 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide border border-white/10 hover:border-white/20 transition-all cursor-pointer focus:outline-none"
      >
        <Globe className="w-3.5 h-3.5 text-cyan-300" />
        <span className="text-[14px]">{currentOption.flag}</span>
        <span className="font-mono text-[11px] font-bold text-white uppercase">{currentOption.abbreviation}</span>
        <ChevronDown className={`w-3 h-3 text-white/60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          id="language-selector-menu"
          className="absolute right-0 mt-2.5 w-48 bg-white border border-neutral-200 rounded-2xl shadow-xl z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden"
        >
          {LANGUAGES.map((option) => {
            const isSelected = option.code === language;
            return (
              <button
                key={option.code}
                onClick={() => {
                  setLanguage(option.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-xs text-left text-slate-800 hover:bg-cyan-50/50 hover:text-[#0373bb] transition-all cursor-pointer ${
                  isSelected ? 'font-semibold text-[#0373bb] bg-cyan-50/30' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-[16px]">{option.flag}</span>
                  <span className="font-sans text-[13px]">{option.label}</span>
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 text-[#0373bb] stroke-[2.5px]" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
