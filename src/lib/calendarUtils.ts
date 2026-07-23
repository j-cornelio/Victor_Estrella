// Utility to generate calendar links and download .ics files for appointments

interface CalendarEventData {
  title: string;
  description: string;
  location: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g., "01:30 PM" or "09:00 AM"
}

// Convert date and time string into start and end Date objects
export const parseAppointmentDates = (dateStr: string, timeStr: string): { startDate: Date; endDate: Date } => {
  const [year, month, day] = dateStr.split('-').map(Number);
  let hour = 9;
  let minute = 0;

  if (timeStr) {
    const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (timeMatch) {
      let h = parseInt(timeMatch[1], 10);
      const m = parseInt(timeMatch[2], 10);
      const ampm = timeMatch[3] ? timeMatch[3].toUpperCase() : '';

      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;

      hour = h;
      minute = m;
    }
  }

  const startDate = new Date(year, (month || 1) - 1, day || 1, hour, minute);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

  return { startDate, endDate };
};

// Format Date to YYYYMMDDTHHMMSS
const formatIcsDate = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  const y = date.getUTCFullYear();
  const m = pad(date.getUTCMonth() + 1);
  const d = pad(date.getUTCDate());
  const h = pad(date.getUTCHours());
  const min = pad(date.getUTCMinutes());
  const s = pad(date.getUTCSeconds());
  return `${y}${m}${d}T${h}${min}${s}Z`;
};

// Format Date for Google Calendar Web (YYYYMMDDTHHMMSS)
const formatGoogleDate = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const min = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  return `${y}${m}${d}T${h}${min}${s}`;
};

/**
 * Generate Google Calendar web add link
 */
export const getGoogleCalendarUrl = (data: CalendarEventData): string => {
  const { startDate, endDate } = parseAppointmentDates(data.date, data.time);
  const startStr = formatGoogleDate(startDate);
  const endStr = formatGoogleDate(endDate);

  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.set('action', 'TEMPLATE');
  url.searchParams.set('text', data.title);
  url.searchParams.set('details', data.description);
  url.searchParams.set('location', data.location);
  url.searchParams.set('dates', `${startStr}/${endStr}`);

  return url.toString();
};

/**
 * Generate Outlook Web Calendar link
 */
export const getOutlookCalendarUrl = (data: CalendarEventData): string => {
  const { startDate, endDate } = parseAppointmentDates(data.date, data.time);

  const url = new URL('https://outlook.live.com/calendar/0/deeplink/compose');
  url.searchParams.set('path', '/calendar/action/compose');
  url.searchParams.set('rru', 'addevent');
  url.searchParams.set('subject', data.title);
  url.searchParams.set('body', data.description);
  url.searchParams.set('location', data.location);
  url.searchParams.set('startdt', startDate.toISOString());
  url.searchParams.set('enddt', endDate.toISOString());

  return url.toString();
};

/**
 * Generate Yahoo Calendar link
 */
export const getYahooCalendarUrl = (data: CalendarEventData): string => {
  const { startDate, endDate } = parseAppointmentDates(data.date, data.time);
  const startStr = formatIcsDate(startDate);
  const endStr = formatIcsDate(endDate);

  const url = new URL('https://calendar.yahoo.com/');
  url.searchParams.set('v', '60');
  url.searchParams.set('view', 'd');
  url.searchParams.set('type', '20');
  url.searchParams.set('title', data.title);
  url.searchParams.set('desc', data.description);
  url.searchParams.set('in_loc', data.location);
  url.searchParams.set('st', startStr);
  url.searchParams.set('et', endStr);

  return url.toString();
};

/**
 * Trigger .ics file download for Apple Calendar / Outlook Desktop / Mobile
 */
export const downloadIcsFile = (data: CalendarEventData) => {
  const { startDate, endDate } = parseAppointmentDates(data.date, data.time);
  const startIcs = formatIcsDate(startDate);
  const endIcs = formatIcsDate(endDate);
  const nowIcs = formatIcsDate(new Date());

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Dr. Victor Estrella Medical Board//Consultation Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:consultation-${Date.now()}@drestrellaplasticsurgeon.com`,
    `DTSTAMP:${nowIcs}`,
    `DTSTART:${startIcs}`,
    `DTEND:${endIcs}`,
    `SUMMARY:${data.title.replace(/\n/g, ' ')}`,
    `DESCRIPTION:${data.description.replace(/\n/g, '\\n')}`,
    `LOCATION:${data.location.replace(/\n/g, ' ')}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Medical Consultation Tomorrow',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'Dr_Victor_Estrella_Consultation.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
