import React, { useState, useEffect, useRef } from 'react';
import { X, ClipboardCheck, AlertCircle, Info, Upload, Camera, FileText, Check, ShieldCheck, Calendar } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FemaleEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FemaleEvaluationModal({ isOpen, onClose }: FemaleEvaluationModalProps) {
  const { language } = useLanguage();
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form states
  const [personal, setPersonal] = useState({
    fullName: '',
    dob: '',
    age: '',
    email: '',
    phone: '',
    weight: '', // in lbs
    heightFeet: '', // in ft
    heightInches: '', // in inches
    height: '', // combined ft/in
    residence: '', // City / Country
    bmi: 0,
  });

  const [surgicalGoals, setSurgicalGoals] = useState({
    procedureOfInterest: '',
    timeline: '', // immediate, 3_months, 6_months, 1_year
    referral: '', // How did they hear about Dr. Victor Estrella
  });

  const [medical, setMedical] = useState({
    hypertension: false,
    diabetes: false,
    thyroid: false,
    heartCondition: false,
    anemia: false,
    autoimmune: false,
    lungCondition: false,
    hasCondition: 'no', // yes, no
    conditionsDetail: '',
    underTreatment: 'no', // yes, no
    treatmentDetail: '',
    hasPriorSurgeries: 'no', // yes, no
    surgeriesDetail: '',
  });

  const [infectious, setInfectious] = useState({
    hiv: false,
    hepatitis: false,
    syphilis: false,
    tuberculosis: false,
    mycobacterium: false,
    hasInfectious: 'no', // yes, no
    infectiousDetail: '',
    underTreatment: 'no', // yes, no
    treatmentDetail: '',
  });

  const [medsAllergies, setMedsAllergies] = useState({
    takingMeds: 'no', // yes, no
    medsDetail: '', // medications, vitamins, supplements
    hasAllergies: 'no', // yes, no
    allergiesDetail: '', // medications, anesthesia, latex, etc.
  });

  const [lifestyle, setLifestyle] = useState({
    smoking: 'no', // no, occasional, daily, vape
    alcohol: 'no', // no, occasional, frequent
  });

  const [gyneco, setGyneco] = useState({
    lastPeriod: '',
    pregnancyBreastfeeding: 'no', // no, pregnant, breastfeeding, both
    lastPregnancyDate: '',
    childrenCount: '0',
    abortionsCount: '0',
    csections: 'no', // no, yes
    csectionsCount: '0',
  });

  const [photos, setPhotos] = useState<{
    front: File | null;
    left: File | null;
    right: File | null;
    back: File | null;
    frontPreview: string;
    leftPreview: string;
    rightPreview: string;
    backPreview: string;
  }>({
    front: null,
    left: null,
    right: null,
    back: null,
    frontPreview: '',
    leftPreview: '',
    rightPreview: '',
    backPreview: '',
  });

  const frontFileRef = useRef<HTMLInputElement>(null);
  const leftFileRef = useRef<HTMLInputElement>(null);
  const rightFileRef = useRef<HTMLInputElement>(null);
  const backFileRef = useRef<HTMLInputElement>(null);

  const fileRefs = {
    front: frontFileRef,
    left: leftFileRef,
    right: rightFileRef,
    back: backFileRef,
  };

  // Calculate age automatically from DOB
  useEffect(() => {
    if (personal.dob) {
      const birthDate = new Date(personal.dob);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      if (calculatedAge >= 0) {
        setPersonal(prev => ({ ...prev, age: calculatedAge.toString() }));
      }
    }
  }, [personal.dob]);

  // Calculate BMI and update height string automatically (US Units: lbs, feet/inches)
  useEffect(() => {
    const wLbs = parseFloat(personal.weight);
    const ft = parseFloat(personal.heightFeet);
    const inches = parseFloat(personal.heightInches || '0');
    
    const heightString = (personal.heightFeet) 
      ? `${personal.heightFeet} ft ${personal.heightInches || '0'} in`
      : '';

    let calculatedBmi = 0;
    if (wLbs > 0 && ft > 0) {
      const totalInches = (ft * 12) + inches;
      if (totalInches > 0) {
        calculatedBmi = Math.round(((wLbs / (totalInches * totalInches)) * 703) * 10) / 10;
      }
    }

    setPersonal(prev => ({ 
      ...prev, 
      height: heightString,
      bmi: calculatedBmi 
    }));
  }, [personal.weight, personal.heightFeet, personal.heightInches]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const evaluationPayload = {
      personal,
      surgicalGoals,
      medical,
      infectious,
      medsAllergies,
      lifestyle,
      gyneco,
      photos: {
        frontPreview: photos.frontPreview,
        leftPreview: photos.leftPreview,
        rightPreview: photos.rightPreview,
        backPreview: photos.backPreview,
      },
      lang: language
    };

    try {
      const res = await fetch('/api/evaluation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(evaluationPayload)
      });

      if (!res.ok) {
        throw new Error(language === 'es' ? 'Error al enviar la evaluación. Por favor intente de nuevo.' : 'Failed to submit evaluation. Please try again.');
      }

      setIsSubmitted(true);

      // Persist evaluation locally
      try {
        const existingRaw = localStorage.getItem('female_evaluations');
        const list = existingRaw ? JSON.parse(existingRaw) : [];
        list.push({
          id: 'eval-' + Math.random().toString(36).substr(2, 9),
          date: new Date().toISOString().split('T')[0],
          personal,
          surgicalGoals,
          medical,
          infectious,
          medsAllergies,
          lifestyle,
          gyneco,
          photos: {
            front: photos.front ? photos.front.name : null,
            left: photos.left ? photos.left.name : null,
            right: photos.right ? photos.right.name : null,
            back: photos.back ? photos.back.name : null,
          }
        });
        localStorage.setItem('female_evaluations', JSON.stringify(list));
      } catch (err) {
        console.error('Error saving evaluation form', err);
      }
    } catch (err: any) {
      console.error('Error submitting evaluation', err);
      setSubmitError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBmiCategory = (bmi: number) => {
    if (bmi === 0) return '';
    if (bmi < 18.5) return language === 'es' ? 'Bajo peso' : 'Underweight';
    if (bmi < 24.9) return language === 'es' ? 'Normal (Ideal)' : 'Normal Weight (Ideal)';
    if (bmi < 29.9) return language === 'es' ? 'Sobrepeso' : 'Overweight';
    return language === 'es' ? 'Obesidad (Requiere evaluación especial)' : 'Obesity (Requires special evaluation)';
  };

  const getBmiColor = (bmi: number) => {
    if (bmi === 0) return 'text-neutral-500 bg-neutral-100';
    if (bmi >= 18.5 && bmi <= 24.9) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (bmi > 24.9 && bmi < 29.9) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  const handlePhotoChange = (key: 'front' | 'left' | 'right' | 'back', file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => ({
          ...prev,
          [key]: file,
          [`${key}Preview`]: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setPhotos(prev => ({
        ...prev,
        [key]: null,
        [`${key}Preview`]: ''
      }));
    }
  };

  const resetForm = () => {
    setStep(1);
    setIsSubmitted(false);
    setPersonal({ fullName: '', dob: '', age: '', email: '', phone: '', weight: '', heightFeet: '', heightInches: '', height: '', residence: '', bmi: 0 });
    setSurgicalGoals({ procedureOfInterest: '', timeline: '', referral: '' });
    setMedical({
      hypertension: false, diabetes: false, thyroid: false, heartCondition: false, anemia: false, autoimmune: false, lungCondition: false,
      hasCondition: 'no', conditionsDetail: '', underTreatment: 'no', treatmentDetail: '', hasPriorSurgeries: 'no', surgeriesDetail: ''
    });
    setInfectious({ hiv: false, hepatitis: false, syphilis: false, tuberculosis: false, mycobacterium: false, hasInfectious: 'no', infectiousDetail: '', underTreatment: 'no', treatmentDetail: '' });
    setMedsAllergies({ takingMeds: 'no', medsDetail: '', hasAllergies: 'no', allergiesDetail: '' });
    setLifestyle({ smoking: 'no', alcohol: 'no' });
    setGyneco({ lastPeriod: '', pregnancyBreastfeeding: 'no', lastPregnancyDate: '', childrenCount: '0', abortionsCount: '0', csections: 'no', csectionsCount: '0' });
    setPhotos({ front: null, left: null, right: null, back: null, frontPreview: '', leftPreview: '', rightPreview: '', backPreview: '' });
  };

  // Check if current step fields are valid to allow moving forward
  const isStepValid = () => {
    if (step === 1) {
      return personal.fullName && personal.dob && personal.age && personal.height && personal.weight && personal.phone && personal.email && personal.residence;
    }
    if (step === 2) {
      return surgicalGoals.procedureOfInterest && surgicalGoals.timeline;
    }
    if (step === 3) {
      if (medical.hasCondition === 'yes' && !medical.conditionsDetail) return false;
      if (medical.underTreatment === 'yes' && !medical.treatmentDetail) return false;
      if (medical.hasPriorSurgeries === 'yes' && !medical.surgeriesDetail) return false;
      if (infectious.hasInfectious === 'yes' && !infectious.infectiousDetail) return false;
      if (infectious.underTreatment === 'yes' && !infectious.treatmentDetail) return false;
      return true;
    }
    if (step === 4) {
      if (medsAllergies.takingMeds === 'yes' && !medsAllergies.medsDetail) return false;
      if (medsAllergies.hasAllergies === 'yes' && !medsAllergies.allergiesDetail) return false;
      return true;
    }
    if (step === 5) {
      return gyneco.lastPeriod;
    }
    return true;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#EBE6DF] shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-gradient-to-r from-neutral-50 to-[#FCFBF9]">
          <div className="text-left">
            <span className="text-[10px] tracking-widest font-bold text-[#0373bb] bg-[#0373bb]/10 px-2.5 py-1 uppercase rounded-md inline-block">
              {language === 'es' ? 'HISTORIAL MÉDICO DE EVALUACIÓN' : 'MEDICAL EVALUATION SYSTEM'}
            </span>
            <h3 className="font-serif text-xl sm:text-2xl text-[#2D211A] font-medium tracking-tight mt-1">
              {language === 'es' ? 'Evaluación Médica y Caso Quirúrgico' : 'Medical Evaluation & Surgical Intake'}
            </h3>
            <p className="text-xs text-[#7C6C63] flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0373bb]" />
              {language === 'es' ? 'PACIENTE FEMENINA • PROTECCIÓN DE DATOS HIPAA' : 'FEMALE PATIENT • SECURE HIPAA COMPLIANT'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-400 hover:text-neutral-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Intro Notification Banner */}
        {step === 1 && !isSubmitted && (
          <div className="bg-[#0373bb]/5 border-b border-[#0373bb]/10 px-6 py-4 text-left">
            <p className="text-[11px] sm:text-xs text-[#2D211A] leading-relaxed">
              {language === 'es' ? (
                <>
                  Para proceder con su consulta con el <strong>Dr. Estrella</strong>, le solicitamos amablemente que complete el formulario de evaluación médica y proporcione la información a continuación. Este formulario confidencial se utiliza únicamente para comprender adecuadamente sus necesidades, revisar su caso con precisión y estar completamente preparados para su consulta y, cuando corresponda, para proporcionar una cotización más personalizada.
                </>
              ) : (
                <>
                  To proceed with your consultation with <strong>Dr. Estrella</strong>, we kindly ask that you complete the medical evaluation form and provide the information below. This confidential form is used solely to properly understand your needs, review your case accurately, and be fully prepared for your consultation and, when applicable, to provide a more personalized quote.
                </>
              )}
            </p>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {isSubmitted ? (
            <div className="py-8 text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full flex items-center justify-center">
                <ClipboardCheck className="w-9 h-9" />
              </div>
              <div className="space-y-2">
                <h4 className="font-serif text-2xl text-[#2D211A] font-medium">
                  {language === 'es' ? '¡Formulario Enviado con Éxito!' : 'Evaluation Form Received!'}
                </h4>
                <p className="text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
                  {language === 'es' 
                    ? 'Su historial clínico completo y fotografías han sido encriptados y guardados en su expediente pre-operatorio. El Dr. Victor Estrella y su junta médica revisarán su aptitud quirúrgica antes de su cita virtual o presencial.' 
                    : 'Your clinical history and photographic case file have been securely encrypted and saved. Dr. Victor Estrella and his surgical board will analyze your physical readiness before your upcoming consultation.'}
                </p>
              </div>

              {/* Dynamic Assessment Result Box */}
              <div className="max-w-md mx-auto p-5 border border-dashed rounded-2xl bg-neutral-50/50 text-left space-y-3">
                <h5 className="font-bold text-xs text-[#2D211A] uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-[#0373bb]" />
                  {language === 'es' ? 'ESTADO DE EVALUACIÓN CLÍNICA' : 'CLINICAL EVALUATION HIGHLIGHTS'}
                </h5>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-neutral-400 block">{language === 'es' ? 'Paciente' : 'Patient'}:</span>
                    <span className="font-semibold text-neutral-800">{personal.fullName} ({personal.age} {language === 'es' ? 'años' : 'years'})</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">{language === 'es' ? 'IMC calculado' : 'Calculated BMI'}:</span>
                    <span className={`font-semibold px-2 py-0.5 rounded-sm border ${getBmiColor(personal.bmi)}`}>
                      {personal.bmi} ({getBmiCategory(personal.bmi)})
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">{language === 'es' ? 'Fotografías adjuntas' : 'Photos Provided'}:</span>
                    <span className="font-semibold text-neutral-800">
                      {[photos.front, photos.left, photos.right, photos.back].filter(Boolean).length} / 4
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">{language === 'es' ? 'Riesgo / Advertencias' : 'Risk Flag Status'}:</span>
                    <span className={`font-bold uppercase ${
                      medical.hypertension || medical.diabetes || medical.heartCondition || personal.bmi >= 30 || lifestyle.smoking !== 'no' || infectious.hasInfectious === 'yes'
                        ? 'text-rose-600'
                        : 'text-emerald-600'
                    }`}>
                      {medical.hypertension || medical.diabetes || medical.heartCondition || personal.bmi >= 30 || lifestyle.smoking !== 'no' || infectious.hasInfectious === 'yes'
                        ? (language === 'es' ? 'Moderado - Requiere Junta' : 'Moderate - Requires Review')
                        : (language === 'es' ? 'Bajo' : 'Low / Good Candidate')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 rounded-full text-xs font-semibold tracking-wider uppercase cursor-pointer"
                >
                  {language === 'es' ? 'Nueva Evaluación' : 'New Intake Form'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 bg-[#0373bb] text-white hover:bg-[#0373bb]/90 rounded-full text-xs font-semibold tracking-wider uppercase cursor-pointer"
                >
                  {language === 'es' ? 'Finalizar y Cerrar' : 'Close and Exit'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 text-left">
              {/* Step Indicators */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100 overflow-x-auto gap-2">
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <div key={s} className="flex items-center shrink-0">
                    <button
                      type="button"
                      onClick={() => setStep(s)}
                      disabled={s > step && !isStepValid()}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        step === s
                          ? 'bg-[#0373bb] text-white ring-4 ring-[#0373bb]/10 font-bold'
                          : step > s
                          ? 'bg-emerald-500 text-white'
                          : 'bg-neutral-100 text-neutral-400'
                      }`}
                    >
                      {s}
                    </button>
                    {s < 6 && (
                      <div className={`h-0.5 w-6 sm:w-10 mx-1 sm:mx-2 ${step > s ? 'bg-emerald-500' : 'bg-neutral-100'}`} />
                    )}
                  </div>
                ))}
              </div>

              {/* STEP 1: Patient Information */}
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="border-l-2 border-[#0373bb] pl-2">
                    <h4 className="font-serif text-lg text-[#2D211A] font-medium">
                      {language === 'es' ? 'Información Personal de la Paciente' : 'Patient Personal Information'}
                    </h4>
                    <p className="text-xs text-[#7C6C63]">{language === 'es' ? 'Complete sus datos identificativos generales' : 'Provide your general demographic parameters'}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#5C4D44] uppercase tracking-wide">{language === 'es' ? 'Nombre Completo' : 'Full Name'} *</label>
                    <input
                      type="text"
                      required
                      placeholder="Maria Mercedes Lopez"
                      value={personal.fullName}
                      onChange={(e) => setPersonal({ ...personal, fullName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#D5CDD2] focus:outline-none focus:ring-1 focus:ring-[#0373bb] focus:border-[#0373bb] text-xs font-sans bg-white text-[#2D211A]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5C4D44] uppercase tracking-wide">{language === 'es' ? 'Fecha de Nacimiento' : 'Date of Birth'} *</label>
                      <div className="relative clickable-date-input">
                        <input
                          type="date"
                          required
                          value={personal.dob}
                          onChange={(e) => setPersonal({ ...personal, dob: e.target.value })}
                          onClick={(e) => {
                            try {
                              (e.currentTarget as any).showPicker();
                            } catch (err) {}
                          }}
                          onFocus={(e) => {
                            try {
                              (e.currentTarget as any).showPicker();
                            } catch (err) {}
                          }}
                          className="w-full px-4 py-3 rounded-xl border border-[#D5CDD2] focus:outline-none focus:ring-1 focus:ring-[#0373bb] focus:border-[#0373bb] text-xs font-sans bg-white text-[#2D211A] cursor-pointer"
                        />
                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7B72] pointer-events-none" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5C4D44] uppercase tracking-wide">{language === 'es' ? 'Edad calculada' : 'Age calculated'} *</label>
                      <input
                        type="text"
                        disabled
                        readOnly
                        placeholder="--"
                        value={personal.age ? `${personal.age} ${language === 'es' ? 'años' : 'years'}` : ''}
                        className="w-full px-4 py-3 rounded-xl border border-[#D5CDD2] bg-neutral-50 text-neutral-500 text-xs font-sans"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5C4D44] uppercase tracking-wide">
                        {language === 'es' ? 'Peso Actual (lbs)' : 'Current Weight (lbs)'} *
                      </label>
                      <input
                        type="number"
                        required
                        placeholder="140"
                        value={personal.weight}
                        onChange={(e) => setPersonal({ ...personal, weight: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-[#D5CDD2] focus:outline-none focus:ring-1 focus:ring-[#0373bb] focus:border-[#0373bb] text-xs font-sans bg-white text-[#2D211A]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5C4D44] uppercase tracking-wide">
                        {language === 'es' ? 'Estatura' : 'Height'} *
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                          <input
                            type="number"
                            required
                            placeholder="5"
                            min="1"
                            max="8"
                            value={personal.heightFeet}
                            onChange={(e) => setPersonal({ ...personal, heightFeet: e.target.value })}
                            className="w-full pl-4 pr-8 py-3 rounded-xl border border-[#D5CDD2] focus:outline-none focus:ring-1 focus:ring-[#0373bb] focus:border-[#0373bb] text-xs font-sans bg-white text-[#2D211A]"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8C7B72] pointer-events-none">ft</span>
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            required
                            placeholder="6"
                            min="0"
                            max="11"
                            value={personal.heightInches}
                            onChange={(e) => setPersonal({ ...personal, heightInches: e.target.value })}
                            className="w-full pl-4 pr-8 py-3 rounded-xl border border-[#D5CDD2] focus:outline-none focus:ring-1 focus:ring-[#0373bb] focus:border-[#0373bb] text-xs font-sans bg-white text-[#2D211A]"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8C7B72] pointer-events-none">in</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic BMI calculator */}
                  {personal.bmi > 0 && (
                    <div className={`p-4 rounded-xl border flex items-center justify-between transition-all ${getBmiColor(personal.bmi)}`}>
                      <div>
                        <span className="text-xs uppercase font-bold tracking-wider">{language === 'es' ? 'ÍNDICE DE MASA CORPORAL (IMC)' : 'BODY MASS INDEX (BMI)'}</span>
                        <div className="font-serif text-xl font-bold">{personal.bmi}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold block">{getBmiCategory(personal.bmi)}</span>
                        {personal.bmi >= 30 && (
                          <span className="text-[10px] font-medium opacity-90 block mt-0.5 max-w-xs text-right leading-none">
                            {language === 'es' ? 'Los procedimientos de contorno corporal óptimos requieren IMC < 30.' : 'High definition contouring is clinically safer with BMI < 30.'}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5C4D44] uppercase tracking-wide">{language === 'es' ? 'Teléfono Móvil' : 'Phone Number'} *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+1 (809) 555-1234"
                        value={personal.phone}
                        onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-[#D5CDD2] focus:outline-none focus:ring-1 focus:ring-[#0373bb] focus:border-[#0373bb] text-xs font-sans bg-white text-[#2D211A]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5C4D44] uppercase tracking-wide">{language === 'es' ? 'Correo Electrónico' : 'Email Address'} *</label>
                      <input
                        type="email"
                        required
                        placeholder="maria@domain.com"
                        value={personal.email}
                        onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-[#D5CDD2] focus:outline-none focus:ring-1 focus:ring-[#0373bb] focus:border-[#0373bb] text-xs font-sans bg-white text-[#2D211A]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#5C4D44] uppercase tracking-wide">{language === 'es' ? 'Ciudad / País de Residencia' : 'City / Country of Residence'} *</label>
                    <input
                      type="text"
                      required
                      placeholder={language === 'es' ? 'Santo Domingo, República Dominicana' : 'New York, USA'}
                      value={personal.residence}
                      onChange={(e) => setPersonal({ ...personal, residence: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#D5CDD2] focus:outline-none focus:ring-1 focus:ring-[#0373bb] focus:border-[#0373bb] text-xs font-sans bg-white text-[#2D211A]"
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      disabled={!isStepValid()}
                      onClick={() => setStep(2)}
                      className="px-6 py-2.5 bg-[#0373bb] disabled:opacity-50 text-white rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      {language === 'es' ? 'Siguiente Paso' : 'Next Step'}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Surgical Goals */}
              {step === 2 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="border-l-2 border-[#0373bb] pl-2">
                    <h4 className="font-serif text-lg text-[#2D211A] font-medium">
                      {language === 'es' ? '1️⃣ Objetivos Quirúrgicos' : '1️⃣ Surgical Goals'}
                    </h4>
                    <p className="text-xs text-[#7C6C63]">{language === 'es' ? 'Especifique qué áreas de su cuerpo desea mejorar' : 'Specify the procedures or improvements you desire'}</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#5C4D44] uppercase tracking-wide">
                      {language === 'es' ? '¿Qué procedimiento(s) desea que le realice el Dr. Estrella, o qué áreas le gustaría mejorar?' : 'Which procedure(s) do you wish to have performed by Dr. Estrella, or which areas would you like to improve or address?'} *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder={language === 'es' ? 'Ej: Deseo realizarme un Mommy Makeup que incluya lipoescultura HD, abdominoplastia y aumento de mamas con implantes...' : 'e.g. I am seeking a high-definition liposuction, tummy tuck, and breast augmentation with breast implants...'}
                      value={surgicalGoals.procedureOfInterest}
                      onChange={(e) => setSurgicalGoals({ ...surgicalGoals, procedureOfInterest: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#D5CDD2] focus:outline-none focus:ring-1 focus:ring-[#0373bb] focus:border-[#0373bb] text-xs font-sans bg-white text-[#2D211A]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#5C4D44] uppercase tracking-wide">
                      {language === 'es' ? '¿Cuál es su cronograma aproximado para la cirugía?' : 'What is your approximate timeline for surgery?'} *
                    </label>
                    <select
                      required
                      value={surgicalGoals.timeline}
                      onChange={(e) => setSurgicalGoals({ ...surgicalGoals, timeline: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#D5CDD2] focus:outline-none focus:ring-1 focus:ring-[#0373bb] focus:border-[#0373bb] text-xs font-sans bg-white text-[#2D211A]"
                    >
                      <option value="">{language === 'es' ? '-- Seleccione una Opción --' : '-- Select Options --'}</option>
                      <option value="immediate">{language === 'es' ? 'Inmediato (Próximos 1-2 meses)' : 'Immediately (Next 1-2 months)'}</option>
                      <option value="3_months">{language === 'es' ? 'En 3 meses' : 'Within 3 months'}</option>
                      <option value="6_months">{language === 'es' ? 'En 6 meses' : 'Within 6 months'}</option>
                      <option value="1_year">{language === 'es' ? 'Próximo año / Solo explorando' : 'Next year / Just researching'}</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#5C4D44] uppercase tracking-wide">
                      {language === 'es' ? '8️⃣ ¿Cómo se enteró del Dr. Victor Estrella?' : '8️⃣ How did you hear about Dr. Victor Estrella?'}
                    </label>
                    <select
                      value={surgicalGoals.referral}
                      onChange={(e) => setSurgicalGoals({ ...surgicalGoals, referral: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#D5CDD2] focus:outline-none focus:ring-1 focus:ring-[#0373bb] focus:border-[#0373bb] text-xs font-sans bg-white text-[#2D211A]"
                    >
                      <option value="">{language === 'es' ? '-- Seleccionar --' : '-- Select Referrer --'}</option>
                      <option value="instagram">Instagram</option>
                      <option value="tiktok">TikTok</option>
                      <option value="google">Google Search / Web</option>
                      <option value="recommendation">{language === 'es' ? 'Recomendación de un Amigo o Paciente' : 'Recommended by a Friend/Patient'}</option>
                      <option value="realself">RealSelf</option>
                      <option value="other">{language === 'es' ? 'Otro medio' : 'Other'}</option>
                    </select>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-5 py-2 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 rounded-full text-xs font-semibold tracking-wider uppercase cursor-pointer"
                    >
                      {language === 'es' ? 'Atrás' : 'Back'}
                    </button>
                    <button
                      type="button"
                      disabled={!isStepValid()}
                      onClick={() => setStep(3)}
                      className="px-6 py-2.5 bg-[#0373bb] disabled:opacity-50 text-white rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      {language === 'es' ? 'Siguiente Paso' : 'Next Step'}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Medical History & Infectious Diseases */}
              {step === 3 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="border-l-2 border-[#0373bb] pl-2">
                    <h4 className="font-serif text-lg text-[#2D211A] font-medium">
                      {language === 'es' ? '2️⃣ Antecedentes Médicos y 3️⃣ Enfermedades Infecciosas' : '2️⃣ Medical History & 3️⃣ Infectious Diseases'}
                    </h4>
                    <p className="text-xs text-[#7C6C63]">{language === 'es' ? 'Información médica obligatoria de seguridad' : 'Mandatory health safety assessment'}</p>
                  </div>

                  <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                    <span className="text-xs font-bold text-[#5C4D44] block mb-2 uppercase tracking-wide">
                      {language === 'es' ? 'Por favor indique si alguna vez ha sido diagnosticada con alguno de los siguientes:' : 'Please indicate if you have ever been diagnosed with any of the following:'}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { key: 'hypertension', label_es: 'Hipertensión Arterial', label_en: 'High blood pressure' },
                        { key: 'diabetes', label_es: 'Diabetes Mellitus', label_en: 'Diabetes' },
                        { key: 'thyroid', label_es: 'Trastorno de Tiroides', label_en: 'Thyroid disorder' },
                        { key: 'heartCondition', label_es: 'Condición Cardíaca', label_en: 'Heart condition' },
                        { key: 'anemia', label_es: 'Anemia', label_en: 'Anemia' },
                        { key: 'autoimmune', label_es: 'Enfermedad Autoinmune', label_en: 'Autoimmune disease' },
                        { key: 'lungCondition', label_es: 'Condición Pulmonar o Respiratoria', label_en: 'Lung or respiratory condition' },
                      ].map((item) => (
                        <label key={item.key} className="flex items-center space-x-2.5 p-2 bg-white rounded-lg border border-neutral-100 hover:bg-neutral-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(medical as any)[item.key]}
                            onChange={(e) => setMedical({ ...medical, [item.key]: e.target.checked })}
                            className="rounded text-[#0373bb] focus:ring-[#0373bb] h-4 w-4"
                          />
                          <span className="text-xs text-neutral-700">
                            {language === 'es' ? item.label_es : item.label_en}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Other medical conditions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5C4D44] uppercase tracking-wide">
                        {language === 'es' ? '¿Padece de alguna otra condición médica?' : 'Do you currently have any other medical conditions?'}
                      </label>
                      <select
                        value={medical.hasCondition}
                        onChange={(e) => setMedical({ ...medical, hasCondition: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-[#D5CDD2] text-xs font-sans bg-white text-[#2D211A]"
                      >
                        <option value="no">{language === 'es' ? 'No, ninguna otra' : 'No, none other'}</option>
                        <option value="yes">{language === 'es' ? 'Sí (Especifique abajo)' : 'Yes (Please specify)'}</option>
                      </select>
                      {medical.hasCondition === 'yes' && (
                        <input
                          type="text"
                          required
                          placeholder={language === 'es' ? 'Describa su condición médica' : 'Describe your health conditions'}
                          value={medical.conditionsDetail}
                          onChange={(e) => setMedical({ ...medical, conditionsDetail: e.target.value })}
                          className="w-full mt-1.5 px-4 py-2.5 rounded-xl border border-[#D5CDD2] text-xs font-sans bg-white text-[#2D211A]"
                        />
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5C4D44] uppercase tracking-wide">
                        {language === 'es' ? '¿Está bajo algún tratamiento médico?' : 'Are you currently under medical treatment?'}
                      </label>
                      <select
                        value={medical.underTreatment}
                        onChange={(e) => setMedical({ ...medical, underTreatment: e.target.value })}
                        className="w-full px-4 py-2 rounded-xl border border-[#D5CDD2] text-xs font-sans bg-white text-[#2D211A]"
                      >
                        <option value="no">{language === 'es' ? 'No' : 'No'}</option>
                        <option value="yes">{language === 'es' ? 'Sí (Especifique detalles)' : 'Yes (Specify)'}</option>
                      </select>
                      {medical.underTreatment === 'yes' && (
                        <input
                          type="text"
                          required
                          placeholder={language === 'es' ? 'Detalle el tratamiento y especialista' : 'Detail treatment and specialist'}
                          value={medical.treatmentDetail}
                          onChange={(e) => setMedical({ ...medical, treatmentDetail: e.target.value })}
                          className="w-full mt-1.5 px-4 py-2.5 rounded-xl border border-[#D5CDD2] text-xs font-sans bg-white text-[#2D211A]"
                        />
                      )}
                    </div>
                  </div>

                  {/* Prior surgeries */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#5C4D44] uppercase tracking-wide">
                      {language === 'es' ? '¿Ha tenido cirugías previas?' : 'Have you had any prior surgeries?'}
                    </label>
                    <select
                      value={medical.hasPriorSurgeries}
                      onChange={(e) => setMedical({ ...medical, hasPriorSurgeries: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#D5CDD2] text-xs font-sans bg-white"
                    >
                      <option value="no">{language === 'es' ? 'No' : 'No'}</option>
                      <option value="yes">{language === 'es' ? 'Sí (Especifique tipo de cirugía y año)' : 'Yes (Specify type of surgery and year)'}</option>
                    </select>
                    {medical.hasPriorSurgeries === 'yes' && (
                      <textarea
                        required
                        rows={2}
                        placeholder={language === 'es' ? 'Ej: Cesárea en 2021, Apendicectomía en 2015, Lipoescultura en 2018...' : 'e.g. C-section in 2021, Appendectomy in 2015, Liposuction in 2018...'}
                        value={medical.surgeriesDetail}
                        onChange={(e) => setMedical({ ...medical, surgeriesDetail: e.target.value })}
                        className="w-full mt-2 px-4 py-3 rounded-xl border border-[#D5CDD2] text-xs font-sans bg-white"
                      />
                    )}
                  </div>

                  {/* 3 Infectious Diseases */}
                  <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100">
                    <span className="text-xs font-bold text-[#2D211A] block mb-2 uppercase tracking-wide flex items-center gap-1">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      {language === 'es' ? '3️⃣ Enfermedades Infecciosas o Transmisibles (Requerido)' : '3️⃣ Infectious & Communicable Diseases (Required)'}
                    </span>
                    <p className="text-[10px] text-neutral-500 mb-2 leading-relaxed">
                      {language === 'es' 
                        ? '¿Ha sido diagnosticada o tratada alguna vez por alguna enfermedad infecciosa, incluyendo de forma no limitativa:' 
                        : 'Have you ever been diagnosed with or treated for any infectious or communicable disease, including but not limited to:'}
                    </p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { key: 'hiv', label: 'HIV / SIDA' },
                        { key: 'hepatitis', label: 'Hepatitis (B / C)' },
                        { key: 'syphilis', label: language === 'es' ? 'Sífilis o ETS' : 'Syphilis / STIs' },
                        { key: 'tuberculosis', label: 'Tuberculosis (TB)' },
                        { key: 'mycobacterium', label: language === 'es' ? 'Micobacteria' : 'Mycobacterium' },
                      ].map((disease) => (
                        <label key={disease.key} className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-neutral-100 hover:bg-neutral-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(infectious as any)[disease.key]}
                            onChange={(e) => setInfectious({ ...infectious, [disease.key]: e.target.checked })}
                            className="rounded text-rose-600 focus:ring-rose-500 h-4 w-4"
                          />
                          <span className="text-xs text-neutral-700 font-medium">{disease.label}</span>
                        </label>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-600 uppercase tracking-wide">{language === 'es' ? '¿Desea reportar detalles de estas u otras condiciones?' : 'Do you have details to report regarding these?'}</label>
                        <select
                          value={infectious.hasInfectious}
                          onChange={(e) => setInfectious({ ...infectious, hasInfectious: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 text-xs bg-white"
                        >
                          <option value="no">{language === 'es' ? 'No, ninguna' : 'No'}</option>
                          <option value="yes">{language === 'es' ? 'Sí, especificar' : 'Yes, specify'}</option>
                        </select>
                        {infectious.hasInfectious === 'yes' && (
                          <input
                            type="text"
                            required
                            placeholder={language === 'es' ? 'Condición y fecha de diagnóstico' : 'Condition and diagnosis date'}
                            value={infectious.infectiousDetail}
                            onChange={(e) => setInfectious({ ...infectious, infectiousDetail: e.target.value })}
                            className="w-full mt-1.5 px-3 py-2 rounded-lg border border-neutral-200 text-xs bg-white"
                          />
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-neutral-600 uppercase tracking-wide">{language === 'es' ? '¿Está bajo tratamiento actualmente?' : 'Are you currently under treatment?'}</label>
                        <select
                          value={infectious.underTreatment}
                          onChange={(e) => setInfectious({ ...infectious, underTreatment: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 text-xs bg-white"
                        >
                          <option value="no">{language === 'es' ? 'No' : 'No'}</option>
                          <option value="yes">{language === 'es' ? 'Sí, bajo tratamiento activo' : 'Yes, active treatment'}</option>
                        </select>
                        {infectious.underTreatment === 'yes' && (
                          <input
                            type="text"
                            required
                            placeholder={language === 'es' ? 'Detalle de medicamentos' : 'Medications detail'}
                            value={infectious.treatmentDetail}
                            onChange={(e) => setInfectious({ ...infectious, treatmentDetail: e.target.value })}
                            className="w-full mt-1.5 px-3 py-2 rounded-lg border border-neutral-200 text-xs bg-white"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-5 py-2 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 rounded-full text-xs font-semibold tracking-wider uppercase cursor-pointer"
                    >
                      {language === 'es' ? 'Atrás' : 'Back'}
                    </button>
                    <button
                      type="button"
                      disabled={!isStepValid()}
                      onClick={() => setStep(4)}
                      className="px-6 py-2.5 bg-[#0373bb] disabled:opacity-50 text-white rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      {language === 'es' ? 'Siguiente Paso' : 'Next Step'}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Medications, Allergies & Lifestyle */}
              {step === 4 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="border-l-2 border-[#0373bb] pl-2">
                    <h4 className="font-serif text-lg text-[#2D211A] font-medium">
                      {language === 'es' ? '4️⃣ Medicamentos y Alergias / 5️⃣ Estilo de Vida' : '4️⃣ Medications & Allergies / 5️⃣ Lifestyle Information'}
                    </h4>
                    <p className="text-xs text-[#7C6C63]">{language === 'es' ? 'Farmacovigilancia y factores de hábitos diarios' : 'Pharmacological screening and routine habits'}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5C4D44] uppercase tracking-wide">
                        {language === 'es' ? '¿Toma actualmente algún medicamento, vitamina o suplemento?' : 'Are you currently taking any medications, vitamins, or supplements?'}
                      </label>
                      <select
                        value={medsAllergies.takingMeds}
                        onChange={(e) => setMedsAllergies({ ...medsAllergies, takingMeds: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#D5CDD2] text-xs bg-white text-[#2D211A]"
                      >
                        <option value="no">{language === 'es' ? 'No, ninguno' : 'No, none'}</option>
                        <option value="yes">{language === 'es' ? 'Sí (Especifique abajo)' : 'Yes (Please specify)'}</option>
                      </select>
                      {medsAllergies.takingMeds === 'yes' && (
                        <textarea
                          required
                          rows={2}
                          placeholder={language === 'es' ? 'Ej: Aspirina 100mg diario, Gomitas de Colágeno, Anticonceptivos orales...' : 'e.g. Aspirin 100mg daily, Collagen Gummies, Oral Contraceptives...'}
                          value={medsAllergies.medsDetail}
                          onChange={(e) => setMedsAllergies({ ...medsAllergies, medsDetail: e.target.value })}
                          className="w-full mt-2 px-4 py-2 text-xs font-sans bg-white border border-[#D5CDD2] rounded-xl text-[#2D211A]"
                        />
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5C4D44] uppercase tracking-wide">
                        {language === 'es' ? '¿Tiene alergias conocidas? (medicamentos, anestesia, látex, etc.)' : 'Do you have any known allergies? (medications, anesthesia, latex, etc.)'}
                      </label>
                      <select
                        value={medsAllergies.hasAllergies}
                        onChange={(e) => setMedsAllergies({ ...medsAllergies, hasAllergies: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#D5CDD2] text-xs bg-white text-[#2D211A]"
                      >
                        <option value="no">{language === 'es' ? 'No, ninguna conocida' : 'No, none known'}</option>
                        <option value="yes">{language === 'es' ? 'Sí (Especifique abajo)' : 'Yes (Please specify)'}</option>
                      </select>
                      {medsAllergies.hasAllergies === 'yes' && (
                        <textarea
                          required
                          rows={2}
                          placeholder={language === 'es' ? 'Ej: Alergia a la Penicilina, al Látex, a la anestesia local...' : 'e.g. Allergy to Penicillin, Latex, Local Anesthetics...'}
                          value={medsAllergies.allergiesDetail}
                          onChange={(e) => setMedsAllergies({ ...medsAllergies, allergiesDetail: e.target.value })}
                          className="w-full mt-2 px-4 py-2 text-xs font-sans bg-white border border-[#D5CDD2] rounded-xl text-[#2D211A]"
                        />
                      )}
                    </div>
                  </div>

                  {/* 5 Lifestyle */}
                  <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/55 space-y-4">
                    <span className="text-xs font-bold text-[#2D211A] block uppercase tracking-wide">
                      {language === 'es' ? '5️⃣ Estilo de Vida y Hábitos diarios' : '5️⃣ Lifestyle Information'}
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-700">{language === 'es' ? '¿Fuma o Vapea?' : 'Do you smoke or vape?'}</label>
                        <select
                          value={lifestyle.smoking}
                          onChange={(e) => setLifestyle({ ...lifestyle, smoking: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white text-xs"
                        >
                          <option value="no">{language === 'es' ? 'No, nunca' : 'No, never'}</option>
                          <option value="occasional">{language === 'es' ? 'Ocasionalmente o Vapeo / Narguile' : 'Occasionally or Vaping / Hookah'}</option>
                          <option value="daily">{language === 'es' ? 'Fumador diario' : 'Daily smoking'}</option>
                        </select>
                        {lifestyle.smoking !== 'no' && (
                          <div className="flex items-center gap-1 p-2 bg-rose-50 border border-rose-100 rounded text-[9px] text-rose-700 leading-tight">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{language === 'es' ? 'Debe suspender el tabaco 30 días antes de la cirugía.' : 'Must suspend all tobacco/vape use 30 days prior to surgery.'}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-700">{language === 'es' ? '¿Consume Alcohol?' : 'Do you consume alcohol?'}</label>
                        <select
                          value={lifestyle.alcohol}
                          onChange={(e) => setLifestyle({ ...lifestyle, alcohol: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-white text-xs"
                        >
                          <option value="no">{language === 'es' ? 'No' : 'No, never'}</option>
                          <option value="occasional">{language === 'es' ? 'Ocasional / Eventos sociales' : 'Occasionally / Social events'}</option>
                          <option value="frequent">{language === 'es' ? 'Frecuente' : 'Frequent'}</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-5 py-2 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 rounded-full text-xs font-semibold tracking-wider uppercase cursor-pointer"
                    >
                      {language === 'es' ? 'Atrás' : 'Back'}
                    </button>
                    <button
                      type="button"
                      disabled={!isStepValid()}
                      onClick={() => setStep(5)}
                      className="px-6 py-2.5 bg-[#0373bb] disabled:opacity-50 text-white rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      {language === 'es' ? 'Siguiente Paso' : 'Next Step'}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: Female Health Information */}
              {step === 5 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="border-l-2 border-[#0373bb] pl-2">
                    <h4 className="font-serif text-lg text-[#2D211A] font-medium">
                      {language === 'es' ? '6️⃣ Salud Femenina / Ginecológica (Requerido)' : '6️⃣ Female Health Information (Required)'}
                    </h4>
                    <p className="text-xs text-[#7C6C63]">{language === 'es' ? 'Esencial para planificar cirugías de busto o abdominoplastia' : 'Essential metrics for mommy makeover and core contouring planning'}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5C4D44] uppercase tracking-wide">
                        {language === 'es' ? 'Fecha de última menstruación (FUM)' : 'Date of last menstrual period (LMP)'} *
                      </label>
                      <div className="relative clickable-date-input">
                        <input
                          type="date"
                          required
                          value={gyneco.lastPeriod}
                          onChange={(e) => setGyneco({ ...gyneco, lastPeriod: e.target.value })}
                          onClick={(e) => {
                            try {
                              (e.currentTarget as any).showPicker();
                            } catch (err) {}
                          }}
                          onFocus={(e) => {
                            try {
                              (e.currentTarget as any).showPicker();
                            } catch (err) {}
                          }}
                          className="w-full px-4 py-3 rounded-xl border border-[#D5CDD2] focus:outline-none focus:ring-1 focus:ring-[#0373bb] focus:border-[#0373bb] text-xs font-sans bg-white text-[#2D211A] cursor-pointer"
                        />
                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7B72] pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5C4D44] uppercase tracking-wide">
                        {language === 'es' ? '¿Está embarazada o amamantando actualmente?' : 'Are you currently pregnant or breastfeeding?'}
                      </label>
                      <select
                        value={gyneco.pregnancyBreastfeeding}
                        onChange={(e) => setGyneco({ ...gyneco, pregnancyBreastfeeding: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-[#D5CDD2] text-xs bg-white text-[#2D211A]"
                      >
                        <option value="no">{language === 'es' ? 'No, ninguna' : 'No, neither'}</option>
                        <option value="pregnant">{language === 'es' ? 'Sí, embarazada' : 'Yes, pregnant'}</option>
                        <option value="breastfeeding">{language === 'es' ? 'Sí, amamantando' : 'Yes, breastfeeding'}</option>
                        <option value="both">{language === 'es' ? 'Ambas' : 'Both'}</option>
                      </select>
                      {gyneco.pregnancyBreastfeeding !== 'no' && (
                        <div className="flex items-center gap-1.5 p-2 bg-rose-50 border border-rose-100 rounded-lg text-[10px] text-rose-700 font-medium">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            {language === 'es' 
                              ? 'Atención: No es posible realizar cirugías durante el embarazo o lactancia. Debe esperar 6 meses post-destete.' 
                              : 'Warning: Surgery is strictly contraindicated. Must wait 6 months post-lactation to guarantee physical safety.'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5C4D44] uppercase tracking-wide">
                        {language === 'es' ? 'Fecha de último embarazo o parto' : 'Date of last pregnancy or delivery'}
                      </label>
                      <div className="relative clickable-date-input">
                        <input
                          type="date"
                          value={gyneco.lastPregnancyDate}
                          onChange={(e) => setGyneco({ ...gyneco, lastPregnancyDate: e.target.value })}
                          onClick={(e) => {
                            try {
                              (e.currentTarget as any).showPicker();
                            } catch (err) {}
                          }}
                          onFocus={(e) => {
                            try {
                              (e.currentTarget as any).showPicker();
                            } catch (err) {}
                          }}
                          className="w-full px-4 py-3 rounded-xl border border-[#D5CDD2] text-xs bg-white text-[#2D211A] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#0373bb] focus:border-[#0373bb]"
                        />
                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7B72] pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5C4D44] uppercase tracking-wide">
                        {language === 'es' ? 'Número de Hijos' : 'Number of children'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={gyneco.childrenCount}
                        onChange={(e) => setGyneco({ ...gyneco, childrenCount: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-[#D5CDD2] text-xs bg-white text-[#2D211A]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5C4D44] uppercase tracking-wide">
                        {language === 'es' ? 'Número de abortos / pérdidas' : 'Number of abortions / miscarriages'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={gyneco.abortionsCount}
                        onChange={(e) => setGyneco({ ...gyneco, abortionsCount: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-[#D5CDD2] text-xs bg-white text-[#2D211A]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5C4D44] uppercase tracking-wide">
                        {language === 'es' ? '¿Historial de cesáreas?' : 'History of C-sections?'}
                      </label>
                      <select
                        value={gyneco.csections}
                        onChange={(e) => setGyneco({ ...gyneco, csections: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-[#D5CDD2] text-xs bg-white text-[#2D211A]"
                      >
                        <option value="no">{language === 'es' ? 'No' : 'No'}</option>
                        <option value="yes">{language === 'es' ? 'Sí' : 'Yes'}</option>
                      </select>
                      {gyneco.csections === 'yes' && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <label className="text-[10px] text-neutral-500 font-bold uppercase shrink-0">{language === 'es' ? '¿Cuántas?' : 'How many?'}</label>
                          <input
                            type="number"
                            min="1"
                            value={gyneco.csectionsCount}
                            onChange={(e) => setGyneco({ ...gyneco, csectionsCount: e.target.value })}
                            className="w-16 px-2 py-1 rounded border border-neutral-300 text-xs text-[#2D211A]"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="px-5 py-2 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 rounded-full text-xs font-semibold tracking-wider uppercase cursor-pointer"
                    >
                      {language === 'es' ? 'Atrás' : 'Back'}
                    </button>
                    <button
                      type="button"
                      disabled={!isStepValid()}
                      onClick={() => setStep(6)}
                      className="px-6 py-2.5 bg-[#0373bb] disabled:opacity-50 text-white rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      {language === 'es' ? 'Siguiente Paso' : 'Next Step'}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 6: Clinical Photographs */}
              {step === 6 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="border-l-2 border-[#0373bb] pl-2">
                    <h4 className="font-serif text-lg text-[#2D211A] font-medium">
                      {language === 'es' ? '7️⃣ Fotografías Clínicas (Requerido)' : '7️⃣ Clinical Photographs (Required)'}
                    </h4>
                    <p className="text-xs text-[#7C6C63]">
                      {language === 'es' 
                        ? 'Por favor proporcione fotos actuales (parada naturalmente, con buena iluminación).' 
                        : 'Please provide current photos (standing naturally, in a well-lit environment).'}
                    </p>
                  </div>

                  <div className="bg-[#0373bb]/5 border border-[#0373bb]/10 rounded-2xl p-4 flex gap-3 text-left">
                    <Info className="w-5 h-5 text-[#0373bb] shrink-0 mt-0.5" />
                    <div className="text-[11px] sm:text-xs text-[#2D211A] leading-relaxed">
                      <strong>{language === 'es' ? 'Requisitos fotográficos:' : 'Required angles for surgical board assessment:'}</strong>
                      <ul className="list-disc list-inside mt-1 space-y-0.5 text-neutral-600 font-mono text-[10px]">
                        <li>{language === 'es' ? 'Vista frontal (Front view)' : 'Front view'}</li>
                        <li>{language === 'es' ? 'Vista lateral izquierda (Left side view)' : 'Left side view'}</li>
                        <li>{language === 'es' ? 'Vista lateral derecha (Right side view)' : 'Right side view'}</li>
                        <li>{language === 'es' ? 'Vista trasera / posterior (Back view)' : 'Back view'}</li>
                      </ul>
                      <p className="mt-1 text-neutral-400 text-[10px]">*{language === 'es' ? 'Las imágenes se almacenan de forma local y confidencial' : 'Stored locally with secure sandboxed privileges'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: 'front', label_es: 'Vista Frontal', label_en: 'Front View' },
                      { key: 'left', label_es: 'Vista Lateral Izquierda', label_en: 'Left Side View' },
                      { key: 'right', label_es: 'Vista Lateral Derecha', label_en: 'Right Side View' },
                      { key: 'back', label_es: 'Vista Posterior', label_en: 'Back View' },
                    ].map((photoItem) => {
                      const key = photoItem.key as 'front' | 'left' | 'right' | 'back';
                      const fileRef = fileRefs[key];
                      const preview = photos[`${key}Preview`];
                      
                      return (
                        <div 
                          key={key} 
                          className="border border-[#EBE6DF] bg-neutral-50/50 hover:bg-neutral-50 rounded-2xl p-3 text-center transition-all flex flex-col justify-between min-h-[140px]"
                        >
                          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-2">
                            {language === 'es' ? photoItem.label_es : photoItem.label_en}
                          </span>
                          
                          {preview ? (
                            <div className="relative w-full h-24 rounded-lg overflow-hidden group">
                              <img 
                                src={preview} 
                                alt={photoItem.label_en} 
                                className="w-full h-full object-cover" 
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                <button
                                  type="button"
                                  onClick={() => handlePhotoChange(key, null)}
                                  className="p-1.5 bg-rose-600 text-white rounded-full text-xs hover:bg-rose-700 cursor-pointer"
                                  aria-label="Remove photo"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div 
                              onClick={() => fileRef.current?.click()}
                              className="border border-dashed border-neutral-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-[#0373bb]/40 hover:bg-[#0373bb]/5 transition-all flex-1"
                            >
                              <Camera className="w-6 h-6 text-neutral-400 mb-1" />
                              <span className="text-[10px] text-neutral-400 leading-tight">
                                {language === 'es' ? 'Haga clic para subir' : 'Click to upload'}
                              </span>
                            </div>
                          )}

                          <input
                            type="file"
                            ref={fileRef}
                            accept="image/*"
                            onChange={(e) => handlePhotoChange(key, e.target.files?.[0] || null)}
                            className="hidden"
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Submit / Disclaimer text */}
                  <p className="text-[11px] text-[#7C6C63] text-center italic leading-relaxed pt-2">
                    {language === 'es'
                      ? 'Una vez recibida toda la información, esta será revisada cuidadosamente para asegurar que estemos completamente preparados para su consulta y, cuando corresponda, para confirmar o actualizar su cotización personalizada.'
                      : 'Once all information is received, it will be carefully reviewed to ensure we are fully prepared for your consultation and, when applicable, to confirm or update your personalized quote.'}
                  </p>

                  {submitError && (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setStep(5)}
                      className="px-5 py-2 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 rounded-full text-xs font-semibold tracking-wider uppercase cursor-pointer disabled:opacity-50"
                    >
                      {language === 'es' ? 'Atrás' : 'Back'}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-7 py-3 bg-[#0373bb] hover:bg-[#025c96] text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-1" />
                          {language === 'es' ? 'Enviando...' : 'Submitting...'}
                        </>
                      ) : (
                        <>
                          <ClipboardCheck className="w-4 h-4" />
                          {language === 'es' ? 'Guardar y Finalizar Evaluación' : 'Submit & Finalize Assessment'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
