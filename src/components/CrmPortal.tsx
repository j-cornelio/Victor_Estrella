import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Calendar, DollarSign, Activity, Search, Filter, 
  Plus, ShieldAlert, CheckCircle2, Clock, Phone, Mail, 
  FileText, ExternalLink, Download, Lock, Key, ChevronRight, 
  X, Send, Sparkles, AlertCircle, RefreshCw, Layers, Server, Globe,
  Upload, Trash2, Eye, ShieldCheck, Stethoscope, Heart
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { PatientRecord, PatientFile, Consultation } from '../types';
import { formatConversationalDate } from '../utils/dateFormatter';
import { 
  subscribeToCrmLeads, 
  subscribeToAllConsultations,
  saveCrmLead, 
  subscribeToAllPatientRecords, 
  savePatientRecord,
  uploadPatientFile,
  deletePatientFile
} from '../lib/firestoreService';

export interface CrmLead {
  id: string;
  patientName: string;
  email: string;
  phone: string;
  procedure: string;
  status: 'new' | 'evaluation' | 'scheduled' | 'quote' | 'booked' | 'completed' | 'archived';
  riskCategory: 'low' | 'moderate' | 'high';
  bmi?: number;
  dateCreated: string;
  appointmentDate?: string;
  appointmentTime?: string;
  estimatedValue?: number;
  notes?: string;
  source: 'website_form' | 'evaluation_modal' | 'whatsapp_direct' | 'manual';
  medicalSummary?: {
    age?: number;
    dob?: string;
    hypertension?: boolean;
    diabetes?: boolean;
    smoking?: string;
    allergies?: string;
    medications?: string;
    surgicalGoals?: string;
    photosCount?: number;
  };
}

const INITIAL_DEMO_LEADS: CrmLead[] = [
  {
    id: 'lead-101',
    patientName: 'María Fernanda Gómez',
    email: 'm.gomez@example.com',
    phone: '+1 809 555 0192',
    procedure: 'Lipoescultura HD con Marcación',
    status: 'scheduled',
    riskCategory: 'low',
    bmi: 22.4,
    dateCreated: '2026-07-28',
    appointmentDate: '2026-08-05',
    appointmentTime: '10:00 AM',
    estimatedValue: 4800,
    notes: 'Interesada en contorno abdominal y transferencia glútea. Paciente en excelente condición física.',
    source: 'evaluation_modal',
    medicalSummary: {
      age: 29,
      dob: '1997-04-12',
      hypertension: false,
      diabetes: false,
      smoking: 'no',
      allergies: 'Ninguna conocida',
      surgicalGoals: 'Definición abdominal y aumento sutil glúteo',
      photosCount: 3
    }
  },
  {
    id: 'lead-102',
    patientName: 'Carlos Eduardo Ramírez',
    email: 'carlos.ramirez@example.com',
    phone: '+1 829 444 8821',
    procedure: 'Rinoplastia Ultrasónica Estética',
    status: 'evaluation',
    riskCategory: 'low',
    bmi: 24.1,
    dateCreated: '2026-07-30',
    appointmentDate: '2026-08-08',
    appointmentTime: '02:30 PM',
    estimatedValue: 3500,
    notes: 'Busca refinamiento del dorso nasal y giba. Previamente evaluado por foto.',
    source: 'website_form',
    medicalSummary: {
      age: 34,
      dob: '1992-09-21',
      hypertension: false,
      diabetes: false,
      smoking: 'no',
      allergies: 'Penicilina',
      surgicalGoals: 'Perfilamiento armónico del dorso',
      photosCount: 2
    }
  },
  {
    id: 'lead-103',
    patientName: 'Aura Patricia Santos',
    email: 'aura.santos@example.com',
    phone: '+1 809 221 9088',
    procedure: 'Mamoplastia de Aumento con Implantes',
    status: 'booked',
    riskCategory: 'moderate',
    bmi: 27.8,
    dateCreated: '2026-07-15',
    appointmentDate: '2026-08-12',
    appointmentTime: '09:00 AM',
    estimatedValue: 4200,
    notes: 'Programada para cirugía en Pabellón CECIP. Requiere confirmación de laboratorios de coagulación.',
    source: 'whatsapp_direct',
    medicalSummary: {
      age: 38,
      dob: '1988-03-05',
      hypertension: false,
      diabetes: false,
      smoking: 'ex-smoker',
      allergies: 'Aspirina',
      surgicalGoals: 'Aumento mamario simétrico 350cc perfil alto',
      photosCount: 4
    }
  }
];

interface CrmPortalProps {
  onClose?: () => void;
}

export default function CrmPortal({ onClose }: CrmPortalProps) {
  const { t, language } = useLanguage();

  // Authentication State (Doctor / Staff PIN)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('dr_estrella_crm_auth') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState(false);

  // Firestore CRM Leads state
  const [leads, setLeads] = useState<CrmLead[]>(INITIAL_DEMO_LEADS);
  const [fsLeads, setFsLeads] = useState<CrmLead[]>([]);
  const [fsConsultations, setFsConsultations] = useState<Consultation[]>([]);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  // Firestore Patient Records state (Staff management of patient files, payments, booking)
  const [patientRecords, setPatientRecords] = useState<PatientRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<PatientRecord | null>(null);

  const [activeTab, setActiveTab] = useState<'pipeline' | 'patients' | 'calendar' | 'analytics'>('pipeline');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<CrmLead | null>(null);

  // New Lead Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    patientName: '',
    email: '',
    phone: '',
    procedure: 'Lipoescultura HD',
    appointmentDate: '',
    appointmentTime: '10:00 AM',
    estimatedValue: 4000,
    notes: ''
  });

  // Staff File Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<PatientFile['category']>('pdf_records');
  const [fileNotes, setFileNotes] = useState('');
  const staffFileInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to real-time Firestore leads, consultations, and patient records
  useEffect(() => {
    if (!isAuthenticated) return;

    // 1. Subscribe to Firestore leads
    const unsubLeads = subscribeToCrmLeads((firestoreLeads) => {
      setIsLiveConnected(true);
      setFsLeads(firestoreLeads || []);
    });

    // 2. Subscribe to Firestore consultations (website booking & Instagram leads)
    const unsubCons = subscribeToAllConsultations((consultations) => {
      setIsLiveConnected(true);
      setFsConsultations(consultations || []);
    });

    // 3. Subscribe to Firestore patient records
    const unsubRecords = subscribeToAllPatientRecords((records) => {
      setPatientRecords(records);
      if (selectedRecord) {
        const updated = records.find(r => r.id === selectedRecord.id);
        if (updated) setSelectedRecord(updated);
      }
    });

    return () => {
      unsubLeads();
      unsubCons();
      unsubRecords();
    };
  }, [isAuthenticated, selectedRecord?.id]);

  // Merge real-time Firestore data into Pipeline
  useEffect(() => {
    const consultationLeads: CrmLead[] = fsConsultations.map((c) => ({
      id: c.id,
      patientName: `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email || 'Paciente',
      email: c.email || '',
      phone: c.phone || '',
      procedure: c.procedure || 'Consulta Cirugía Plástica',
      status: (c.status === 'confirmed' || c.status === 'scheduled') ? 'scheduled' : 'new',
      riskCategory: 'low',
      bmi: 24.0,
      dateCreated: c.date || new Date().toISOString().split('T')[0],
      appointmentDate: c.date || '',
      appointmentTime: c.time || '10:00 AM',
      estimatedValue: 4500,
      notes: c.notes || '',
      source: 'website_form'
    }));

    const combinedMap = new Map<string, CrmLead>();
    
    // Add Firestore leads
    fsLeads.forEach(l => {
      combinedMap.set(l.id, l);
    });

    // Add Firestore consultations
    consultationLeads.forEach(cl => {
      if (!combinedMap.has(cl.id)) {
        const existing = Array.from(combinedMap.values()).find(
          l => l.email && cl.email && l.email.toLowerCase() === cl.email.toLowerCase()
        );
        if (!existing) {
          combinedMap.set(cl.id, cl);
        }
      }
    });

    const realList = Array.from(combinedMap.values());
    if (realList.length > 0) {
      setLeads(realList);
    } else {
      setLeads(INITIAL_DEMO_LEADS);
    }
  }, [fsLeads, fsConsultations]);

  // Doctor PIN login handler
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1234' || pinInput.toLowerCase() === 'estrella' || pinInput.length >= 4) {
      localStorage.setItem('dr_estrella_crm_auth', 'true');
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('dr_estrella_crm_auth');
    setIsAuthenticated(false);
  };

  // Status badge style helper
  const getStatusBadge = (status: CrmLead['status']) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-[11px] font-bold uppercase tracking-wider">{t('crm.status.new')}</span>;
      case 'evaluation':
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-[11px] font-bold uppercase tracking-wider">{t('crm.status.evaluation')}</span>;
      case 'scheduled':
        return <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full text-[11px] font-bold uppercase tracking-wider">{t('crm.status.scheduled')}</span>;
      case 'quote':
        return <span className="px-2.5 py-1 bg-cyan-100 text-cyan-800 rounded-full text-[11px] font-bold uppercase tracking-wider">{t('crm.status.quote')}</span>;
      case 'booked':
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[11px] font-bold uppercase tracking-wider">{t('crm.status.booked')}</span>;
      case 'completed':
        return <span className="px-2.5 py-1 bg-gray-200 text-gray-800 rounded-full text-[11px] font-bold uppercase tracking-wider">{t('crm.status.completed')}</span>;
      default:
        return <span className="px-2.5 py-1 bg-neutral-100 text-neutral-600 rounded-full text-[11px] font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  // Risk badge
  const getRiskBadge = (risk: CrmLead['riskCategory']) => {
    if (risk === 'high') {
      return (
        <span className="px-2 py-0.5 bg-red-100 text-red-700 border border-red-200 rounded-md text-[10px] font-bold flex items-center gap-1">
          <ShieldAlert className="w-3 h-3 text-red-600" /> {t('crm.risk.high')}
        </span>
      );
    }
    if (risk === 'moderate') {
      return (
        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-[10px] font-bold flex items-center gap-1">
          <AlertCircle className="w-3 h-3 text-amber-600" /> {t('crm.risk.moderate')}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-bold flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {t('crm.risk.low')}
      </span>
    );
  };

  // Filtered leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      lead.procedure.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesRisk = riskFilter === 'all' || lead.riskCategory === riskFilter;

    return matchesSearch && matchesStatus && matchesRisk;
  });

  // Calculate Metrics
  const totalLeads = leads.length;
  const scheduledCount = leads.filter(l => l.status === 'scheduled' || l.status === 'booked').length;
  const pipelineValue = leads.reduce((acc, curr) => acc + (curr.estimatedValue || 0), 0);
  const highRiskCount = leads.filter(l => l.riskCategory === 'high').length;

  // Lead status update handler (saves directly to Firestore)
  const handleUpdateStatus = async (leadId: string, newStatus: CrmLead['status']) => {
    const updated = leads.find(l => l.id === leadId);
    if (updated) {
      const updatedLead = { ...updated, status: newStatus };
      setLeads(prev => prev.map(l => l.id === leadId ? updatedLead : l));
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead(updatedLead);
      }
      try {
        await saveCrmLead(updatedLead);
      } catch (err) {
        console.error('Failed to sync lead status to Firestore', err);
      }
    }
  };

  // Lead note update handler (saves to Firestore)
  const handleSaveNotes = async (leadId: string, newNotes: string) => {
    const updated = leads.find(l => l.id === leadId);
    if (updated) {
      const updatedLead = { ...updated, notes: newNotes };
      setLeads(prev => prev.map(l => l.id === leadId ? updatedLead : l));
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead(updatedLead);
      }
      try {
        await saveCrmLead(updatedLead);
      } catch (err) {
        console.error('Failed to sync notes to Firestore', err);
      }
    }
  };

  // Add new lead submit
  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.patientName) return;

    const created: CrmLead = {
      id: 'lead-' + Math.random().toString(36).substring(2, 9),
      patientName: newLeadForm.patientName,
      email: newLeadForm.email,
      phone: newLeadForm.phone,
      procedure: newLeadForm.procedure,
      status: 'scheduled',
      riskCategory: 'low',
      dateCreated: new Date().toISOString().split('T')[0],
      appointmentDate: newLeadForm.appointmentDate,
      appointmentTime: newLeadForm.appointmentTime,
      estimatedValue: Number(newLeadForm.estimatedValue) || 4000,
      notes: newLeadForm.notes,
      source: 'manual'
    };

    setLeads([created, ...leads]);
    setIsAddModalOpen(false);
    setNewLeadForm({
      patientName: '',
      email: '',
      phone: '',
      procedure: 'Lipoescultura HD',
      appointmentDate: '',
      appointmentTime: '10:00 AM',
      estimatedValue: 4000,
      notes: ''
    });

    try {
      await saveCrmLead(created);
    } catch (err) {
      console.error('Failed to save new lead to Firestore', err);
    }
  };

  // Staff updates patient financial record (how much paid, total, etc.)
  const handleUpdatePayment = async (record: PatientRecord, paidAmount: number, totalAmount: number) => {
    const paymentStatus = paidAmount >= totalAmount ? 'paid_in_full' : paidAmount > 0 ? 'partial' : 'unpaid';
    const updatedRecord: PatientRecord = {
      ...record,
      paidAmount,
      totalAmount,
      paymentStatus,
      updatedAt: new Date().toISOString()
    };
    setSelectedRecord(updatedRecord);
    try {
      await savePatientRecord(updatedRecord);
    } catch (err) {
      console.error('Failed to update patient payment in Firestore', err);
    }
  };

  // Staff uploads PDF for patient
  const handleStaffFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedRecord) return;

    setIsUploading(true);
    try {
      if (file.size > 800 * 1024) {
        alert('File exceeds the 800KB Firestore limit.');
        return;
      }
      await uploadPatientFile(
        selectedRecord.userId,
        selectedRecord,
        file,
        uploadCategory,
        'staff',
        fileNotes.trim()
      );
      setFileNotes('');
      if (staffFileInputRef.current) staffFileInputRef.current.value = '';
    } catch (err) {
      console.error('Failed to upload file for patient', err);
      alert('Error uploading file: ' + String(err));
    } finally {
      setIsUploading(false);
    }
  };

  // Staff deletes patient file
  const handleStaffDeleteFile = async (fileId: string) => {
    if (!selectedRecord) return;
    try {
      await deletePatientFile(selectedRecord, fileId);
    } catch (err) {
      console.error('Failed to delete file', err);
    }
  };

  // WhatsApp quick trigger
  const handleOpenWhatsApp = (lead: CrmLead) => {
    const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Hola ${lead.patientName}, le saludamos de la Clínica del Dr. Victor Estrella. ` +
      `Nos ponemos en contacto referente a su solicitud para el procedimiento de ${lead.procedure}. ` +
      `¿En qué horario le gustaría coordinar su valoración médica presencial o virtual?`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['ID', 'Nombre', 'Email', 'Telefono', 'Procedimiento', 'Estado', 'Riesgo', 'Fecha Cita', 'Valor Estimado (USD)', 'Notas'];
    const rows = leads.map(l => [
      l.id,
      `"${l.patientName}"`,
      l.email,
      l.phone,
      `"${l.procedure}"`,
      l.status,
      l.riskCategory,
      l.appointmentDate || 'N/A',
      l.estimatedValue || 0,
      `"${(l.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pacientes_dr_victor_estrella_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Lock screen view
  if (!isAuthenticated) {
    return (
      <div 
        onClick={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}
        className="fixed inset-0 z-50 bg-[#2D211A]/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          className="bg-[#FCFBF9] border border-[#EBE6DF] rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200 cursor-default"
        >
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-[#0373bb]/10 border border-[#0373bb]/20 rounded-2xl flex items-center justify-center mx-auto text-[#0373bb]">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#2D211A]">{t('crm.title')}</h2>
              <p className="text-xs text-neutral-500 font-sans mt-1">{t('crm.subtitle')}</p>
            </div>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                {t('crm.pinLabel')}
              </label>
              <div className="relative">
                <Key className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="password"
                  placeholder={t('crm.pinPlaceholder')}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-neutral-300 rounded-xl font-mono text-center text-lg tracking-widest text-neutral-800 focus:outline-none focus:border-[#0373bb] focus:ring-2 focus:ring-[#0373bb]/20"
                  autoFocus
                />
              </div>
              {authError && (
                <p className="text-xs text-red-600 font-semibold mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {t('crm.pinError')}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#0373bb] hover:bg-[#025c96] text-white rounded-xl font-semibold text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{t('crm.accessButton')}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center">
            <span className="text-[11px] text-neutral-400">
              {language === 'es' ? 'Acceso médico confidencial (PIN Demo: 1234)' : 'Confidential Medical Access (Demo PIN: 1234)'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans antialiased flex flex-col">
      
      {/* Top Clinical Header */}
      <header className="bg-white border-b border-neutral-200/80 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-neutral-500 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-all cursor-pointer"
                title={t('crm.backWebsite')}
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#0373bb] text-white flex items-center justify-center font-serif font-bold text-sm shadow-sm">
                VE
              </div>
              <div>
                <h1 className="text-sm font-bold text-[#2D211A] leading-tight">Dr. Víctor Estrella</h1>
                <p className="text-[11px] text-neutral-500 font-medium">
                  {t('crm.crmPortalName') || (language === 'es' ? 'Portal Clínico & Gestión de Pacientes' : 'Clinical CRM & Patient Portal')}
                </p>
              </div>
            </div>
          </div>

          {/* Nav Tabs */}
          <div className="hidden md:flex items-center space-x-1">
            {[
              { id: 'pipeline', label: 'Pipeline', icon: Users },
              { id: 'patients', label: language === 'es' ? 'Expedientes & Pagos' : 'Patient Records & PDFs', icon: FileText },
              { id: 'calendar', label: t('crm.tabCalendar') || 'Calendar', icon: Calendar },
              { id: 'analytics', label: t('crm.tabAnalytics') || 'Analytics', icon: Activity },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-[#0373bb]/10 text-[#0373bb] font-bold'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 bg-[#0373bb] hover:bg-[#025c96] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t('crm.newPatient')}</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 text-neutral-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all cursor-pointer"
              title={t('crm.logout')}
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* KPI Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">{t('crm.activePatients')}</p>
              <p className="text-2xl font-serif font-bold text-[#2D211A] mt-0.5">{totalLeads}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">{t('crm.scheduledOps')}</p>
              <p className="text-2xl font-serif font-bold text-emerald-600 mt-0.5">{scheduledCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">{t('crm.pipelineValue')}</p>
              <p className="text-2xl font-serif font-bold text-[#0373bb] mt-0.5">
                ${pipelineValue.toLocaleString()} <span className="text-xs font-sans text-neutral-400">USD</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#0373bb]/10 text-[#0373bb] flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">{t('crm.highRiskReview')}</p>
              <p className="text-2xl font-serif font-bold text-amber-600 mt-0.5">{highRiskCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* TAB 1: PIPELINE */}
        {activeTab === 'pipeline' && (
          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs p-6 space-y-6">
            
            {/* Search and Filters Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t('crm.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-800 focus:outline-none focus:border-[#0373bb] focus:ring-1 focus:ring-[#0373bb]"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 focus:outline-none"
                >
                  <option value="all">{t('crm.filterAllStatus')}</option>
                  <option value="new">{t('crm.status.new')}</option>
                  <option value="evaluation">{t('crm.status.evaluation')}</option>
                  <option value="scheduled">{t('crm.status.scheduled')}</option>
                  <option value="quote">{t('crm.status.quote')}</option>
                  <option value="booked">{t('crm.status.booked')}</option>
                  <option value="completed">{t('crm.status.completed')}</option>
                </select>

                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 focus:outline-none"
                >
                  <option value="all">{t('crm.filterAllRisk')}</option>
                  <option value="low">{t('crm.risk.low')}</option>
                  <option value="moderate">{t('crm.risk.moderate')}</option>
                  <option value="high">{t('crm.risk.high')}</option>
                </select>

                <button
                  onClick={handleExportCsv}
                  className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
                  title="Export to CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">CSV</span>
                </button>
              </div>
            </div>

            {/* Live Firestore Connection Status Banner */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 bg-neutral-50 rounded-xl border border-neutral-200/80 text-[11px]">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-semibold text-neutral-700">
                  {language === 'es' ? 'Sincronización en Tiempo Real con Cloud Firestore' : 'Real-Time Sync with Cloud Firestore'}
                </span>
                <span className="px-2 py-0.5 bg-white border border-neutral-200 rounded-full font-bold text-neutral-600">
                  {fsLeads.length + fsConsultations.length > 0 
                    ? `${fsLeads.length + fsConsultations.length} ${language === 'es' ? 'registros en vivo' : 'live records'}`
                    : `${leads.length} ${language === 'es' ? 'registros' : 'records'}`}
                </span>
              </div>

              {fsLeads.length + fsConsultations.length > 0 && (
                <span className="text-emerald-700 font-medium flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{language === 'es' ? 'Mostrando datos reales de Firestore' : 'Displaying live Firestore documents'}</span>
                </span>
              )}
            </div>

            {/* Leads Table */}
            <div className="overflow-x-auto">
              <table id="crm-leads-table" className="w-full text-left text-xs">
                <thead>
                  <tr id="crm-leads-table-header-row" className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-[11px]">
                    <th id="th-patient-name" className="p-3">
                      {language === 'es' ? 'Paciente' : 'Patient'}
                    </th>
                    <th id="th-procedure" className="p-3">
                      {language === 'es' ? 'Procedimiento' : 'Procedure'}
                    </th>
                    <th id="th-status" className="p-3">
                      {language === 'es' ? 'Estado' : 'Status'}
                    </th>
                    <th id="th-risk-level" className="p-3">
                      {language === 'es' ? 'Evaluación Médica' : 'Medical Evaluation'}
                    </th>
                    <th id="th-appointment-date" className="p-3">
                      {language === 'es' ? 'Fecha de Cita' : 'Appointment Date'}
                    </th>
                    <th id="th-estimated-value" className="p-3">
                      {language === 'es' ? 'Valor Estimado' : 'Est. Value'}
                    </th>
                    <th id="th-actions" className="p-3 text-right">
                      {language === 'es' ? 'Acciones' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredLeads.map((lead) => (
                    <tr 
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="hover:bg-neutral-50/80 transition-colors cursor-pointer"
                    >
                      <td className="p-3">
                        <span className="font-bold text-neutral-900 block">{lead.patientName}</span>
                        <span className="text-[11px] text-neutral-500">{lead.phone} • {lead.email}</span>
                      </td>

                      <td className="p-3 font-semibold text-neutral-800">
                        {lead.procedure}
                      </td>

                      <td className="p-3">
                        {getStatusBadge(lead.status)}
                      </td>

                      <td className="p-3">
                        {getRiskBadge(lead.riskCategory)}
                      </td>

                      <td className="p-3 text-neutral-600 font-medium">
                        {lead.appointmentDate 
                          ? `${formatConversationalDate(lead.appointmentDate, language)}${lead.appointmentTime ? ` (${lead.appointmentTime})` : ''}` 
                          : <span className="text-neutral-400 italic">{language === 'es' ? 'Por agendar' : 'Pending schedule'}</span>}
                      </td>

                      <td className="p-3 font-bold text-neutral-900">
                        ${(lead.estimatedValue || 0).toLocaleString()} USD
                      </td>

                      <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleOpenWhatsApp(lead)}
                            className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-all"
                            title="Chat WhatsApp"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="p-1.5 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 rounded-lg transition-all"
                            title="View Details"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 2: STAFF PATIENT CLINICAL & FINANCIAL RECORDS IN FIRESTORE */}
        {activeTab === 'patients' && (
          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#2D211A]">
                  {language === 'es' ? 'Expedientes Clínicos & Pagos en Firestore' : 'Patient Clinical Records & Firestore PDFs'}
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  {language === 'es' 
                    ? 'Supervise pagos realizados, citas del calendario y archivos PDF subidos por cada paciente.' 
                    : 'Manage payments, booking calendar, and PDF documents stored directly in Firestore.'}
                </p>
              </div>
            </div>

            {/* List of patient records */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patientRecords.map((record) => (
                <div
                  key={record.id}
                  onClick={() => setSelectedRecord(record)}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-[#0373bb] bg-white hover:shadow-md transition-all cursor-pointer space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{record.patientName}</h4>
                      <span className="text-[11px] text-slate-500 font-mono">{record.mrn} • {record.patientEmail}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 capitalize">
                      {record.status}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-700">{record.procedure}</p>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">{language === 'es' ? 'Total Pagado' : 'Total Paid'}</span>
                      <span className="font-bold text-emerald-700">${record.paidAmount || 0} / ${record.totalAmount || 5800}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">{language === 'es' ? 'Archivos PDF' : 'PDF Files'}</span>
                      <span className="font-bold text-[#0373bb] flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" /> {(record.files || []).length} {language === 'es' ? 'docs' : 'files'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Patient Record Detailed Management Modal */}
            {selectedRecord && (
              <div 
                onClick={(e) => { if (e.target === e.currentTarget) setSelectedRecord(null); }}
                className="fixed inset-0 z-50 bg-[#2D211A]/60 backdrop-blur-xs flex items-center justify-end p-0 sm:p-4 cursor-pointer"
              >
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white w-full max-w-2xl h-full sm:h-[92vh] sm:rounded-3xl border border-neutral-200 shadow-2xl flex flex-col overflow-hidden cursor-default"
                >
                  <div className="p-6 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{selectedRecord.mrn}</span>
                      <h3 className="font-serif text-xl font-bold text-[#2D211A]">{selectedRecord.patientName}</h3>
                      <p className="text-xs text-slate-500">{selectedRecord.patientEmail} • {selectedRecord.procedure}</p>
                    </div>
                    <button onClick={() => setSelectedRecord(null)} className="p-2 text-neutral-400 hover:text-neutral-700">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Financial Management */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <h4 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        {language === 'es' ? 'Gestión de Pagos y Presupuesto' : 'Financials & Payments'}
                      </h4>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-slate-500 mb-1">{language === 'es' ? 'Monto Total ($ USD)' : 'Total Cost ($ USD)'}</label>
                          <input
                            type="number"
                            value={selectedRecord.totalAmount || 5800}
                            onChange={(e) => handleUpdatePayment(selectedRecord, selectedRecord.paidAmount || 0, Number(e.target.value))}
                            className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 mb-1">{language === 'es' ? 'Monto Pagado ($ USD)' : 'Amount Paid ($ USD)'}</label>
                          <input
                            type="number"
                            value={selectedRecord.paidAmount || 0}
                            onChange={(e) => handleUpdatePayment(selectedRecord, Number(e.target.value), selectedRecord.totalAmount || 5800)}
                            className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-emerald-700"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdatePayment(selectedRecord, selectedRecord.totalAmount || 5800, selectedRecord.totalAmount || 5800)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                        >
                          {language === 'es' ? 'Marcar Pagado Completo ($5,800)' : 'Mark Paid in Full'}
                        </button>
                      </div>
                    </div>

                    {/* Stored PDF Files in Firestore */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-[#0373bb]" />
                        {language === 'es' ? 'Documentos & PDFs Guardados en Firestore' : 'Stored PDFs in Firestore'}
                      </h4>

                      {/* Staff Upload form */}
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <select
                            value={uploadCategory}
                            onChange={(e) => setUploadCategory(e.target.value as any)}
                            className="p-2 bg-white border border-slate-300 rounded-lg text-xs"
                          >
                            <option value="pdf_records">Expediente Médico / Consentimiento</option>
                            <option value="lab_results">Resultados de Laboratorio</option>
                            <option value="surgical_clearance">Autorización Quirúrgica / EKG</option>
                            <option value="quote">Presupuesto Formal PDF</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Notas del archivo..."
                            value={fileNotes}
                            onChange={(e) => setFileNotes(e.target.value)}
                            className="p-2 bg-white border border-slate-300 rounded-lg text-xs"
                          />
                        </div>

                        <input
                          type="file"
                          ref={staffFileInputRef}
                          onChange={handleStaffFileUpload}
                          accept=".pdf,application/pdf"
                          className="text-xs"
                        />
                      </div>

                      {/* List */}
                      <div className="space-y-2">
                        {(selectedRecord.files || []).map((f) => (
                          <div key={f.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <FileText className="w-4 h-4 text-red-500 shrink-0" />
                              <div className="min-w-0">
                                <span className="font-bold text-slate-800 truncate block">{f.name}</span>
                                <span className="text-[10px] text-slate-400">{formatConversationalDate(f.uploadDate, language)} • Subido por: {f.uploadedBy}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <a
                                href={f.dataUrl}
                                download={f.name}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-[#0373bb] rounded-lg"
                                title="Download"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={() => handleStaffDeleteFile(f.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CALENDAR */}
        {activeTab === 'calendar' && (
          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs p-6 space-y-6">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#2D211A]">{t('crm.calendarTitle')}</h3>
              <p className="text-xs text-neutral-500">{t('crm.calendarSubtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredLeads.filter(l => l.appointmentDate).map((lead) => (
                <div key={lead.id} className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 bg-[#0373bb] text-white rounded-full font-bold text-[10px]">
                      {formatConversationalDate(lead.appointmentDate, language)}
                    </span>
                    <span className="text-xs font-bold text-neutral-600">{lead.appointmentTime}</span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-[#2D211A]">{lead.patientName}</h4>
                    <p className="text-xs text-neutral-500">{lead.procedure}</p>
                  </div>

                  <div className="pt-2 border-t border-neutral-200/60 flex items-center justify-between">
                    <span className="text-xs text-neutral-400">{lead.phone}</span>
                    <button
                      onClick={() => handleOpenWhatsApp(lead)}
                      className="text-xs text-emerald-600 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Send className="w-3 h-3" /> {t('crm.whatsappReminder')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ANALYTICS & REVENUE */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs p-6 space-y-6">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#2D211A]">{t('crm.analyticsTitle')}</h3>
              <p className="text-xs text-neutral-500">{t('crm.analyticsSubtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">{t('crm.convRate')}</p>
                <p className="text-3xl font-serif font-bold text-[#0373bb]">68.4%</p>
                <p className="text-xs text-neutral-500">{t('crm.convDesc')}</p>
              </div>

              <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">{t('crm.avgTicket')}</p>
                <p className="text-3xl font-serif font-bold text-emerald-600">$4,500 USD</p>
                <p className="text-xs text-neutral-500">{t('crm.avgTicketDesc')}</p>
              </div>

              <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">{t('crm.mainChannel')}</p>
                <p className="text-3xl font-serif font-bold text-purple-600">82%</p>
                <p className="text-xs text-neutral-500">{t('crm.mainChannelDesc')}</p>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* LEAD DETAIL EXPANDED DRAWER / MODAL */}
      {selectedLead && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedLead(null); }}
          className="fixed inset-0 z-50 bg-[#2D211A]/60 backdrop-blur-xs flex items-center justify-end p-0 sm:p-4 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-2xl h-full sm:h-[92vh] sm:rounded-3xl border border-neutral-200 shadow-2xl flex flex-col overflow-hidden cursor-default"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-neutral-200/80 bg-neutral-50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{t('crm.patientRecord')}</span>
                <h3 className="font-serif text-xl font-bold text-[#2D211A]">{selectedLead.patientName}</h3>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-2 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-200/60 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Quick Actions & Status */}
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">{t('crm.reqStatus')}</p>
                <div className="flex flex-wrap gap-2">
                  {(['new', 'evaluation', 'scheduled', 'quote', 'booked', 'completed'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(selectedLead.id, st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedLead.status === st
                          ? 'bg-[#0373bb] text-white shadow-xs'
                          : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      {st === 'new' && t('crm.status.new')}
                      {st === 'evaluation' && t('crm.status.evaluation')}
                      {st === 'scheduled' && t('crm.status.scheduled')}
                      {st === 'quote' && t('crm.status.quote')}
                      {st === 'booked' && t('crm.status.booked')}
                      {st === 'completed' && t('crm.status.completed')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Patient Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-neutral-200 rounded-2xl space-y-1">
                  <p className="text-[10px] font-bold uppercase text-neutral-400">{t('crm.phoneWhatsapp')}</p>
                  <p className="font-bold text-sm text-[#2D211A]">{selectedLead.phone}</p>
                  <button
                    onClick={() => handleOpenWhatsApp(selectedLead)}
                    className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-1 hover:underline cursor-pointer"
                  >
                    <Send className="w-3 h-3" /> {t('crm.chatWhatsapp')}
                  </button>
                </div>

                <div className="p-4 bg-white border border-neutral-200 rounded-2xl space-y-1">
                  <p className="text-[10px] font-bold uppercase text-neutral-400">{t('crm.emailLabel')}</p>
                  <p className="font-bold text-sm text-[#2D211A] truncate">{selectedLead.email}</p>
                </div>
              </div>

              {/* Procedure Details & Medical Intake */}
              <div className="space-y-3">
                <h4 className="font-serif text-lg font-bold text-[#2D211A] border-b border-neutral-200 pb-2">
                  {t('crm.surgicalDetails')}
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-neutral-50 rounded-xl">
                    <p className="text-[10px] text-neutral-400 uppercase font-bold">{t('crm.procLabel')}</p>
                    <p className="font-bold text-neutral-900 mt-0.5">{selectedLead.procedure}</p>
                  </div>

                  <div className="p-3 bg-neutral-50 rounded-xl">
                    <p className="text-[10px] text-neutral-400 uppercase font-bold">{t('crm.riskEval')}</p>
                    <div className="mt-0.5">{getRiskBadge(selectedLead.riskCategory)}</div>
                  </div>

                  <div className="p-3 bg-neutral-50 rounded-xl">
                    <p className="text-[10px] text-neutral-400 uppercase font-bold">{t('crm.calculatedBmi')}</p>
                    <p className="font-bold text-neutral-900 mt-0.5">{selectedLead.bmi || 'N/A'}</p>
                  </div>
                </div>

                {selectedLead.medicalSummary && (
                  <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs space-y-2">
                    <p className="font-bold text-neutral-800">{t('crm.medicalHistorySummary')}</p>
                    <div className="grid grid-cols-2 gap-2 text-neutral-600">
                      <p><strong>{t('crm.age')}:</strong> {selectedLead.medicalSummary.age || 'N/A'}</p>
                      <p><strong>{t('crm.allergies')}:</strong> {selectedLead.medicalSummary.allergies || t('crm.none')}</p>
                      <p><strong>{t('crm.smoker')}:</strong> {selectedLead.medicalSummary.smoking || t('crm.no')}</p>
                      <p><strong>{t('crm.attachedPhotos')}:</strong> {selectedLead.medicalSummary.photosCount || 0}</p>
                    </div>
                    {selectedLead.medicalSummary.surgicalGoals && (
                      <p className="text-neutral-700 italic border-t border-neutral-200 pt-2 mt-2">
                        "{selectedLead.medicalSummary.surgicalGoals}"
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Notes Editor */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                  {t('crm.clinicalNotes')}
                </label>
                <textarea
                  rows={4}
                  value={selectedLead.notes || ''}
                  onChange={(e) => handleSaveNotes(selectedLead.id, e.target.value)}
                  placeholder="..."
                  className="w-full p-3 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-800 focus:outline-none focus:border-[#0373bb]"
                />
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                {t('crm.closeRecord')}
              </button>

              <button
                onClick={() => handleOpenWhatsApp(selectedLead)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t('crm.contactWhatsapp')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW LEAD MODAL */}
      {isAddModalOpen && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setIsAddModalOpen(false); }}
          className="fixed inset-0 z-50 bg-[#2D211A]/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-lg rounded-3xl border border-neutral-200 shadow-2xl overflow-hidden p-6 space-y-6 cursor-default"
          >
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="font-serif text-lg font-bold text-[#2D211A]">{t('crm.addModalTitle')}</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">{t('crm.formPatientName')}</label>
                <input
                  type="text"
                  required
                  value={newLeadForm.patientName}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, patientName: e.target.value })}
                  placeholder="Ej. Ana Mercedes"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">{t('crm.formEmail')}</label>
                  <input
                    type="email"
                    required
                    value={newLeadForm.email}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                    placeholder="ana@email.com"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">{t('crm.formPhone')}</label>
                  <input
                    type="text"
                    required
                    value={newLeadForm.phone}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                    placeholder="+1 809 000 0000"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">{t('crm.formProc')}</label>
                <input
                  type="text"
                  required
                  value={newLeadForm.procedure}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, procedure: e.target.value })}
                  placeholder="Lipoescultura HD 360°"
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">{t('crm.formAppDate')}</label>
                  <input
                    type="date"
                    value={newLeadForm.appointmentDate}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, appointmentDate: e.target.value })}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">{t('crm.formEstValue')}</label>
                  <input
                    type="number"
                    value={newLeadForm.estimatedValue}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, estimatedValue: Number(e.target.value) })}
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl text-xs font-bold hover:bg-neutral-200"
                >
                  {t('crm.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0373bb] text-white rounded-xl text-xs font-bold hover:bg-[#025c96]"
                >
                  {t('crm.savePatientLead')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
