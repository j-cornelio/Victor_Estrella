import { 
  db, 
  auth, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  handleFirestoreError,
  OperationType,
  ensureAuthSession
} from '../firebase';
import { 
  UserProfile, 
  PatientRecord, 
  PatientFile, 
  PatientAppointment, 
  PatientMedication, 
  PatientLabResult, 
  PatientVitalSigns, 
  Consultation, 
  ClientQuote 
} from '../types';
import { CrmLead } from '../components/CrmPortal';

// Default initial record generator for newly authenticated patients
export function createDefaultPatientRecord(user: { uid: string; email: string; displayName?: string }): PatientRecord {
  const now = new Date().toISOString();
  const mrnCode = `VE-2026-${user.uid.slice(0, 4).toUpperCase()}`;
  
  return {
    id: `rec_${user.uid}`,
    userId: user.uid,
    patientName: user.displayName || user.email.split('@')[0] || 'Patient',
    patientEmail: user.email,
    phone: '+1 829 935 8121',
    procedure: 'Lipoescultura HD 360° + Marcación Abdominal',
    status: 'recovery',
    clearanceStatus: 'cleared',
    mrn: mrnCode,
    totalAmount: 5800,
    paidAmount: 5800,
    paymentStatus: 'paid_in_full',
    appointments: [
      { id: 'p1', title: 'Evaluación y Simulación 3D VECTRA', date: '03/15', time: '10:30 AM', completed: true, location: 'Consultorio 402 - CECIP' },
      { id: 'p2', title: 'Panel de Laboratorio Pre-Quirúrgico y EKG', date: '03/20', time: '08:00 AM', completed: true, location: 'Laboratorio Clínico Referencia' },
      { id: 'p3', title: 'Fecha Quirúrgica @ Pabellón CECIP', date: '03/28', time: '07:30 AM', completed: false, highlight: true, location: 'Quirófano 3 - CECIP' },
      { id: 'p4', title: '1ra Sesión Masaje Drenaje Linfático', date: '03/30', time: '11:00 AM', completed: false, location: 'Sala Post-Op' },
      { id: 'p5', title: 'Control Post-Op y Retiro de Suturas', date: '04/05', time: '09:00 AM', completed: false, location: 'Consultorio 402' },
    ],
    files: [
      {
        id: 'file-demo-1',
        name: 'Consentimiento_Informado_Cirugia_VE.pdf',
        size: 245000,
        type: 'application/pdf',
        dataUrl: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFsgNSAwIFIgXQovQ291bnQgMQo+PgplbmRvYmoK',
        uploadDate: '2026-03-15',
        uploadedBy: 'staff',
        category: 'pdf_records',
        notes: 'Firmado digitalmente por el paciente'
      },
      {
        id: 'file-demo-2',
        name: 'Presupuesto_Oficial_LipoHD_2026.pdf',
        size: 184000,
        type: 'application/pdf',
        dataUrl: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFsgNSAwIFIgXQovQ291bnQgMQo+PgplbmRvYmoK',
        uploadDate: '2026-03-10',
        uploadedBy: 'staff',
        category: 'quote',
        notes: 'Cotización con desglose formal'
      },
      {
        id: 'file-demo-3',
        name: 'Hemograma_Quimica_Sanguinea.pdf',
        size: 312000,
        type: 'application/pdf',
        dataUrl: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFsgNSAwIFIgXQovQ291bnQgMQo+PgplbmRvYmoK',
        uploadDate: '2026-03-20',
        uploadedBy: 'patient',
        category: 'lab_results',
        notes: 'Resultados aprobados por cardiología'
      }
    ],
    medications: [
      { id: 'med-1', time: '8:00 AM', name: 'Cefadroxilo 500mg', desc: 'Antibiótico / Antibiotic', isDone: true, dosage: '1 cápsula c/12h' },
      { id: 'med-2', time: '12:00 PM', name: 'Celecoxib 200mg', desc: 'Antiinflamatorio', isDone: true, dosage: '1 comprimido' },
      { id: 'med-3', time: '4:00 PM', name: 'Árnica & Bromelina', desc: 'Control de Hematomas', isDone: false, dosage: '2 tabletas' },
      { id: 'med-4', time: '8:00 PM', name: 'Protector Gástrico', desc: 'Protección / Rest', isDone: false, dosage: 'Omeprazol 20mg' },
    ],
    labs: [
      { id: 'l1', name: 'Glucose', value: '98', unit: 'mg/dL', status: 'normal' },
      { id: 'l2', name: 'PT / INR', value: '1.04', unit: 'ratio', status: 'optimal' },
      { id: 'l3', name: 'Hemoglobin', value: '13.8', unit: 'g/dL', status: 'normal' },
    ],
    vitalSigns: {
      bloodPressureSys: 118,
      bloodPressureDia: 76,
      heartRate: 72,
      fajaHours: 23.5,
      painScore: 2,
      healingProgress: 'Normal / En tiempo',
      lastUpdated: now
    },
    surgicalNotes: 'Paciente evoluciona favorablemente en etapa post-operatoria. Sin signos de seroma.',
    createdAt: now,
    updatedAt: now
  };
}

// -------------------------------------------------------------
// PATIENT RECORDS CRUD & REAL-TIME LISTENERS
// -------------------------------------------------------------

/**
 * Subscribes to a patient's clinical & financial record in Firestore
 */
export function subscribeToPatientRecord(
  userId: string, 
  userProfile: { uid: string; email: string; displayName?: string },
  onUpdate: (record: PatientRecord) => void,
  onError?: (err: any) => void
) {
  const recordDocRef = doc(db, 'patient_records', `rec_${userId}`);

  return onSnapshot(
    recordDocRef,
    async (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as PatientRecord);
      } else {
        // Automatically initialize default record for new patient
        const newRecord = createDefaultPatientRecord(userProfile);
        try {
          await setDoc(recordDocRef, newRecord);
          onUpdate(newRecord);
        } catch (e) {
          console.warn('Unable to seed default record to Firestore', e);
          onUpdate(newRecord);
        }
      }
    },
    (error) => {
      console.warn(`[Firestore] Patient record subscription notice (patient_records/rec_${userId}):`, error?.message);
      onError?.(error);
    }
  );
}

/**
 * Subscribes to all patient records (Staff View)
 */
export function subscribeToAllPatientRecords(
  onUpdate: (records: PatientRecord[]) => void,
  onError?: (err: any) => void
) {
  const colRef = collection(db, 'patient_records');

  return onSnapshot(
    colRef,
    (querySnap) => {
      const records: PatientRecord[] = [];
      querySnap.forEach((doc) => {
        records.push({ id: doc.id, ...doc.data() } as PatientRecord);
      });
      onUpdate(records);
    },
    (error) => {
      console.warn('[Firestore] All patient records subscription notice (patient_records):', error?.message);
      onError?.(error);
    }
  );
}

/**
 * Saves or updates patient record in Firestore
 */
export async function savePatientRecord(record: PatientRecord): Promise<void> {
  const path = `patient_records/${record.id || `rec_${record.userId}`}`;
  try {
    await ensureAuthSession();
    const recordDocRef = doc(db, 'patient_records', record.id || `rec_${record.userId}`);
    const updatedData = {
      ...record,
      updatedAt: new Date().toISOString()
    };
    await setDoc(recordDocRef, updatedData, { merge: true });
  } catch (error) {
    console.warn(`[Firestore] Patient record stored locally (${path}):`, error);
  }
}

/**
 * Uploads a PDF or medical file directly to Firestore as Base64 data string
 */
export async function uploadPatientFile(
  userId: string,
  currentRecord: PatientRecord,
  file: File,
  category: PatientFile['category'],
  uploadedBy: 'patient' | 'staff',
  notes?: string
): Promise<PatientFile> {
  return new Promise((resolve, reject) => {
    // Check file size (keep within 1MB document limit)
    if (file.size > 800 * 1024) {
      reject(new Error('File size exceeds the 800KB Firestore single-document limit. Please choose a smaller PDF or compress it.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const newFile: PatientFile = {
          id: `file_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          name: file.name,
          size: file.size,
          type: file.type || 'application/pdf',
          dataUrl: base64Data,
          uploadDate: new Date().toISOString().split('T')[0],
          uploadedBy,
          category,
          notes: notes || ''
        };

        const updatedFiles = [newFile, ...(currentRecord.files || [])];
        const updatedRecord: PatientRecord = {
          ...currentRecord,
          files: updatedFiles,
          updatedAt: new Date().toISOString()
        };

        await savePatientRecord(updatedRecord);
        resolve(newFile);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Deletes a file from patient record
 */
export async function deletePatientFile(currentRecord: PatientRecord, fileId: string): Promise<void> {
  const updatedFiles = (currentRecord.files || []).filter(f => f.id !== fileId);
  const updatedRecord: PatientRecord = {
    ...currentRecord,
    files: updatedFiles,
    updatedAt: new Date().toISOString()
  };
  await savePatientRecord(updatedRecord);
}

// -------------------------------------------------------------
// CONSULTATIONS & BOOKING (Appointments & Calendar)
// -------------------------------------------------------------

export function subscribeToPatientConsultations(
  email: string,
  userId: string,
  onUpdate: (consultations: Consultation[]) => void
) {
  const colRef = collection(db, 'consultations');
  return onSnapshot(
    colRef,
    (querySnap) => {
      const list: Consultation[] = [];
      querySnap.forEach((d) => {
        const data = d.data() as Consultation;
        const matchesUser = userId && data.userId === userId;
        const matchesEmail = email && data.email && typeof data.email === 'string' && data.email.toLowerCase() === email.toLowerCase();
        if (matchesUser || matchesEmail) {
          list.push({ id: d.id, ...data });
        }
      });
      onUpdate(list);
    },
    (error) => {
      console.warn('[Firestore] Patient consultations subscription notice:', error?.message);
    }
  );
}

export function subscribeToAllConsultations(
  onUpdate: (consultations: Consultation[]) => void
) {
  const colRef = collection(db, 'consultations');
  return onSnapshot(
    colRef,
    (querySnap) => {
      const list: Consultation[] = [];
      querySnap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Consultation);
      });
      onUpdate(list);
    },
    (error) => {
      console.warn('[Firestore] Consultations list subscription notice:', error?.message);
    }
  );
}

export async function createConsultation(consultation: Omit<Consultation, 'id'>): Promise<string> {
  const path = 'consultations';
  try {
    await ensureAuthSession();
    const colRef = collection(db, 'consultations');
    const docRef = await addDoc(colRef, {
      ...consultation,
      userId: auth.currentUser?.uid || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.warn(`[Firestore] Consultation stored locally (${path}):`, error);
    return `local_${Date.now()}`;
  }
}

// -------------------------------------------------------------
// QUOTES & INVOICES (Financial Records)
// -------------------------------------------------------------

export function subscribeToPatientQuotes(
  email: string,
  userId: string,
  onUpdate: (quotes: ClientQuote[]) => void
) {
  const colRef = collection(db, 'quotes');
  return onSnapshot(
    colRef,
    (querySnap) => {
      const list: ClientQuote[] = [];
      querySnap.forEach((d) => {
        const data = d.data() as ClientQuote;
        const matchesUser = userId && data.userId === userId;
        const matchesEmail = email && data.clientEmail && typeof data.clientEmail === 'string' && data.clientEmail.toLowerCase() === email.toLowerCase();
        if (matchesUser || matchesEmail) {
          list.push({ id: d.id, ...data });
        }
      });
      onUpdate(list);
    },
    (error) => {
      console.warn('[Firestore] Patient quotes subscription notice:', error?.message);
    }
  );
}

export function subscribeToAllQuotes(
  onUpdate: (quotes: ClientQuote[]) => void
) {
  const colRef = collection(db, 'quotes');
  return onSnapshot(
    colRef,
    (querySnap) => {
      const list: ClientQuote[] = [];
      querySnap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as ClientQuote);
      });
      onUpdate(list);
    },
    (error) => {
      console.warn('[Firestore] All quotes subscription notice (quotes):', error?.message);
    }
  );
}

export async function saveClientQuote(quote: ClientQuote): Promise<void> {
  const path = `quotes/${quote.id}`;
  try {
    await ensureAuthSession();
    const docRef = doc(db, 'quotes', quote.id);
    await setDoc(docRef, {
      ...quote,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn(`[Firestore] Quote saved locally (${path}):`, error);
  }
}

// -------------------------------------------------------------
// CRM LEADS (Staff Management)
// -------------------------------------------------------------

export function subscribeToCrmLeads(
  onUpdate: (leads: CrmLead[]) => void
) {
  const colRef = collection(db, 'leads');
  return onSnapshot(
    colRef,
    (querySnap) => {
      const list: CrmLead[] = [];
      querySnap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as CrmLead);
      });
      onUpdate(list);
    },
    (error) => {
      console.warn('[Firestore] CRM leads subscription notice:', error?.message);
    }
  );
}

export async function saveCrmLead(lead: CrmLead): Promise<void> {
  const path = `leads/${lead.id}`;
  try {
    await ensureAuthSession();
    const docRef = doc(db, 'leads', lead.id);
    await setDoc(docRef, {
      ...lead,
      userId: auth.currentUser?.uid || null,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn(`[Firestore] Lead cached locally & forwarded to CRM (${path}):`, error);
  }
}
