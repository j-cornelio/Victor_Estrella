import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App if not already done
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/calendar.events');

let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Initialize auth state listener
export const initCalendarAuth = (
  onAuthSuccess: (user: User, token: string) => void,
  onAuthFailure: () => void
) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      if (cachedAccessToken) {
        onAuthSuccess(user, cachedAccessToken);
      } else {
        // If we don't have a cached token but have a user, we can prompt for sign-in to refresh token
        onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      onAuthFailure();
    }
  });
};

// Sign in with Google to get the calendar access token
export const googleSignInForCalendar = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google access token');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (err) {
    console.error('Google Auth Calendar sign-in failed:', err);
    throw err;
  } finally {
    isSigningIn = false;
  }
};

// Sign out
export const calendarSignOut = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// Helper to check if token exists
export const hasCalendarToken = (): boolean => {
  return !!cachedAccessToken;
};

// Convert custom time string to HH:MM:SS
const parseTime = (timeStr: string): { start: string; end: string } => {
  switch (timeStr) {
    case '09:00 AM':
      return { start: '09:00:00', end: '10:00:00' };
    case '11:00 AM':
      return { start: '11:00:00', end: '12:00:00' };
    case '01:30 PM':
      return { start: '13:30:00', end: '14:30:00' };
    case '03:30 PM':
      return { start: '15:30:00', end: '16:30:00' };
    case '05:00 PM':
      return { start: '17:00:00', end: '18:00:00' };
    default:
      return { start: '09:00:00', end: '10:00:00' };
  }
};

interface CreateCalendarEventParams {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  procedure: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g., "01:30 PM"
  notes?: string;
}

// Create event in primary calendar
export const createCalendarEvent = async (params: CreateCalendarEventParams): Promise<boolean> => {
  if (!cachedAccessToken) {
    throw new Error('No Google Calendar access token found. Please connect your account.');
  }

  const { start, end } = parseTime(params.time);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Santo_Domingo';

  const eventBody = {
    summary: `Aesthetic Consultation: ${params.procedure} with Dr. Victor Estrella`,
    location: `Dr. Victor Estrella Clinic, Santo Domingo, Dominican Republic`,
    description: `Dear ${params.firstName} ${params.lastName},\n\nYour clinical consultation is successfully scheduled.\n\nDetails:\n- Procedure of interest: ${params.procedure}\n- Contact Phone: ${params.phone}\n- Email: ${params.email}\n- Clinical Notes: ${params.notes || 'None'}\n\nWe look forward to seeing you.`,
    start: {
      dateTime: `${params.date}T${start}`,
      timeZone: timeZone,
    },
    end: {
      dateTime: `${params.date}T${end}`,
      timeZone: timeZone,
    },
    attendees: [
      { email: params.email },
      { email: 'doctorvictorestrella@gmail.com' }
    ],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 60 },
      ],
    },
  };

  try {
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cachedAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Google Calendar API Error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to create calendar event');
    }

    return true;
  } catch (err) {
    console.error('Error in createCalendarEvent:', err);
    throw err;
  }
};
