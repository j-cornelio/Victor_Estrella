import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Download, ChevronDown, Check, ExternalLink } from 'lucide-react';
import {
  getGoogleCalendarUrl,
  getOutlookCalendarUrl,
  getYahooCalendarUrl,
  downloadIcsFile
} from '../lib/calendarUtils';
import { useLanguage } from '../context/LanguageContext';

interface AddToCalendarButtonProps {
  procedure: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g., "01:30 PM"
  patientName?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'compact';
}

export default function AddToCalendarButton({
  procedure,
  date,
  time,
  patientName,
  className = '',
  variant = 'primary'
}: AddToCalendarButtonProps) {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const title = `Medical Consultation: ${procedure || 'Aesthetic Surgery'} - Dr. Victor Estrella`;
  const description = `Medical & Aesthetic Consultation with Dr. Victor Estrella.\n\n` +
    `Patient: ${patientName || 'Patient'}\n` +
    `Procedure: ${procedure || 'General Evaluation'}\n` +
    `Scheduled Date: ${date} at ${time}\n` +
    `Location: Santo Domingo Medical District, Dominican Republic\n` +
    `Contact: +1 (829) 935-8121`;
  const location = 'Dr. Victor Estrella Clinic, Santo Domingo, Dominican Republic';

  const eventData = { title, description, location, date, time };

  const googleUrl = getGoogleCalendarUrl(eventData);
  const outlookUrl = getOutlookCalendarUrl(eventData);
  const yahooUrl = getYahooCalendarUrl(eventData);

  const handleDownloadIcs = () => {
    downloadIcsFile(eventData);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
    setIsOpen(false);
  };

  const isEs = language === 'es';

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={
          variant === 'compact'
            ? "flex items-center space-x-1.5 px-3 py-1.5 bg-[#0373bb]/10 hover:bg-[#0373bb]/20 text-[#0373bb] text-xs font-bold rounded-lg transition-all cursor-pointer"
            : variant === 'secondary'
            ? "flex items-center justify-center space-x-2 px-4 py-2.5 bg-white hover:bg-neutral-50 text-[#2D211A] border border-[#EBE6DF] hover:border-[#0373bb] text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            : "flex items-center justify-center space-x-2 w-full sm:w-auto px-5 py-3 bg-[#0373bb] hover:bg-[#025c96] text-white text-xs font-bold tracking-wider uppercase rounded-full shadow-sm hover:shadow transition-all cursor-pointer"
        }
      >
        <Calendar className="w-4 h-4 text-current" />
        <span>{isEs ? 'Añadir al Calendario' : 'Add to Calendar'}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 sm:left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#EBE6DF] p-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-left">
          <div className="px-3 py-2 border-b border-neutral-100 mb-1">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              {isEs ? 'Elige tu calendario' : 'Choose your calendar'}
            </p>
          </div>

          {/* Google Calendar */}
          <a
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-neutral-50 transition-colors text-xs text-[#2D211A] font-medium group"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-neutral-800">Google Calendar</p>
              <p className="text-[10px] text-neutral-400">{isEs ? 'Abrir en navegador' : 'Open in browser'}</p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#0373bb]" />
          </a>

          {/* Apple Calendar / iCal (.ics) */}
          <button
            type="button"
            onClick={handleDownloadIcs}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-neutral-50 transition-colors text-xs text-[#2D211A] font-medium group text-left cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center shrink-0">
              <Download className="w-4 h-4 text-neutral-700" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-neutral-800">Apple Calendar / iCal</p>
              <p className="text-[10px] text-neutral-400">{isEs ? 'Descargar archivo .ics' : 'Download .ics file'}</p>
            </div>
            {downloaded ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Download className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#0373bb]" />
            )}
          </button>

          {/* Outlook Web */}
          <a
            href={outlookUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-neutral-50 transition-colors text-xs text-[#2D211A] font-medium group"
          >
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-sky-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-neutral-800">Outlook Web</p>
              <p className="text-[10px] text-neutral-400">{isEs ? 'Agregar en Outlook.com' : 'Add on Outlook.com'}</p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#0373bb]" />
          </a>

          {/* Yahoo Calendar */}
          <a
            href={yahooUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-neutral-50 transition-colors text-xs text-[#2D211A] font-medium group"
          >
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-neutral-800">Yahoo Calendar</p>
              <p className="text-[10px] text-neutral-400">{isEs ? 'Agregar en Yahoo' : 'Add on Yahoo'}</p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#0373bb]" />
          </a>
        </div>
      )}
    </div>
  );
}
