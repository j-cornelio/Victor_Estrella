export type UserRole = 'staff' | 'doctor' | 'client';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  mrn?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PatientFile {
  id: string;
  name: string;
  size: number;
  type: string; // e.g. 'application/pdf', 'image/jpeg', 'image/png'
  dataUrl: string; // Base64 data string stored directly in Firestore
  uploadDate: string;
  uploadedBy: 'patient' | 'staff';
  category: 'pdf_records' | 'lab_results' | 'id_insurance' | 'photos' | 'surgical_clearance' | 'quote';
  notes?: string;
}

export interface PatientAppointment {
  id: string;
  title: string;
  date: string;
  time: string;
  location?: string;
  completed: boolean;
  highlight?: boolean;
  notes?: string;
}

export interface PatientMedication {
  id: string;
  time: string;
  name: string;
  desc: string;
  isDone: boolean;
  dosage?: string;
  frequency?: string;
}

export interface PatientLabResult {
  id: string;
  name: string;
  value: string;
  unit: string;
  status: 'normal' | 'optimal' | 'attention' | 'pending';
  date?: string;
}

export interface PatientVitalSigns {
  bloodPressureSys: number;
  bloodPressureDia: number;
  heartRate: number;
  fajaHours: number;
  painScore: number;
  healingProgress: string;
  lastUpdated: string;
}

export interface PatientRecord {
  id: string;
  userId: string;
  patientName: string;
  patientEmail: string;
  phone?: string;
  procedure: string;
  status: 'consultation' | 'pre_op' | 'scheduled' | 'recovery' | 'completed';
  clearanceStatus: 'pending' | 'cleared' | 'requires_review';
  mrn: string;
  
  // Financial records (how much paid, total, etc.)
  totalAmount: number;
  paidAmount: number;
  paymentStatus: 'unpaid' | 'deposit_paid' | 'partial' | 'paid_in_full';
  
  // Booking info & Calendar
  appointments: PatientAppointment[];
  
  // Stored PDF files & records (base64)
  files: PatientFile[];
  
  // Medical recovery & medications
  medications: PatientMedication[];
  labs: PatientLabResult[];
  vitalSigns: PatientVitalSigns;
  
  surgicalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'skincare' | 'treatment';
  image: string;
  description: string;
  benefits: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  items: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  customerName: string;
  customerEmail: string;
  status: 'pending' | 'paid' | 'completed';
}

export interface Consultation {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  procedure: string;
  specialistId: string;
  date: string;
  time: string;
  notes: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  createdAt?: string;
  updatedAt?: string;
}

export interface Specialist {
  id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
  rating: number;
}

export interface GalleryItem {
  id: string;
  title: string;
  before: string;
  after: string;
  category: string;
  objectFit?: 'cover' | 'contain';
}

export interface Testimonial {
  id: string;
  title: string;
  quote: string;
  rating: number;
  author: string;
  source: string;
}

export interface ClientQuote {
  id: string;
  userId?: string;
  clientEmail: string;
  clientName: string;
  procedure: string;
  date: string;
  totalAmount: number;
  paidAmount?: number;
  status: 'draft' | 'sent' | 'approved' | 'paid';
  breakdown: {
    item: string;
    cost: number;
  }[];
  pdfDataUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProcedurePricingItem {
  id: string;
  name: string; // Spanish procedure name
  nameEn: string; // English procedure name
  procedurePrice: number | null; // null if requires prior evaluation
  procedurePriceRange?: { min: number; max: number };
  medicalExpenses: number | null; // $1,100, $1,200, or null
  estimatedTotal: number | null; // Total or null
  estimatedTotalRange?: { min: number; max: number };
  includesBreasts: boolean;
  category: 'combo' | 'breast' | 'body' | 'other';
  notes?: string;
}

export interface PricingAddon {
  id: string;
  name: string;
  nameEn: string;
  additionalCost: number;
  description: string;
}

export interface ChatEvaluationResult {
  zone: string;
  goals: string[];
  candidateLevel: 'ideal' | 'good' | 'requires_clearance';
  bmi?: number;
  recommendedProcedureIds: string[];
  recoveryDays: number;
  travelNotes: string;
  rationale: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedProcedures?: string[];
  evaluationResult?: ChatEvaluationResult;
  bookingTrigger?: boolean;
  appointmentConfirmed?: Consultation;
}

export interface ChatLeadContext {
  name?: string;
  email?: string;
  phone?: string;
  procedure?: string;
  bmi?: number;
  goals?: string[];
  notes?: string;
}

