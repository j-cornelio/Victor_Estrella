/**
 * Localized, conversational date formatting and surgery timing classification
 * for Dr. Víctor Estrella CRM and patient records.
 */

export function formatConversationalDate(dateStr?: string | null, lang: string = 'es'): string {
  if (!dateStr || typeof dateStr !== 'string') return '';

  const trimmed = dateStr.trim();
  if (!trimmed) return '';

  // Match ISO standard YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10) - 1;
    const day = parseInt(isoMatch[3], 10);
    const dateObj = new Date(year, month, day);

    if (!isNaN(dateObj.getTime())) {
      const locale = 
        lang === 'es' ? 'es-DO' : 
        lang === 'fr' ? 'fr-FR' : 
        lang === 'pt' ? 'pt-BR' : 
        lang === 'de' ? 'de-DE' : 
        'en-US';

      return dateObj.toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  }

  // Handle MM/DD or MM/DD/YYYY formats like 03/15 or 03/20/2026
  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
  if (slashMatch) {
    const currentYear = new Date().getFullYear();
    const month = parseInt(slashMatch[1], 10) - 1;
    const day = parseInt(slashMatch[2], 10);
    const year = slashMatch[3] ? parseInt(slashMatch[3], 10) : currentYear;
    const fullYear = year < 100 ? 2000 + year : year;
    const dateObj = new Date(fullYear, month, day);

    if (!isNaN(dateObj.getTime())) {
      const locale = 
        lang === 'es' ? 'es-DO' : 
        lang === 'fr' ? 'fr-FR' : 
        lang === 'pt' ? 'pt-BR' : 
        lang === 'de' ? 'de-DE' : 
        'en-US';

      return dateObj.toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        year: slashMatch[3] ? 'numeric' : undefined
      });
    }
  }

  // Fallback for timestamps or ISO full strings
  try {
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      const locale = 
        lang === 'es' ? 'es-DO' : 
        lang === 'fr' ? 'fr-FR' : 
        lang === 'pt' ? 'pt-BR' : 
        lang === 'de' ? 'de-DE' : 
        'en-US';

      return parsed.toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  } catch {
    // Keep raw string on parse failure
  }

  return trimmed;
}

export interface OperationTimingInfo {
  category: 'week_plus' | 'within_week' | 'within_2days' | 'same_day';
  badgeClass: string;
  timeLabelClass: string;
  dotColor: string;
  label: string;
  daysDiff: number;
  description: string;
}

/**
 * Returns color-coded badge classes and localized countdown labels based on proximity to surgery:
 * - Same day (0 days): Light Red
 * - Within 2 days (1-2 days): Light Orange
 * - Within a week (3-7 days): Beige
 * - More than a week (>7 days): Light Green
 */
export function getOperationTiming(dateStr?: string | null, lang: string = 'es'): OperationTimingInfo {
  if (!dateStr) {
    return {
      category: 'week_plus',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      timeLabelClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dotColor: 'bg-emerald-500',
      label: lang === 'es' ? 'Programado' : 'Scheduled',
      daysDiff: 999,
      description: lang === 'es' ? 'Fecha por confirmar' : 'Date to be confirmed'
    };
  }

  // Parse target date
  let targetDate: Date | null = null;
  const isoMatch = dateStr.trim().match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    targetDate = new Date(parseInt(isoMatch[1], 10), parseInt(isoMatch[2], 10) - 1, parseInt(isoMatch[3], 10));
  } else {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      targetDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }
  }

  if (!targetDate || isNaN(targetDate.getTime())) {
    return {
      category: 'week_plus',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      timeLabelClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dotColor: 'bg-emerald-500',
      label: lang === 'es' ? 'Programado' : 'Scheduled',
      daysDiff: 999,
      description: ''
    };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffTime = targetDate.getTime() - today.getTime();
  const daysDiff = Math.round(diffTime / (1000 * 60 * 60 * 24));

  // 1. Same Day (0 days or today) -> Light red
  if (daysDiff <= 0) {
    return {
      category: 'same_day',
      badgeClass: 'bg-red-50 text-red-800 border-red-200',
      timeLabelClass: 'bg-red-50 text-red-800 border-red-200 font-bold',
      dotColor: 'bg-red-500',
      label: daysDiff === 0 
        ? (lang === 'es' ? '¡Mismo día / Hoy!' : 'Same day / Today!')
        : (lang === 'es' ? 'Hoy' : 'Today'),
      daysDiff,
      description: lang === 'es' ? 'Operación programada para hoy' : 'Operation scheduled for today'
    };
  }

  // 2. Within 2 days (1 to 2 days) -> Light orange
  if (daysDiff <= 2) {
    return {
      category: 'within_2days',
      badgeClass: 'bg-orange-50 text-orange-800 border-orange-200',
      timeLabelClass: 'bg-orange-50 text-orange-800 border-orange-200 font-bold',
      dotColor: 'bg-orange-500',
      label: daysDiff === 1 
        ? (lang === 'es' ? 'En 1 día (Mañana)' : 'In 1 day (Tomorrow)')
        : (lang === 'es' ? 'En 2 días' : 'In 2 days'),
      daysDiff,
      description: lang === 'es' ? 'Operación en 48 hrs' : 'Operation in 48 hrs'
    };
  }

  // 3. Within a week (3 to 7 days) -> Beige
  if (daysDiff <= 7) {
    return {
      category: 'within_week',
      badgeClass: 'bg-[#F9F6F0] text-[#7E6334] border-[#E8DFD0]',
      timeLabelClass: 'bg-[#F9F6F0] text-[#7E6334] border-[#E8DFD0] font-semibold',
      dotColor: 'bg-[#C2A56C]',
      label: lang === 'es' ? `En ${daysDiff} días` : `In ${daysDiff} days`,
      daysDiff,
      description: lang === 'es' ? 'Dentro de esta semana' : 'Within this week'
    };
  }

  // 4. A week before operation (> 7 days) -> Light green
  return {
    category: 'week_plus',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    timeLabelClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold',
    dotColor: 'bg-emerald-500',
    label: lang === 'es' ? `En ${daysDiff} días` : `In ${daysDiff} days`,
    daysDiff,
    description: lang === 'es' ? 'Más de 1 semana' : 'Over 1 week out'
  };
}
