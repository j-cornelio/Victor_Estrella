import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, Language } from '../context/LanguageContext';
import { Globe, ChevronDown, Check } from 'lucide-react';

const FlagES = () => (
  <svg className="w-5 h-3.5 rounded-[2px] object-cover shadow-xs border border-black/15 shrink-0" viewBox="0 0 750 500">
    <rect width="750" height="500" fill="#AA152F" />
    <rect y="125" width="750" height="250" fill="#F1BF00" />
    <circle cx="220" cy="250" r="30" fill="#AA152F" />
  </svg>
);

const FlagUS = () => (
  <svg className="w-5 h-3.5 rounded-[2px] object-cover shadow-xs border border-black/15 shrink-0" viewBox="0 0 741 390">
    <rect width="741" height="390" fill="#BB133E" />
    <path d="M0 30h741M0 90h741M0 150h741M0 210h741M0 270h741M0 330h741" stroke="#FFF" strokeWidth="30" />
    <rect width="296" height="210" fill="#002147" />
    <g fill="#FFF">
      <circle cx="50" cy="45" r="7" />
      <circle cx="110" cy="45" r="7" />
      <circle cx="170" cy="45" r="7" />
      <circle cx="230" cy="45" r="7" />
      <circle cx="80" cy="105" r="7" />
      <circle cx="140" cy="105" r="7" />
      <circle cx="200" cy="105" r="7" />
      <circle cx="50" cy="165" r="7" />
      <circle cx="110" cy="165" r="7" />
      <circle cx="170" cy="165" r="7" />
      <circle cx="230" cy="165" r="7" />
    </g>
  </svg>
);

const FlagFR = () => (
  <svg className="w-5 h-3.5 rounded-[2px] object-cover shadow-xs border border-black/15 shrink-0" viewBox="0 0 900 600">
    <rect width="900" height="600" fill="#ED2939" />
    <rect width="600" height="600" fill="#FFF" />
    <rect width="300" height="600" fill="#002395" />
  </svg>
);

const FlagBR = () => (
  <svg className="w-5 h-3.5 rounded-[2px] object-cover shadow-xs border border-black/15 shrink-0" viewBox="0 0 720 504">
    <rect width="720" height="504" fill="#009B3A" />
    <polygon points="360,63 657,252 360,441 63,252" fill="#FEDF00" />
    <circle cx="360" cy="252" r="110" fill="#002776" />
    <path d="M 260 275 Q 360 230 460 265" stroke="#FFF" strokeWidth="12" fill="none" />
  </svg>
);

const FlagDE = () => (
  <svg className="w-5 h-3.5 rounded-[2px] object-cover shadow-xs border border-black/15 shrink-0" viewBox="0 0 5 3">
    <rect width="5" height="3" fill="#FFCE00" />
    <rect width="5" height="2" fill="#DD0000" />
    <rect width="5" height="1" fill="#000000" />
  </svg>
);

interface LanguageOption {
  code: Language;
  label: string;
  flag: React.ReactNode;
  abbreviation: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'es', label: 'Español', flag: <FlagES />, abbreviation: 'ES' },
  { code: 'en', label: 'English', flag: <FlagUS />, abbreviation: 'EN' },
  { code: 'fr', label: 'Français', flag: <FlagFR />, abbreviation: 'FR' },
  { code: 'pt', label: 'Português', flag: <FlagBR />, abbreviation: 'PT' },
  { code: 'de', label: 'Deutsch', flag: <FlagDE />, abbreviation: 'DE' },
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
        <span className="flex items-center">{currentOption.flag}</span>
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
                  <span className="flex items-center">{option.flag}</span>
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
