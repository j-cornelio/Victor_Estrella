import React, { useState } from 'react';
import { Phone, Calendar, User, Search, Menu, X, ChevronDown, Check, LogOut, Facebook, Instagram } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';

interface HeaderProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onOpenConsultation: (specialistId?: string, procedureName?: string) => void;
  onOpenAccount: () => void;
  currentUser: { email: string; name: string } | null;
  onLogout: () => void;
}

export default function Header({
  activeSection,
  setActiveSection,
  onOpenConsultation,
  onOpenAccount,
  currentUser,
  onLogout
}: HeaderProps) {
  const { t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);

  const navItems = [
    { label: t('nav.home'), value: 'hero' },
    { label: t('nav.about'), value: 'about' },
    { label: t('nav.services'), value: 'services', hasDropdown: true },
    { label: t('nav.gallery'), value: 'gallery' },
    { label: t('nav.testimonials'), value: 'testimonials' },
    { label: t('nav.contact'), value: 'contact' }
  ];

  const handleNavClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#2D211A] border-b border-[#3D3028] shadow-md">
      {/* Row 1: Logo & Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => handleNavClick('hero')}
          className="flex items-center space-x-3 text-left focus:outline-none group cursor-pointer"
        >
          <img
            src="https://res.cloudinary.com/dkicj8zmk/image/upload/v1783810633/logo_blue_oejuto.png"
            alt="Dr. Victor Estrella Logo"
            className="w-[46px] h-[46px] sm:w-[54px] sm:h-[54px] object-contain brightness-110 saturate-125"
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col">
            <span className="font-serif text-[1.28rem] sm:text-[1.68rem] tracking-widest text-white font-light leading-none group-hover:opacity-80 transition-opacity">
              Dr. Victor Estrella
            </span>
            <span className="text-[10px] sm:text-[11px] tracking-[0.15em] text-cyan-200 uppercase font-semibold mt-1">
              Aesthetic and Reconstructive surgery
            </span>
          </div>
        </button>

        {/* Contact, Schedule and User Tools */}
        <div className="hidden md:flex items-center space-x-6">
          {/* Language Selector */}
          <LanguageSelector />

          {/* Phone Number */}
          <a
            href="tel:3472783792"
            className="flex items-center space-x-2.5 px-5 py-2.5 rounded-full border border-white/20 hover:border-cyan-300 text-white font-sans text-sm font-medium transition-all group"
          >
            <Phone className="w-4 h-4 text-cyan-300 group-hover:scale-110 transition-transform" />
            <span className="tracking-wide">347 278 3792</span>
          </a>

          {/* Schedule Consultation Button */}
          <button
            onClick={() => onOpenConsultation()}
            id="header-schedule-btn"
            className="flex items-center space-x-2 bg-[#0373bb] hover:bg-[#025c96] text-white px-6 py-3 rounded-full text-sm font-medium tracking-wide shadow-xs hover:shadow-md transition-all active:scale-98 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>{t('general.consultation')}</span>
          </button>

          {/* Account Portal */}
          <button
            onClick={onOpenAccount}
            id="header-account-btn"
            className="flex items-center space-x-1.5 p-2 px-3 rounded-full hover:bg-white/10 text-white/90 hover:text-cyan-300 transition-colors cursor-pointer"
          >
            <User className="w-5 h-5" />
            {currentUser ? (
              <span className="text-xs font-semibold text-cyan-200 max-w-[80px] truncate">
                {currentUser.name.split(' ')[0]}
              </span>
            ) : (
              <span className="text-xs font-medium text-white/90">{t('nav.portal')}</span>
            )}
          </button>
        </div>

        {/* Mobile menu, cart, account, trigger */}
        <div className="flex items-center md:hidden space-x-3">
          {/* Language Selector */}
          <LanguageSelector />

          {/* Mobile Account */}
          <button
            onClick={onOpenAccount}
            id="mobile-account-btn"
            className="p-2 text-white/90 hover:text-cyan-300"
            aria-label="My Account"
          >
            <User className="w-5.5 h-5.5" />
          </button>

          {/* Mobile Hamburguer */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            id="mobile-menu-trigger"
            className="p-2 text-white/90 hover:text-cyan-300 cursor-pointer"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Row 2: Menu items (Desktop only, centered styled exactly like Image 1) */}
      <div className="hidden md:block w-full border-t border-[#3D3028] bg-[#241a15]">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative flex items-center py-3">
          {/* Social Icons on the left */}
          <div className="flex items-center space-x-4 absolute left-4 sm:left-6 lg:left-8">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-cyan-300 transition-colors p-1 rounded-full hover:bg-white/5"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="https://www.instagram.com/drvictorestrella/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-cyan-300 transition-colors p-1 rounded-full hover:bg-white/5"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
          </div>

          <ul className="flex items-center justify-center space-x-8 lg:space-x-12 mx-auto">
            {navItems.map((item) => (
              <li key={item.value} className="relative group">
                <button
                  onClick={() => handleNavClick(item.value)}
                  className={`flex items-center space-x-1 font-sans text-xs tracking-wider uppercase font-semibold transition-colors py-1 cursor-pointer ${
                    activeSection === item.value || 
                    (item.value === 'services' && ['face', 'breast', 'body', 'skin'].includes(activeSection))
                      ? 'text-cyan-300' 
                      : 'text-white/80 hover:text-cyan-300'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.hasDropdown && (
                    <ChevronDown className="w-3.5 h-3.5 opacity-70 group-hover:rotate-180 transition-transform duration-300" />
                  )}
                </button>

                {/* Services Dropdown Panel */}
                {item.hasDropdown && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-52 bg-[#2D211A] border border-white/15 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 py-2.5 z-50">
                    {['Face', 'Breast', 'Body', 'Skin'].map((sub) => (
                      <button
                        key={sub}
                        onClick={() => handleNavClick(sub.toLowerCase())}
                        className="w-full text-left px-5 py-2 text-xs font-sans tracking-wide uppercase font-medium text-white/80 hover:bg-white/10 hover:text-cyan-300 transition-colors"
                      >
                        {sub} Aesthetics
                      </button>
                    ))}
                  </div>
                )}

                {/* Active Indicator Underline */}
                {(activeSection === item.value || (item.value === 'services' && ['face', 'breast', 'body', 'skin'].includes(activeSection))) && (
                  <div className="absolute -bottom-4 left-0 right-0 h-0.75 bg-cyan-300" />
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Mobile Drawer menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden w-full bg-[#241a15] border-t border-white/10 px-4 py-5 space-y-4 animate-in fade-in slide-in-from-top-5 duration-300">
          <ul className="space-y-3.5">
            {navItems.map((item) => (
              <li key={item.value}>
                {item.hasDropdown ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => setIsServicesDropdownOpen(!isServicesDropdownOpen)}
                      className="w-full flex items-center justify-between text-sm tracking-wide uppercase font-semibold text-white/90 py-1"
                    >
                      <span>{item.label}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isServicesDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isServicesDropdownOpen && (
                      <div className="pl-4 space-y-2.5 border-l border-white/10">
                        {['Face', 'Breast', 'Body', 'Skin'].map((sub) => (
                          <button
                            key={sub}
                            onClick={() => handleNavClick(sub.toLowerCase())}
                            className="block w-full text-left text-xs tracking-wider uppercase font-medium text-white/70 py-1"
                          >
                            {sub} Aesthetics
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleNavClick(item.value)}
                    className={`block w-full text-left text-sm tracking-wide uppercase font-semibold py-1 ${
                      activeSection === item.value ? 'text-cyan-300' : 'text-white/90'
                    }`}
                  >
                    {item.label}
                  </button>
                )}
              </li>
            ))}
          </ul>

          <div className="pt-4 border-t border-white/10 space-y-3">
            {/* Mobile Contact Button */}
            <a
              href="tel:3472783792"
              className="flex items-center justify-center space-x-2 w-full py-3 rounded-full border border-white/20 text-white font-sans text-sm font-medium"
            >
              <Phone className="w-4 h-4 text-cyan-300" />
              <span>347 278 3792</span>
            </a>

            {/* Mobile Book Button */}
            <button
              onClick={() => {
                onOpenConsultation();
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-3 bg-[#0373bb] hover:bg-[#025c96] text-white rounded-full text-sm font-medium tracking-wide shadow-xs text-center flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>{t('general.consultation')}</span>
            </button>
          </div>

          {/* Mobile Social Icons */}
          <div className="flex items-center justify-center space-x-6 pt-3 border-t border-white/10">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-cyan-300 transition-colors p-2 rounded-full bg-white/5 hover:bg-white/10"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="https://www.instagram.com/drvictorestrella/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-cyan-300 transition-colors p-2 rounded-full bg-white/5 hover:bg-white/10"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
