import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import AboutSection from './components/AboutSection';
import ServicesSection from './components/ServicesSection';
import GallerySection from './components/GallerySection';
import TestimonialsSection from './components/TestimonialsSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import AccountModal from './components/AccountModal';
import ProceduresPage from './components/ProceduresPage';
import { Product, Order, Consultation } from './types';
import { Sparkles, X, Check } from 'lucide-react';

export default function App() {
  const [activeSection, setActiveSection] = useState('hero');
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string } | null>(null);

  // Modal open states
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  
  // Consultation form pre-select parameters
  const [preselectedSpecialistId, setPreselectedSpecialistId] = useState('');
  const [preselectedProcedure, setPreselectedProcedure] = useState('');

  // Global Toast state for immediate visual feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Virtual Router/Page state for the Clinical Procedures Explorer
  const [currentPage, setCurrentPage] = useState<'home' | 'procedures' | 'gallery'>('home');
  const [initialCategory, setInitialCategory] = useState<string>('all');
  const [initialProcedureId, setInitialProcedureId] = useState<string | null>(null);

  // Initialize and load user from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('lumiskin_current_user');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Failed to load localStorage state data', err);
    }
  }, []);

  // Trigger brief floating toast notifications
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // User auth triggers
  const handleLogin = (email: string, name: string) => {
    const user = { email, name };
    setCurrentUser(user);
    try {
      localStorage.setItem('lumiskin_current_user', JSON.stringify(user));
      triggerToast(`Successfully signed in as ${name}!`);
      setIsAccountOpen(false);
    } catch (err) {
      console.error('Failed to save user session', err);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('lumiskin_current_user');
      triggerToast('Signed out of clinical portal.');
      setIsAccountOpen(false);
    } catch (err) {
      console.error('Failed to clear user session', err);
    }
  };

  const handleSuccessConsultation = (cons: Consultation) => {
    triggerToast(`Consultation requested with clinical board on ${cons.date}!`);
  };

  const handleOpenConsultation = (specialistId?: string, procedureName?: string) => {
    if (specialistId) setPreselectedSpecialistId(specialistId);
    if (procedureName) setPreselectedProcedure(procedureName);
    
    if (currentPage !== 'home') {
      setCurrentPage('home');
    }
    
    // Smooth scroll down to contact section
    setTimeout(() => {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 120);
  };

  // Virtual router callback for Header & Footer clicks
  const handleNavigateSection = (sectionId: string) => {
    if (['services', 'face', 'breast', 'body', 'skin'].includes(sectionId)) {
      setInitialCategory(sectionId === 'services' ? 'all' : sectionId);
      setInitialProcedureId(null);
      setCurrentPage('procedures');
      setActiveSection(sectionId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (sectionId === 'gallery') {
      setCurrentPage('gallery');
      setActiveSection('gallery');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentPage('home');
      setActiveSection(sectionId);
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  const handleNavigateToProcedures = (category?: string, procedureId?: string) => {
    const targetCat = category || 'all';
    setInitialCategory(targetCat);
    setInitialProcedureId(procedureId || null);
    setCurrentPage('procedures');
    setActiveSection(targetCat === 'all' ? 'services' : targetCat);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Intersection Observer to update active navigation menu items based on scroll
  useEffect(() => {
    if (currentPage !== 'home') return;
    const sections = ['hero', 'services', 'gallery', 'testimonials', 'contact'];
    
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px', // Trigger when section occupies the center screen
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach((secId) => {
      const el = document.getElementById(secId);
      if (el) observer.observe(el);
    });

    return () => {
      sections.forEach((secId) => {
        const el = document.getElementById(secId);
        if (el) observer.unobserve(el);
      });
    };
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-[#FCFBF9] text-[#2D211A] flex flex-col justify-between font-sans selection:bg-[#0373bb]/20 selection:text-[#0373bb] scroll-smooth antialiased">
      
      {/* Universal Floating Toast Indicator */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2D211A] text-white rounded-2xl px-5 py-3.5 shadow-xl border border-neutral-700/50 flex items-center space-x-3 text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-[#0373bb]/20 text-[#0373bb] p-1.5 rounded-full">
            <Check className="w-4 h-4" />
          </div>
          <span className="font-medium tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* Persistent 2-Row Header (Inspired by Image 1 Header, styled in Image 2 colors) */}
      <Header
        activeSection={activeSection}
        setActiveSection={handleNavigateSection}
        onOpenConsultation={handleOpenConsultation}
        onOpenAccount={() => setIsAccountOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {currentPage === 'procedures' ? (
        <ProceduresPage
          onClose={() => setCurrentPage('home')}
          onOpenConsultation={handleOpenConsultation}
          initialCategory={initialCategory}
          initialProcedureId={initialProcedureId}
        />
      ) : currentPage === 'gallery' ? (
        <GallerySection
          isPageMode={true}
          onClose={() => setCurrentPage('home')}
        />
      ) : (
        /* Main Single Screen Layout Contents */
        <main className="flex-1">
          
          {/* 1. Hero Section (Image 2 style with 'model transparent lines' Image 3/4) */}
          <Hero onOpenConsultation={() => handleOpenConsultation()} />

          {/* About Section (Aesthetic Surgery of Dr. Victor Estrella) */}
          <AboutSection />

          {/* 2. Services Section (Image 5 content styled like clean Image 2 layout) */}
          <ServicesSection
            onOpenConsultation={handleOpenConsultation}
            onNavigateToProcedures={handleNavigateToProcedures}
          />

          {/* 5. Before & After Cases Gallery (Image 7 interactive comparisons) */}
          <GallerySection
            isPageMode={false}
            onNavigateToGallery={() => {
              setCurrentPage('gallery');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />

          {/* 6. Testimonials Section (Image 5 stars styled in clean Image 2 layout) */}
          <TestimonialsSection />

          {/* 7. Contact Us & Consultation Scheduler (Image 8 forms) */}
          <ContactSection
            preselectedSpecialistId={preselectedSpecialistId}
            preselectedProcedure={preselectedProcedure}
            onSuccess={handleSuccessConsultation}
          />

        </main>
      )}

      {/* Responsive Multi-Column Footer (Image 9 columns) */}
      <Footer onNavToSection={handleNavigateSection} />

      {/* My Account / Client Cabinet Portal modal */}
      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

    </div>
  );
}
