import React from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube, HelpCircle, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onNavToSection: (sectionId: string) => void;
}

export default function Footer({ onNavToSection }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handleNav = (sectionId: string) => {
    onNavToSection(sectionId);
  };

  return (
    <footer className="bg-[#e3e4e7] border-t border-[#EBE6DF] text-[#2D211A] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
          
          {/* Column 1: Contacts & Primary Logo (Exactly like Image 9) */}
          <div className="space-y-6">
            <h4 className="font-sans text-xs font-bold uppercase tracking-widest text-[#0373bb]">
              Contacts & Registries
            </h4>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Main Clinical Office</p>
                <p className="text-xs sm:text-sm text-[#5C4D44] mt-1">
                  IPBMA Medical Associates, Av Independencia 655, Gazcue, Santo Domingo, Dominican Republic
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Phone Lines</p>
                <a 
                  href="https://wa.me/18299358121" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm font-bold text-[#2D211A] hover:text-[#0373bb] transition-colors mt-1 block"
                >
                  (829)935-8121
                </a>
                <p className="text-[9px] text-neutral-400 font-semibold uppercase mt-0.5">Contact us today to schedule your appointment</p>
              </div>
            </div>

            {/* Logo */}
            <div className="pt-4 flex flex-col">
              <span className="font-serif text-xl tracking-widest text-[#2D211A] font-light leading-none">
                DR. VICTOR ESTRELLA
              </span>
              <span className="text-[8px] tracking-[0.15em] text-[#0373bb] uppercase font-semibold mt-1">
                Aesthetic and Reconstructive surgery
              </span>
            </div>
          </div>

          {/* Column 2: Clinical Services (Exactly like Image 9) */}
          <div className="space-y-6">
            <h4 className="font-sans text-xs font-bold uppercase tracking-widest text-[#0373bb]">
              Surgical Portfolios
            </h4>
            <ul className="space-y-3.5 text-xs text-[#5C4D44] font-medium uppercase tracking-wide">
              <li>
                <button onClick={() => handleNav('services')} className="hover:text-[#0373bb] transition-colors cursor-pointer">
                  Breast Enhancement
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('services')} className="hover:text-[#0373bb] transition-colors cursor-pointer">
                  Body Contouring
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('services')} className="hover:text-[#0373bb] transition-colors cursor-pointer">
                  Facial Surgery
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('services')} className="hover:text-[#0373bb] transition-colors cursor-pointer">
                  Male Plastic Surgery
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('services')} className="hover:text-[#0373bb] transition-colors cursor-pointer">
                  Reconstructive Surgery
                </button>
              </li>
            </ul>
          </div>



          {/* Column 4: Newsletter & Verification credentials */}
          <div className="space-y-6">
            <h4 className="font-sans text-xs font-bold uppercase tracking-widest text-[#0373bb]">
              Security & Credentialing
            </h4>
            <p className="text-xs text-[#7C6C63] leading-relaxed">
              We operate strictly within FDA safety guidelines and HIPAA medical privacy mandates. Your personal consultation files are safely stored on client local storage vaults.
            </p>
            <div className="bg-cyan-50/50 p-4 rounded-xl border border-cyan-100 flex items-center space-x-3 text-left">
              <ShieldCheck className="w-5 h-5 text-[#0373bb] shrink-0" />
              <div className="text-[10px] text-[#5C4D44] leading-normal font-semibold">
                BOARD CERTIFIED PLASTIC SURGEONS<br />
                <span className="text-neutral-400 text-[9px]">REGISTRY #338102</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Socials & Rights Bar (Exactly like Image 9) */}
        <div className="mt-16 pt-8 border-t border-[#EBE6DF] flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-neutral-400 font-medium">
          <div>
            <p>© {currentYear} Dr. Victor Estrella Southeastern Aesthetic Surgery. All rights reserved.</p>
          </div>
          <div className="flex space-x-6">
            <button className="hover:text-[#0373bb] cursor-pointer">Privacy Policy</button>
            <button className="hover:text-[#0373bb] cursor-pointer">Terms of Service</button>
            <button className="hover:text-[#0373bb] cursor-pointer">Sitemap</button>
          </div>
          <div className="flex items-center space-x-4">
            <a href="https://facebook.com" className="p-2 bg-white hover:bg-neutral-100 border border-[#EBE6DF] text-[#5C4D44] hover:text-[#0373bb] rounded-full transition-all" aria-label="Facebook">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="https://www.instagram.com/drvictorestrella/" target="_blank" rel="noopener noreferrer" className="p-2 bg-white hover:bg-neutral-100 border border-[#EBE6DF] text-[#5C4D44] hover:text-[#0373bb] rounded-full transition-all" aria-label="Instagram">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="https://youtube.com" className="p-2 bg-white hover:bg-neutral-100 border border-[#EBE6DF] text-[#5C4D44] hover:text-[#0373bb] rounded-full transition-all" aria-label="Youtube">
              <Youtube className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
