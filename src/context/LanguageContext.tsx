import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'es' | 'fr' | 'pt' | 'de';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav & General
    "nav.home": "Home",
    "nav.about": "About Us",
    "nav.services": "Services",
    "nav.specialists": "Specialists",
    "nav.gallery": "Gallery",
    "nav.testimonials": "Testimonials",
    "nav.contact": "Contact",
    "nav.portal": "Portal",
    "nav.aesthetics": "Aesthetics",
    "general.consultation": "Schedule a Consultation",
    "general.phone": "347 278 3792",

    // Hero
    "hero.renew": "Renew Yourself",
    "hero.aesthetic": "Aesthetic Surgery",
    "hero.newlife": "For a New Life",
    "hero.description": "Transforming face, body, skin, and confidence with a certified plastic surgeon. We use advanced medical methodologies tailored to your anatomy.",
    "hero.schedulenow": "Schedule Now",
    "hero.dr_estrella": "dr. estrella",

    // Sub-hero Columns
    "subhero.1.title": "Bespoke Solutions",
    "subhero.1.desc": "Your unique beauty journey is honored with individualized surgical formulations customized exactly for your anatomic goals.",
    "subhero.2.title": "Aesthetic Innovation",
    "subhero.2.desc": "Embrace the absolute latest in aesthetic procedures and surgical developments for safe, stunning, and long-lasting results.",
    "subhero.3.title": "Experienced Experts",
    "subhero.3.desc": "Our surgical team brings board certifications and decades of combined medical experience for your ultimate safety and satisfaction.",
    "subhero.4.title": "Seamless Care",
    "subhero.4.desc": "Enjoy comprehensive guidance and physical assistance from your initial medical consultation through your seamless clinical recovery.",

    // About Us Section
    "about.title": "About Dr. Victor Estrella",
    "about.heading": "Combining Artistic Vision with Surgical Mastery",
    "about.subheading": "Santo Domingo, Dominican Republic",
    "about.chief": "Chief Plastic Surgeon",
    "about.reg": "15+ Years of Experience",
    "about.visionary": "Aesthetic Surgeon & Visionary",
    "about.quote": "\"True beauty lies in the perfect balance of harmony, proportion, and natural form.\"",
    "about.para1": "Dr. Victor Estrella has dedicated his professional career to transforming lives through advanced aesthetic, reconstructive, and plastic surgery. Based in the cosmopolitan capital of Santo Domingo, he is recognized as one of the region's premier specialists in custom high-definition body contouring, restorative facial procedures, and complex breast aesthetics.",
    "about.para2": "By blending a meticulous understanding of human anatomy with a refined, classically trained artistic eye, Dr. Estrella achieves elegant, natural-looking transformations that align perfectly with each patient's inherent structure. His standard avoids over-inflated or artificial results in favor of refined, lifelong rejuvenation.",
    "about.para3": "Whether welcoming local clients or medical tourists from North America, Europe, and the Caribbean, Dr. Estrella and his clinical team maintain world-class patient safety standards, rigorous preoperative assessments, and bespoke post-operative recovery support.",
    "about.mission_title": "Patient-Centric Mission",
    "about.mission_desc": "Empowering confidence, step by surgical step.",
    "about.board_title": "Medical Board Certifications & Degrees",
    "about.board_desc": "For your safety and peace of mind, Dr. Victor Estrella operates with full medical licensing, national board certifications, and international cosmetic surgery qualifications.",
    
    // About Credentials
    "about.cred.1.title": "Academic Excellence",
    "about.cred.1.desc": "Specialty in Plastic, Aesthetic and Reconstructive Surgery",
    "about.cred.1.desc_extra": "Specialty in general surgery and laparoscopy.",
    "about.cred.2.title": "Certifications",
    "about.cred.2.desc": "Active member of international plastic surgery societies.",
    "about.cred.2.desc_extra": "FILACP – Federación Ibero Latinoamericana de Cirugía Plástica",
    "about.cred.3.title": "International Trajectory",
    "about.cred.3.desc": "Advanced training in Brazil, Colombia, and the United States.",

    // About Pillars
    "about.pillars.title": "Our Principles",
    "about.pillars.heading": "Why Patients Trust Dr. Estrella",
    "about.pillars.desc": "Every procedure is a shared journey toward self-actualization. We follow uncompromising core values to ensure your clinical outcome is safe, confidential, and beautifully realized.",
    "about.pillars.district": "Santo Domingo Medical District, DR",
    
    "about.pillar.1.title": "Individualized Anatomy",
    "about.pillar.1.desc": "A personalized surgical blueprint designed strictly for your proportions. No generic templates.",
    "about.pillar.2.title": "High-Definition Contours",
    "about.pillar.2.desc": "Utilizing advanced VASER & MicroAire high-definition technologies for pristine lipo-sculpting.",
    "about.pillar.3.title": "Uncompromised Safety",
    "about.pillar.3.desc": "Procedures conducted only in premium, accredited general hospitals with full ICU support.",
    "about.pillar.4.title": "Bilingual Patient Care",
    "about.pillar.4.desc": "Concierge support for international travelers, covering local transport, nursing, and recovery.",

    // Services Section
    "services.portfolio": "Expert Clinical Portfolios",
    "services.heading": "Our Surgical & Aesthetic Services",
    "services.desc": "Transforming face, body, skin, and confidence with Board Certified plastic surgeons. We utilize advanced medical methodologies tailored precisely to your anatomy.",
    "services.view_all": "View All Services",
    "services.premium_category": "Premium Clinical Category",
    "services.featured_treatments": "Featured Treatments:",
    "services.learn_more": "Learn More Details",
    "services.show_less": "Show Less",
    "services.book_prefix": "Book",

    // Specialists Section
    "specialists.subtitle": "Clinical Board & Specialists",
    "specialists.heading": "Meet Our Elite Surgical Team",
    "specialists.desc": "We house board-certified aesthetic practitioners committed to rigorous professional standards, anatomical precision, and beautiful results.",
    "specialists.view_credentials": "View Credentials",
    "specialists.certified": "Certified Practitioner",

    // Gallery Section
    "gallery.subtitle": "Before & After Clinical Outcomes",
    "gallery.heading": "Case Studies Gallery",
    "gallery.desc": "Real patients. Real results. Drag the handles left or right on each image to compare the Before and After states of facial contouring, non-surgical enhancements, and body contouring treatments.",
    "gallery.all": "All Results",
    "gallery.drag_compare": "Drag to compare",
    "gallery.before": "Before",
    "gallery.after": "After",
    "gallery.see_more": "SEE MORE",
    "gallery.back_home": "Back to Home",
    "gallery.g3.title": "Liposuction 360, BBL & Tummy Tuck",
    "gallery.g4.title": "Thigh Lift (Cruroplasty)",
    "gallery.g5.title": "Liposuction & BBL (Brazilian Butt Lift)",
    "gallery.g6.title": "Liposuction 360, BBL & Tummy Tuck (Abdominoplasty)",
    "gallery.g7.title": "Breast Reduction for Gigantomastia",
    "gallery.g8.title": "Liposuction, BBL & Breast Augmentation with Implants",

    // Testimonials Section
    "testimonials.subtitle": "What Our Patients Say",
    "testimonials.heading": "Patient Success Stories",
    "testimonials.desc": "Read genuine feedback and reviews from patients who experienced aesthetic journeys and clinical rejuvenation under our care.",

    // Contact & Booking Section
    "contact.subtitle": "Contact Our Medical Office",
    "contact.heading": "Request Your Clinical Consultation",
    "contact.desc": "Take the first step toward a renewed profile. Complete our secure pre-consultation medical form, and our specialized surgical coordinator will contact you promptly.",
    "contact.visit_us": "Visit Our Offices",
    "contact.visit_desc": "IPBMA Medical Associates, Av Independencia 655, Gazcue, Santo Domingo, Dominican Republic",
    "contact.bilingual": "Bilingual Coordination Office",
    "contact.bilingual_desc": "Available 24/7 for international and domestic patients.",
    "contact.evaluation_form": "MEDICAL EVALUATION FORM",
    "contact.female_patient": "FEMALE PATIENT",
    "contact.male_patient": "MALE PATIENT",
    
    // Form Inputs
    "form.first_name": "First Name",
    "form.last_name": "Last Name",
    "form.email": "Email Address",
    "form.phone": "Phone Number",
    "form.procedure": "Preferred Procedure",
    "form.specialist": "Preferred Surgeon",
    "form.date": "Preferred Date",
    "form.time": "Preferred Time",
    "form.notes": "Clinical History / Aesthetic Goals Notes",
    "form.submit": "Send Secure Consultation Request",
    "form.submitting": "Processing Request...",
    "form.success": "Consultation request sent successfully!",

    // Account Portal & Cabinet
    "account.cabinet": "My Patient Portal",
    "account.login": "Access Your Clinical File",
    "account.login_desc": "Log in using your registered credentials to view your consult dates, post-op instructions, and secure medical forms.",
    "account.create": "Register New Patient File",
    "account.create_desc": "Create a secure account to initiate pre-operative questionnaires and document tracking.",
    "account.full_name": "Full Patient Name",
    "account.register_btn": "Register & Log In",
    "account.login_btn": "Secure Log In",
    "account.logout": "Log Out",
    "account.welcome": "Welcome back,",
    "account.scheduled_title": "Your Scheduled Consultations",
    "account.no_consultations": "You currently have no scheduled consultations.",
    "account.clinical_history": "Clinical History & Notes",
    "account.history_placeholder": "Enter any medical history or allergies for the surgical team...",
    "account.save_notes": "Save Medical Notes",
    "account.notes_saved": "Notes saved to clinical database.",
    "account.procedure_col": "Procedure",
    "account.date_col": "Date & Time",
    "account.specialist_col": "Surgeon",
    "account.status_col": "Status",

    // Dynamic Data (Translations)
    "services.face.title": "Face",
    "services.face.desc": "Transform your face and neck with advanced natural-looking procedures. Achieve a refreshed, youthful facial harmony.",
    "services.face.details": "Utilizing state-of-the-art surgical techniques, our facial procedures aim to restore definition, lift sagging tissues, and address specific asymmetry while maintaining your natural expressions and structure.",
    
    "services.breast.title": "Breast",
    "services.breast.desc": "Achieve your desired volume, lift, and symmetry with tailored breast procedures designed for natural contour.",
    "services.breast.details": "Whether seeking to restore fullness lost after pregnancy or weight loss, reduce back discomfort, or reconstruct shape, our breast options deliver balanced, proportional, and beautifully customized profiles.",
    
    "services.body.title": "Body",
    "services.body.desc": "Contour and sculpt your silhouette with transformative surgical and non-invasive body-shaping treatments.",
    "services.body.details": "Designed to target stubborn fat deposits, remove excess skin, and tighten underlying abdominal walls. Our body treatments restore definition and contour to enhance your personal silhouette.",
    
    "services.skin.title": "Skin",
    "services.skin.desc": "Rejuvenate your skin with medical-grade dermal therapies, customized injectables, and advanced skin resurfacing.",
    "services.skin.details": "Address fine lines, volume loss, sun damage, and acne scarring. Our non-surgical aesthetic skin treatments offer fast recovery and high-impact glowing results customized to your skin profile.",

    "procedure.blefaroplastia": "Blepharoplasty (Eyelids)",
    "procedure.bichectomía": "Bichectomy (Buccal Fat)",
    "procedure.bichectomia": "Bichectomy (Buccal Fat)",
    "procedure.frontoplastia": "Frontoplasty (Forehead)",
    "procedure.lifting_facial_endoscópico": "Endoscopic Facelift",
    "procedure.lifting_facial_endoscopico": "Endoscopic Facelift",
    "procedure.liposucción_de_papada": "Double Chin Liposuction",
    "procedure.liposuccion_de_papada": "Double Chin Liposuction",
    "category.surgical_face": "Surgical Face",
    "category.breast_aesthetics": "Breast Aesthetics",
    "category.body_contouring": "Body Contouring",
    "category.injectables": "Injectables & Skin",
    "procedure.rhinoplasty": "Rhinoplasty (Nose)",
    "procedure.facelift": "Facelift (SMAS)",
    "procedure.blepharoplasty": "Blepharoplasty (Eyelids)",
    "procedure.breast_augmentation": "Breast Augmentation",
    "procedure.breast_lift": "Breast Lift (Mastopexy)",
    "procedure.liposuction": "Liposculpture (HD)",
    "procedure.abdominoplasty": "Abdominoplasty (Tummy Tuck)",
    "procedure.botox_fillers": "Injectables & Botox",
    "procedure.thigh_lift": "Thigh Lift",
    "procedure.thigh_liposuction": "Thigh Liposuction",
    "procedure.arm_lift": "Arm Lift",
    "procedure.arm_liposuction": "Arm Liposuction",

    // Specialists
    "specialist.dr_estrella.bio": "Dr. Victor Estrella is a highly recognized plastic surgeon in Santo Domingo, specializing in high-definition liposculpture, advanced abdominoplasty, breast surgery, and facial rejuvenation with a focus on harmony and natural-looking beauty.",
    "specialist.dr_sinclair.bio": "Dr. Sinclair specializes in facial rejuvenation, high-definition body contouring, and advanced breast aesthetics, recognized for his compassionate, patient-first care.",
    "specialists.role.director": "Board Certified Plastic, Reconstructive & Aesthetic Surgeon",
    "specialists.role.associate": "Senior Associate Surgeon & Aesthetics Innovator"
  },
  es: {
    // Nav & General
    "nav.home": "Inicio",
    "nav.about": "Nosotros",
    "nav.services": "Servicios",
    "nav.specialists": "Cirujanos",
    "nav.gallery": "Galería",
    "nav.testimonials": "Opiniones",
    "nav.contact": "Contacto",
    "nav.portal": "Portal",
    "nav.aesthetics": "Estética",
    "general.consultation": "Programar Consulta",
    "general.phone": "347 278 3792",

    // Hero
    "hero.renew": "Renuévate",
    "hero.aesthetic": "Cirugía Estética",
    "hero.newlife": "Para una Nueva Vida",
    "hero.description": "Transformando rostro, cuerpo, piel y confianza con cirujano plástico certificado. Utilizamos metodologías médicas avanzadas adaptadas a su anatomía.",
    "hero.schedulenow": "Agendar Ahora",
    "hero.dr_estrella": "dr. estrella",

    // Sub-hero Columns
    "subhero.1.title": "Soluciones a Medida",
    "subhero.1.desc": "Su viaje de belleza único es honrado con formulaciones quirúrgicas individualizadas y adaptadas exactamente a sus objetivos anatómicos.",
    "subhero.2.title": "Innovación Estética",
    "subhero.2.desc": "Adopte lo último en procedimientos estéticos y avances quirúrgicos para obtener resultados seguros, impactantes y duraderos.",
    "subhero.3.title": "Expertos Experimentados",
    "subhero.3.desc": "Nuestro equipo cuenta con certificaciones oficiales y décadas de experiencia médica para su máxima seguridad y satisfacción.",
    "subhero.4.title": "Cuidado Integral",
    "subhero.4.desc": "Disfrute de orientación completa y asistencia personalizada desde su primera consulta médica hasta su recuperación clínica.",

    // About Us Section
    "about.title": "Sobre el Dr. Victor Estrella",
    "about.heading": "Combinando Visión Artística con Maestría Quirúrgica",
    "about.subheading": "Santo Domingo, República Dominicana",
    "about.chief": "Cirujano Plástico Principal",
    "about.reg": "15+ Años de Experiencia",
    "about.visionary": "Cirujano Estético y Visionario",
    "about.quote": "\"La verdadera belleza reside en el equilibrio perfecto de la armonía, la proporción y la forma natural.\"",
    "about.para1": "El Dr. Victor Estrella ha dedicado su carrera profesional a transformar vidas mediante cirugía estética, reconstructiva y plástica avanzada. Con sede en la capital de Santo Domingo, es reconocido como uno de los principales especialistas de la región en contorno corporal de alta definición, procedimientos faciales rejuvenecedores y estética mamaria compleja.",
    "about.para2": "Al fusionar una comprensión meticulosa de la anatomía humana con un ojo artístico refinado y de formación clásica, el Dr. Estrella logra transformaciones elegantes y naturales que se alinean perfectamente con la estructura inherente de cada paciente. Su estándar evita los resultados artificiales en favor de un rejuvenecimiento refinado y duradero.",
    "about.para3": "Ya sea recibiendo a pacientes locales o a turistas médicos de América del Norte, Europa y el Caribe, el Dr. Estrella y su equipo clínico mantienen estándares de seguridad de clase mundial, evaluaciones preoperatorias rigurosas y apoyo postoperatorio personalizado.",
    "about.mission_title": "Misión Centrada en el Paciente",
    "about.mission_desc": "Empoderando la confianza en cada paso quirúrgico.",
    "about.board_title": "Certificaciones Médicas y Títulos",
    "about.board_desc": "Para su seguridad y tranquilidad, el Dr. Victor Estrella opera con licencias médicas completas, certificaciones nacionales e internacionales.",
    
    // About Credentials
    "about.cred.1.title": "Formación Académica",
    "about.cred.1.desc": "Especialidad en Cirugía Plástica, Estética y Reconstructiva",
    "about.cred.1.desc_extra": "Especialidad en cirugía general y laparoscopía.",
    "about.cred.2.title": "Certificaciones",
    "about.cred.2.desc": "Miembro activo de sociedades internacionales de Cirugía Plástica",
    "about.cred.2.desc_extra": "FILACP – Federación Ibero Latinoamericana de Cirugía Plástica",
    "about.cred.3.title": "Trayectoria Internacional",
    "about.cred.3.desc": "Entrenamientos avanzados en Brasil, Colombia y Estados Unidos.",

    // About Pillars
    "about.pillars.title": "Nuestros Principios",
    "about.pillars.heading": "Por Qué Confían los Pacientes",
    "about.pillars.desc": "Cada procedimiento es un viaje compartido. Seguimos valores fundamentales e inquebrantables para asegurar un resultado seguro, confidencial y hermoso.",
    "about.pillars.district": "Distrito Médico de Santo Domingo, RD",
    
    "about.pillar.1.title": "Anatomía Individualizada",
    "about.pillar.1.desc": "Un plan quirúrgico personalizado diseñado estrictamente para sus proporciones. Sin plantillas genéricas.",
    "about.pillar.2.title": "Contornos de Alta Definición",
    "about.pillar.2.desc": "Utilizando tecnologías avanzadas VASER y MicroAire para un esculpido corporal impecable.",
    "about.pillar.3.title": "Seguridad Sin Compromisos",
    "about.pillar.3.desc": "Procedimientos realizados únicamente en hospitales generales acreditados con soporte de UCI completo.",
    "about.pillar.4.title": "Atención Bilingüe",
    "about.pillar.4.desc": "Soporte de conserjería para pacientes internacionales, que cubre transporte, enfermería y recuperación.",

    // Services Section
    "services.portfolio": "Portafolios Clínicos Expertos",
    "services.heading": "Nuestros Servicios Quirúrgicos y Estéticos",
    "services.desc": "Transformando rostro, cuerpo, piel y confianza con cirujanos plásticos certificados. Utilizamos metodologías médicas avanzadas adaptadas a su anatomía.",
    "services.view_all": "Ver Todos los Servicios",
    "services.premium_category": "Categoría Clínica Premium",
    "services.featured_treatments": "Tratamientos Destacados:",
    "services.learn_more": "Ver Detalles Completos",
    "services.show_less": "Mostrar Menos",
    "services.book_prefix": "Reservar",

    // Specialists Section
    "specialists.subtitle": "Consejo Clínico y Especialistas",
    "specialists.heading": "Conozca a Nuestro Equipo Cirujano",
    "specialists.desc": "Contamos con profesionales de la estética certificados, comprometidos con rigurosos estándares profesionales, precisión anatómica y resultados hermosos.",
    "specialists.view_credentials": "Ver Credenciales",
    "specialists.certified": "Cirujano Certificado",

    // Gallery Section
    "gallery.subtitle": "Resultados Clínicos Antes y Después",
    "gallery.heading": "Galería de Casos de Estudio",
    "gallery.desc": "Pacientes reales. Resultados reales. Arrastre el control hacia la izquierda o derecha para comparar los estados Antes y Después de nuestros tratamientos.",
    "gallery.all": "Todos los Resultados",
    "gallery.drag_compare": "Arrastre para comparar",
    "gallery.before": "Antes",
    "gallery.after": "Después",
    "gallery.see_more": "VER MÁS",
    "gallery.back_home": "Volver al Inicio",
    "gallery.g3.title": "Lipoescultura 360, BBL y Abdominoplastia",
    "gallery.g4.title": "Lifting de Muslos (Cruroplastia)",
    "gallery.g5.title": "Lipoescultura y BBL (Aumento de Glúteos)",
    "gallery.g6.title": "Lipoescultura 360, BBL y Abdominoplastia Avanzada",
    "gallery.g7.title": "Reducción de Senos por Gigantomastia",
    "gallery.g8.title": "Lipoescultura, BBL y Aumento de Senos con Implantes",

    // Testimonials Section
    "testimonials.subtitle": "Lo Que Dicen Nuestros Pacientes",
    "testimonials.heading": "Historias de Éxito",
    "testimonials.desc": "Lea opiniones y testimonios genuinos de pacientes que experimentaron transformaciones estéticas y rejuvenecimiento bajo nuestro cuidado.",

    // Contact & Booking Section
    "contact.subtitle": "Contacte Nuestra Oficina Médica",
    "contact.heading": "Solicite una Consulta Clínica",
    "contact.desc": "Dé el primer paso hacia su nuevo perfil. Complete nuestro formulario médico seguro de preconsulta y nuestro coordinador quirúrgico lo contactará de inmediato.",
    "contact.visit_us": "Visite Nuestras Oficinas",
    "contact.visit_desc": "IPBMA Medical Associates, Av Independencia 655, Gazcue, Santo Domingo, República Dominicana",
    "contact.bilingual": "Coordinación Bilingüe 24/7",
    "contact.bilingual_desc": "Disponible de forma ininterrumpida para pacientes nacionales e internacionales.",
    "contact.evaluation_form": "FORMULARIO DE EVALUACIÓN MÉDICA",
    "contact.female_patient": "PACIENTE FEMENINA",
    "contact.male_patient": "PACIENTE MASCULINO",
    
    // Form Inputs
    "form.first_name": "Nombre",
    "form.last_name": "Apellido",
    "form.email": "Correo Electrónico",
    "form.phone": "Número de Teléfono",
    "form.procedure": "Procedimiento de Interés",
    "form.specialist": "Cirujano Preferido",
    "form.date": "Fecha Preferida",
    "form.time": "Hora Preferida",
    "form.notes": "Historial Clínico / Notas sobre Objetivos Estéticos",
    "form.submit": "Enviar Solicitud Segura de Consulta",
    "form.submitting": "Procesando Solicitud...",
    "form.success": "¡Solicitud de consulta enviada con éxito!",

    // Account Portal & Cabinet
    "account.cabinet": "Mi Portal de Paciente",
    "account.login": "Acceda a su Expediente Clínico",
    "account.login_desc": "Inicie sesión con sus credenciales registradas para ver sus fechas de consulta, instrucciones postoperatorias y formularios médicos seguros.",
    "account.create": "Registrar Nuevo Expediente",
    "account.create_desc": "Cree una cuenta segura para completar cuestionarios preoperatorios y dar seguimiento a sus documentos.",
    "account.full_name": "Nombre Completo del Paciente",
    "account.register_btn": "Registrarse e Iniciar Sesión",
    "account.login_btn": "Iniciar Sesión de Forma Segura",
    "account.logout": "Cerrar Sesión",
    "account.welcome": "Bienvenido de nuevo,",
    "account.scheduled_title": "Sus Consultas Programadas",
    "account.no_consultations": "Actualmente no tiene consultas programadas.",
    "account.clinical_history": "Historial Clínico y Notas",
    "account.history_placeholder": "Ingrese antecedentes médicos, alergias o notas para el equipo quirúrgico...",
    "account.save_notes": "Guardar Notas Médicas",
    "account.notes_saved": "Notas guardadas en la base de datos clínica.",
    "account.procedure_col": "Procedimiento",
    "account.date_col": "Fecha y Hora",
    "account.specialist_col": "Cirujano",
    "account.status_col": "Estado",

    // Dynamic Data
    "services.face.title": "Rostro",
    "services.face.desc": "Transforme su rostro y cuello con procedimientos avanzados de aspecto natural. Logre una armonía facial rejuvenecida.",
    "services.face.details": "Utilizando técnicas quirúrgicas de vanguardia, nuestros procedimientos faciales buscan restaurar definición, elevar tejidos caídos y corregir asimetrías respetando sus expresiones naturales.",
    
    "services.breast.title": "Busto",
    "services.breast.desc": "Logre el volumen, la elevación y la simetría que desea con procedimientos mamarios diseñados a su medida.",
    "services.breast.details": "Ya sea para restaurar la firmeza perdida después del embarazo o pérdida de peso, reducir molestias de espalda o reconstruir la forma, nuestras opciones ofrecen perfiles proporcionales y hermosos.",
    
    "services.body.title": "Cuerpo",
    "services.body.desc": "Contornee y esculpa su silueta con tratamientos quirúrgicos y no invasivos de alta definición.",
    "services.body.details": "Diseñado para eliminar depósitos de grasa rebelde, retirar exceso de piel y tensar las paredes abdominales. Nuestros tratamientos corporales esculpen una silueta armoniosa.",
    
    "services.skin.title": "Piel",
    "services.skin.desc": "Rejuvenezca su piel con terapias dérmicas de grado médico, inyectables avanzados y renovación cutánea.",
    "services.skin.details": "Trate líneas de expresión, pérdida de volumen, daño solar y cicatrices de acné. Nuestros tratamientos no quirúrgicos ofrecen una recuperación rápida y resultados radiantes.",

    "procedure.blefaroplastia": "Blefaroplastia",
    "procedure.bichectomía": "Bichectomía",
    "procedure.bichectomia": "Bichectomía",
    "procedure.frontoplastia": "Frontoplastia",
    "procedure.lifting_facial_endoscópico": "Lifting Facial Endoscópico",
    "procedure.lifting_facial_endoscopico": "Lifting Facial Endoscópico",
    "procedure.liposucción_de_papada": "Liposucción de Papada",
    "procedure.liposuccion_de_papada": "Liposucción de Papada",
    "category.surgical_face": "Cirugía Facial",
    "category.breast_aesthetics": "Estética de Busto",
    "category.body_contouring": "Contorno Corporal",
    "category.injectables": "Inyectables y Piel",
    "procedure.rhinoplasty": "Rinoplastia",
    "procedure.facelift": "Lifting Facial (SMAS)",
    "procedure.blepharoplasty": "Blefaroplastia",
    "procedure.breast_augmentation": "Aumento de Busto",
    "procedure.breast_lift": "Levantamiento de Busto (Mastopexia)",
    "procedure.liposuction": "Lipoescultura (HD)",
    "procedure.abdominoplasty": "Abdominoplastia",
    "procedure.botox_fillers": "Inyectables y Botox",
    "procedure.thigh_lift": "Lifting de Muslos",
    "procedure.thigh_liposuction": "Liposucción de Muslos",
    "procedure.arm_lift": "Lifting de Brazos",
    "procedure.arm_liposuction": "Liposucción de Brazos",

    "specialist.dr_estrella.bio": "El Dr. Victor Estrella es un cirujano plástico altamente reconocido en Santo Domingo, especializado en lipoescultura de alta definición, abdominoplastia avanzada, cirugía de mama y rejuvenecimiento facial enfocado en la armonía y la belleza natural.",
    "specialist.dr_sinclair.bio": "El Dr. Sinclair se especializa en rejuvenecimiento facial, contorno corporal de alta definición y estética mamaria avanzada, reconocido por su atención compasiva centrada en el paciente.",
    "specialists.role.director": "Cirujano Plástico, Reconstructivo y Estético Certificado",
    "specialists.role.associate": "Cirujano Asociado Principal e Innovador Estético"
  },
  fr: {
    // Nav & General
    "nav.home": "Accueil",
    "nav.about": "À Propos",
    "nav.services": "Services",
    "nav.specialists": "Spécialistes",
    "nav.gallery": "Galerie",
    "nav.testimonials": "Avis",
    "nav.contact": "Contact",
    "nav.portal": "Portail",
    "nav.aesthetics": "Esthétique",
    "general.consultation": "Prendre un Rendez-vous",
    "general.phone": "347 278 3792",

    // Hero
    "hero.renew": "Renouvelez-vous",
    "hero.aesthetic": "Chirurgie Esthétique",
    "hero.newlife": "Pour une Nouvelle Vie",
    "hero.description": "Transformer le visage, le corps, la peau et la confiance avec un chirurgien plasticien certifié. Nous utilisons des méthodologies médicales avancées adaptées à votre anatomie.",
    "hero.schedulenow": "Prendre RDV",
    "hero.dr_estrella": "dr. estrella",

    // Sub-hero Columns
    "subhero.1.title": "Solutions Sur Mesure",
    "subhero.1.desc": "Votre parcours de beauté unique est honoré par des formulations chirurgicales individualisées, adaptées exactement à vos objectifs anatomiques.",
    "subhero.2.title": "Innovation Esthétique",
    "subhero.2.desc": "Adoptez le meilleur des procédures esthétiques et des développements chirurgicaux pour des résultats sûrs, éblouissants et durables.",
    "subhero.3.title": "Experts Expérimentés",
    "subhero.3.desc": "Notre équipe chirurgicale certifiée apporte des décennies d'expérience pour votre sécurité et votre satisfaction optimales.",
    "subhero.4.title": "Soins Fluides",
    "subhero.4.desc": "Profitez d'un accompagnement complet et d'une assistance personnalisée, de votre première consultation jusqu'à votre rétablissement complet.",

    // About Us Section
    "about.title": "À Propos du Dr Victor Estrella",
    "about.heading": "Allier Vision Artistique et Maîtrise Chirurgicale",
    "about.subheading": "Saint-Domingue, République Dominicaine",
    "about.chief": "Chirurgien Esthétique en Chef",
    "about.reg": "15+ Ans d'Expérience",
    "about.visionary": "Chirurgien Esthétique & Visionnaire",
    "about.quote": "\"La vraie beauté réside dans l'équilibre parfait de l'harmonie, de la proportion et de la forme naturelle.\"",
    "about.para1": "Le Dr Victor Estrella a dédié sa carrière professionnelle à transformer des vies grâce à la chirurgie esthétique, reconstructrice et plastique de pointe. Basé dans la capitale cosmopolite de Saint-Domingue, il est reconnu comme l'un des meilleurs spécialistes de la région en remodelage corporel haute définition, en procédures faciales restauratrices et en esthétique mammaire complexe.",
    "about.para2": "En associant une compréhension méticuleuse de l'anatomie humaine à un œil artistique affiné et de formation classique, le Dr Estrella réalise des transformations élégantes et naturelles qui s'alignent parfaitement avec la structure de chaque patient. Son standard refuse les résultats artificiels au profit d'un rajeunissement raffiné.",
    "about.para3": "Qu'il s'agisse d'accueillir des patients locaux ou internationaux venant d'Amérique du Nord, d'Europe ou des Caraïbes, le Dr Estrella et son équipe maintiennent des normes de sécurité de classe mondiale, des bilans préopératoires rigoureux et un suivi postopératoire sur mesure.",
    "about.mission_title": "Mission Centrée sur le Patient",
    "about.mission_desc": "Donner confiance, étape par étape.",
    "about.board_title": "Certifications et Diplômes Médicaux",
    "about.board_desc": "Pour votre sécurité et votre sérénité, le Dr Victor Estrella exerce avec des licences médicales complètes, des certifications nationales et des qualifications internationales.",
    
    // About Credentials
    "about.cred.1.title": "Excellence Académique",
    "about.cred.1.desc": "Diplômé en médecine de la prestigieuse Universidad Autónoma de Santo Domingo (UASD), suivi d'une spécialisation rigoureuse en chirurgie générale et plastique.",
    "about.cred.1.desc_extra": "Spécialité en chirurgie générale et laparoscopie.",
    "about.cred.2.title": "Certifié par la SODOCIPRE",
    "about.cred.2.desc": "Membre actif certifié de la SODOCIPRE (Société Dominicaine de Chirurgie Plastique, Reconstructrice et Esthétique), l'autorité médicale suprême en RD.",
    "about.cred.2.desc_extra": "FILACP – Fédération Ibero Latinoamericana de Cirugía Plástica",
    "about.cred.3.title": "Affiliations Mondiales",
    "about.cred.3.desc": "Membre actif de la FILACP (Fédération Ibéro-Latino-Américaine de Chirurgie Plastique) et de réseaux esthétiques mondiaux, intégrant des avancées constantes.",

    // About Pillars
    "about.pillars.title": "Nos Principes",
    "about.pillars.heading": "Pourquoi Faire Confiance au Dr Estrella",
    "about.pillars.desc": "Chaque procédure est un voyage partagé. Nous suivons des valeurs fondamentales strictes pour garantir que votre résultat soit sûr, confidentiel et magnifiquement réalisé.",
    "about.pillars.district": "District Médical de Saint-Domingue, RD",
    
    "about.pillar.1.title": "Anatomie Individualisée",
    "about.pillar.1.desc": "Un plan chirurgical sur mesure conçu uniquement pour vos proportions. Pas de modèles génériques.",
    "about.pillar.2.title": "Remodelage Haute Définition",
    "about.pillar.2.desc": "Utilisation des technologies de pointe VASER & MicroAire pour une sculpture corporelle impeccable.",
    "about.pillar.3.title": "Sécurité Sans Compromis",
    "about.pillar.3.desc": "Interventions réalisées uniquement dans des hôpitaux généraux accrédités avec unité de soins intensifs complète.",
    "about.pillar.4.title": "Soins Patient Bilingues",
    "about.pillar.4.desc": "Service de conciergerie pour les voyageurs internationaux, couvrant le transport local, les soins infirmiers et la convalescence.",

    // Services Section
    "services.portfolio": "Portefeuilles Cliniques Experts",
    "services.heading": "Nos Services Chirurgicaux et Esthétiques",
    "services.desc": "Transformer le visage, le corps, la peau et la confiance avec des chirurgiens certifiés. Nous utilisons des méthodologies de pointe adaptées à votre anatomie.",
    "services.view_all": "Voir Tous les Services",
    "services.premium_category": "Catégorie Clinique Premium",
    "services.featured_treatments": "Traitements Vedettes:",
    "services.learn_more": "Plus de Détails",
    "services.show_less": "Réduire",
    "services.book_prefix": "Réserver",

    // Specialists Section
    "specialists.subtitle": "Conseil Clinique et Spécialistes",
    "specialists.heading": "Découvrez Notre Équipe Chirurgicale",
    "specialists.desc": "Nous réunissons des praticiens certifiés engagés envers des normes professionnelles strictes, une précision anatomique et de magnifiques résultats.",
    "specialists.view_credentials": "Voir les Diplômes",
    "specialists.certified": "Praticien Certifié",

    // Gallery Section
    "gallery.subtitle": "Résultats Cliniques Avant / Après",
    "gallery.heading": "Galerie d'Études de Cas",
    "gallery.desc": "Patients réels. Résultats réels. Glissez la barre vers la gauche ou la droite sur chaque image pour comparer les états Avant et Après.",
    "gallery.all": "Tous les Résultats",
    "gallery.drag_compare": "Glisser pour comparer",
    "gallery.before": "Avant",
    "gallery.after": "Après",
    "gallery.see_more": "VOIR PLUS",
    "gallery.back_home": "Retour à l'accueil",
    "gallery.g3.title": "Liposuccion 360, BBL & Abdominoplastie",
    "gallery.g4.title": "Lifting des Cuisses (Cruroplastie)",
    "gallery.g5.title": "Liposuccion & BBL (Lifting fessier brésilien)",
    "gallery.g6.title": "Liposuccion 360, BBL & Abdominoplastie avancée",
    "gallery.g7.title": "Réduction Mammaire pour Gigantomastie",
    "gallery.g8.title": "Liposuccion, BBL, Lifting Mammaire et Augmentation",

    // Testimonials Section
    "testimonials.subtitle": "Ce Que Disent Nos Patients",
    "testimonials.heading": "Témoignages de Réussite",
    "testimonials.desc": "Découvrez les avis authentiques de patients ayant bénéficié de soins esthétiques et de rajeunissement clinique.",

    // Contact & Booking Section
    "contact.subtitle": "Contacter Notre Cabinet Médical",
    "contact.heading": "Demander une Consultation Clinique",
    "contact.desc": "Faites le premier pas vers un profil renouvelé. Remplissez notre formulaire pré-consultation sécurisé, et notre coordinateur vous contactera rapidement.",
    "contact.visit_us": "Visiter Nos Bureaux",
    "contact.visit_desc": "IPBMA Medical Associates, Av Independencia 655, Gazcue, Santo Domingo, République Dominicaine",
    "contact.bilingual": "Bureau de Coordination Bilingue",
    "contact.bilingual_desc": "Disponible 24h/24, 7j/7 pour les patients locaux et internationaux.",
    "contact.evaluation_form": "FORMULAIRE D'ÉVALUATION MÉDICALE",
    "contact.female_patient": "PATIENTE FÉMININE",
    "contact.male_patient": "PATIENT MASCULIN",
    
    // Form Inputs
    "form.first_name": "Prénom",
    "form.last_name": "Nom de Famille",
    "form.email": "Adresse E-mail",
    "form.phone": "Numéro de Téléphone",
    "form.procedure": "Procédure Souhaitée",
    "form.specialist": "Chirurgien Souhaité",
    "form.date": "Date Souhaitée",
    "form.time": "Heure Souhaitée",
    "form.notes": "Antécédents Médicaux / Objectifs Esthétiques",
    "form.submit": "Envoyer la Demande de Consultation",
    "form.submitting": "Traitement de la Demande...",
    "form.success": "Demande de consultation envoyée avec succès !",

    // Account Portal & Cabinet
    "account.cabinet": "Mon Portail Patient",
    "account.login": "Accéder à Votre Dossier Clinique",
    "account.login_desc": "Connectez-vous avec vos identifiants pour consulter vos dates de rendez-vous, vos consignes postopératoires et vos formulaires médicaux.",
    "account.create": "Créer un Nouveau Dossier Patient",
    "account.create_desc": "Créez un compte sécurisé pour remplir les questionnaires préopératoires et suivre vos documents.",
    "account.full_name": "Nom Complet du Patient",
    "account.register_btn": "Créer un Dossier & Se Connecter",
    "account.login_btn": "Connexion Sécurisée",
    "account.logout": "Se Déconnecter",
    "account.welcome": "Bienvenue,",
    "account.scheduled_title": "Vos Consultations Programmées",
    "account.no_consultations": "Vous n'avez aucun rendez-vous programmé pour le moment.",
    "account.clinical_history": "Historical Médical & Notes",
    "account.history_placeholder": "Saisissez vos antécédents médicaux ou allergies pour l'équipe...",
    "account.save_notes": "Enregistrer les Notes Médicales",
    "account.notes_saved": "Notes enregistrées dans la base de données clinique.",
    "account.procedure_col": "Procédure",
    "account.date_col": "Date & Heure",
    "account.specialist_col": "Chirurgien",
    "account.status_col": "Statut",

    // Dynamic Data
    "services.face.title": "Visage",
    "services.face.desc": "Sublimez votre visage et votre cou grâce à des interventions esthétiques avancées d'aspect naturel.",
    "services.face.details": "En utilisant des techniques chirurgicales de pointe, nos soins faciaux visent à redéfinir les contours, retendre les tissus relâchés et corriger les asymétries tout en préservant vos expressions naturelles.",
    
    "services.breast.title": "Seins",
    "services.breast.desc": "Obtenez le volume, le galbe et la symétrie que vous désirez grâce à des interventions mammaires sur mesure.",
    "services.breast.details": "Qu'il s'agisse de restaurer la plénitude après une grossesse, de soulager des maux de dos ou de reconstruire le galbe, nos options offrent des profils harmonieux et personnalisés.",
    
    "services.body.title": "Corps",
    "services.body.desc": "Redessinez et sculptez votre silhouette avec des traitements corporels chirurgicaux et non invasifs haute définition.",
    "services.body.details": "Conçus pour éliminer les amas graisseux rebelles, retirer l'excès de peau et raffermir la sangle abdominale. Nos soins corporels sculptent votre silhouette avec précision.",
    
    "services.skin.title": "Peau",
    "services.skin.desc": "Régénérez votre peau grâce à des thérapies cutanées de qualité médicale, des injections avancées et des resurfaçages de pointe.",
    "services.skin.details": "Estompez les ridules, compensez les pertes de volume, corrigez les dommages solaires et atténuez les cicatrices d'acné. Nos soins non chirurgicaux offrent des résultats éclatants.",
    "category.surgical_face": "Chirurgie Faciale",
    "category.breast_aesthetics": "Esthétique Mammaire",
    "category.body_contouring": "Modelage Corporel",
    "category.injectables": "Injections & Peau",
    "procedure.rhinoplasty": "Rhinoplastie",
    "procedure.facelift": "Lifting SMAS",
    "procedure.blepharoplasty": "Blépharoplastie",
    "procedure.breast_augmentation": "Augmentation Mammaire",
    "procedure.breast_lift": "Lifting des Seins",
    "procedure.liposuction": "Liposculpture (HD)",
    "procedure.abdominoplasty": "Abdominoplastie",
    "procedure.botox_fillers": "Injections & Botox",
    "procedure.thigh_lift": "Lifting des Cuisses",
    "procedure.thigh_liposuction": "Liposuccion des Cuisses",
    "procedure.arm_lift": "Lifting des Bras",
    "procedure.arm_liposuction": "Liposuccion des Bras",

    "specialist.dr_estrella.bio": "Le Dr Victor Estrella est un chirurgien esthétique hautement reconnu à Saint-Domingue, spécialisé en liposculpture haute définition, abdominoplastie avancée, chirurgie mammaire et rajeunissement facial, avec un accent particulier sur l'harmonie et la beauté naturelle.",
    "specialist.dr_sinclair.bio": "Le Dr Sinclair est spécialisé en rajeunissement facial, remodelage corporel haute définition et esthétique mammaire avancée, réputé pour son approche chaleureuse et attentionnée.",
    "specialists.role.director": "Chirurgien Esthétique, Reconstructeur & Plasticien Certifié",
    "specialists.role.associate": "Chirurgien Associé Principal & Innovateur Esthétique"
  },
  pt: {
    // Nav & General
    "nav.home": "Início",
    "nav.about": "Sobre Nós",
    "nav.services": "Serviços",
    "nav.specialists": "Especialistas",
    "nav.gallery": "Galeria",
    "nav.testimonials": "Depoimentos",
    "nav.contact": "Contato",
    "nav.portal": "Portal",
    "nav.aesthetics": "Estética",
    "general.consultation": "Agendar Consulta",
    "general.phone": "347 278 3792",

    // Hero
    "hero.renew": "Renove-se",
    "hero.aesthetic": "Cirurgia Estética",
    "hero.newlife": "Para uma Nova Vida",
    "hero.description": "Transformando rosto, corpo, pele e confiança com cirurgião plástico certificado. Utilizamos metodologias médicas avançadas adaptadas à sua anatomia.",
    "hero.schedulenow": "Agendar Agora",
    "hero.dr_estrella": "dr. estrella",

    // Sub-hero Columns
    "subhero.1.title": "Soluções Sob Medida",
    "subhero.1.desc": "Sua jornada de beleza única é honrada com planejamentos cirúrgicos individualizados e personalizados exclusivamente para seus objetivos anatômicos.",
    "subhero.2.title": "Inovação Estética",
    "subhero.2.desc": "Adote o que há de mais recente em procedimentos estéticos e avanços cirúrgicos para resultados seguros, marcantes e duradouros.",
    "subhero.3.title": "Especialistas Experientes",
    "subhero.3.desc": "Nossa equipe cirúrgica traz certificações oficiais e décadas de experiência combinada para sua máxima segurança e satisfação.",
    "subhero.4.title": "Cuidado Integrado",
    "subhero.4.desc": "Desfrute de orientação completa e assistência personalizada desde sua primeira consulta médica até sua recuperação pós-cirúrgica.",

    // About Us Section
    "about.title": "Sobre o Dr. Victor Estrella",
    "about.heading": "Combinando Visão Artística com Maestria Cirúrgica",
    "about.subheading": "Santo Domingo, República Dominicana",
    "about.chief": "Cirurgião Plástico Principal",
    "about.reg": "15+ Anos de Experiência",
    "about.visionary": "Cirurgião Estético e Visionário",
    "about.quote": "\"A verdadeira beleza reside no equilíbrio perfeito de harmonia, proporção e forma natural.\"",
    "about.para1": "O Dr. Victor Estrella dedicou sua carreira profissional a transformar vidas por meio de cirurgia estética, reconstrutiva e plástica avançada. Com sede na capital cosmopolita de Santo Domingo, ele é reconhecido como um dos principais especialistas da região em contorno corporal de alta definição, procedimentos faciais restauradores e estética mamária complex.",
    "about.para2": "Ao unir uma compreensão meticulosa da anatomia humana a um olhar artístico refinado e de formação clássica, o Dr. Estrella atinge transformações elegantes e naturais que se alinham perfeitamente com a estrutura inerente de cada paciente. Seu padrão evita resultados artificiais em favor de um rejuvenescimento refinado e duradouro.",
    "about.para3": "Seja recebendo pacientes locais ou turistas médicos da América do Norte, Europa e Caribe, o Dr. Estrella e sua equipe mantêm padrões de segurança de classe mundial, avaliações pré-operatórias rigorosas e suporte pós-operatório personalizado.",
    "about.mission_title": "Missão Centrada no Paciente",
    "about.mission_desc": "Empoderando a confiança a cada passo cirúrgico.",
    "about.board_title": "Certificações Médicas e Títulos",
    "about.board_desc": "Para sua segurança e tranquilidade, o Dr. Victor Estrella opera com licenças médicas completas, certificações nacionais e qualificações internacionais.",
    
    // About Credentials
    "about.cred.1.title": "Excelência Acadêmica",
    "about.cred.1.desc": "Graduado em Medicina pela prestigiada Universidad Autónoma de Santo Domingo (UASD), seguido por residência médica rigorosa em cirurgia geral e plástica.",
    "about.cred.1.desc_extra": "Especialidade em cirurgia geral e laparoscopia.",
    "about.cred.2.title": "Certificado pela SODOCIPRE",
    "about.cred.2.desc": "Membro ativo certificado da SODOCIPRE (Sociedade Dominicana de Cirurgia Plástica, Reconstrutiva e Estética), órgão regulador que garante os mais altos padrões na RD.",
    "about.cred.2.desc_extra": "FILACP – Federación Ibero Latinoamericana de Cirugía Plástica",
    "about.cred.3.title": "Afiliações Globais",
    "about.cred.3.desc": "Membro ativo da FILACP (Federação Iberolatinoamericana de Cirurgia Plástica) e de redes estéticas globais, introduzindo avanços científicos constantes.",

    // About Pillars
    "about.pillars.title": "Nossos Princípios",
    "about.pillars.heading": "Por Que os Pacientes Confiam",
    "about.pillars.desc": "Cada procedimento é uma jornada compartilhada. Seguimos valores rígidos para garantir que seu resultado cirúrgico seja seguro, confidencial e lindamente realizado.",
    "about.pillars.district": "Distrito Médico de Santo Domingo, RD",
    
    "about.pillar.1.title": "Anatomia Individualizada",
    "about.pillar.1.desc": "Um plano cirúrgico sob medida projetado estritamente para suas proporções. Sem moldes genéricos.",
    "about.pillar.2.title": "Contornos de Alta Definição",
    "about.pillar.2.desc": "Utilizando as tecnologias avançadas VASER e MicroAire para um esculpido corporal de alta precisão.",
    "about.pillar.3.title": "Segurança Inabalável",
    "about.pillar.3.desc": "Procedimentos realizados apenas em hospitais gerais credenciados com suporte de UTI completo.",
    "about.pillar.4.title": "Atendimento Bilingue",
    "about.pillar.4.desc": "Suporte de concierge para pacientes internacionais, cobrindo transporte local, enfermagem e recuperação.",

    // Services Section
    "services.portfolio": "Portfólios Clínicos Especializados",
    "services.heading": "Nossos Serviços Cirúrgicos e Estéticos",
    "services.desc": "Transformando rosto, corpo, pele e confiança com cirurgiões plásticos certificados. Utilizamos metodologias médicas avançadas sob medida para sua anatomia.",
    "services.view_all": "Ver Todos os Serviços",
    "services.premium_category": "Categoria Clínica Premium",
    "services.featured_treatments": "Tratamentos em Destaque:",
    "services.learn_more": "Ver Detalhes Completos",
    "services.show_less": "Mostrar Menos",
    "services.book_prefix": "Reservar",

    // Specialists Section
    "specialists.subtitle": "Conselho Clínico e Especialistas",
    "specialists.heading": "Conheça Nossa Equipe Cirúrgica",
    "specialists.desc": "Contamos com profissionais certificados comprometidos com os mais rígidos padrões médicos, precisão anatômica e excelentes resultados.",
    "specialists.view_credentials": "Ver Títulos",
    "specialists.certified": "Cirurgião Certificado",

    // Gallery Section
    "gallery.subtitle": "Resultados Clínicos Antes & Depois",
    "gallery.heading": "Galeria de Casos Clínicos",
    "gallery.desc": "Pacientes reais. Resultados reais. Arraste o cursor para a esquerda ou direita em cada imagem para comparar as fotos de Antes e Depois.",
    "gallery.all": "Todos os Resultados",
    "gallery.drag_compare": "Arraste para comparar",
    "gallery.before": "Antes",
    "gallery.after": "Depois",
    "gallery.see_more": "VER MAIS",
    "gallery.back_home": "Voltar ao Início",
    "gallery.g3.title": "Lipoaspiração 360, BBL e Abdominoplastia",
    "gallery.g4.title": "Lifting de Coxas (Cruroplastia)",
    "gallery.g5.title": "Lipoaspiração e BBL (Aumento de Glúteos)",
    "gallery.g6.title": "Lipoaspiração 360, BBL e Abdominoplastia Avançada",
    "gallery.g7.title": "Redução de Mama para Gigantomastia",
    "gallery.g8.title": "Lipoaspiração, BBL, Lifting de Mama e Implantes",

    // Testimonials Section
    "testimonials.subtitle": "O Que Dizem Nossos Pacientes",
    "testimonials.heading": "Histórias de Sucesso",
    "testimonials.desc": "Leia avaliações e depoimentos autênticos de pacientes que passaram por transformações estéticas e rejuvenescimento sob nossos cuidados.",

    // Contact & Booking Section
    "contact.subtitle": "Contate Nosso Consultório",
    "contact.heading": "Solicite uma Consulta Clínica",
    "contact.desc": "Dê o primeiro passo rumo ao seu novo perfil. Preencha nosso formulário de pré-consulta seguro e nosso coordenador cirúrgico entrará em contato prontamente.",
    "contact.visit_us": "Visite Nossos Consultórios",
    "contact.visit_desc": "IPBMA Medical Associates, Av Independencia 655, Gazcue, Santo Domingo, República Dominicana",
    "contact.bilingual": "Coordenação Bilíngue 24/7",
    "contact.bilingual_desc": "Disponível ininterruptamente para pacientes nacionais e internacionais.",
    "contact.evaluation_form": "FORMULÁRIO DE AVALIAÇÃO MÉDICA",
    "contact.female_patient": "PACIENTE FEMENINA",
    "contact.male_patient": "PACIENTE MASCULINO",
    
    // Form Inputs
    "form.first_name": "Nome",
    "form.last_name": "Sobrenome",
    "form.email": "E-mail",
    "form.phone": "Número de Telefone",
    "form.procedure": "Procedimento Desejado",
    "form.specialist": "Cirurgião de Preferência",
    "form.date": "Data de Preferência",
    "form.time": "Horário de Preferência",
    "form.notes": "Histórico Clínico / Notas sobre Objetivos Estéticos",
    "form.submit": "Enviar Solicitação de Consulta Segura",
    "form.submitting": "Processando Solicitação...",
    "form.success": "Solicitação de consulta enviada com sucesso!",

    // Account Portal & Cabinet
    "account.cabinet": "Meu Portal do Paciente",
    "account.login": "Acesse Seu Prontuário Clínico",
    "account.login_desc": "Faça login com suas credenciais para visualizar suas datas de consulta, instruções pós-operatórias e formulários médicos seguros.",
    "account.create": "Registrar Novo Prontuário",
    "account.create_desc": "Crie uma conta segura para responder questionários pré-operatórios e acompanhar seus documentos.",
    "account.full_name": "Nome Completo do Paciente",
    "account.register_btn": "Registrar e Entrar",
    "account.login_btn": "Entrar com Segurança",
    "account.logout": "Sair",
    "account.welcome": "Bem-vindo de volta,",
    "account.scheduled_title": "Suas Consultas Agendadas",
    "account.no_consultations": "Você não possui consultas agendadas no momento.",
    "account.clinical_history": "Histórico Clínico & Notas",
    "account.history_placeholder": "Digite alergias ou histórico médico para a equipe cirúrgica...",
    "account.save_notes": "Salvar Notas Médicas",
    "account.notes_saved": "Notas salvas no banco de dados clínico.",
    "account.procedure_col": "Procedimento",
    "account.date_col": "Data e Hora",
    "account.specialist_col": "Cirurgião",
    "account.status_col": "Status",

    // Dynamic Data
    "services.face.title": "Rosto",
    "services.face.desc": "Transforme seu rosto e pescoço com procedimentos avançados de aspecto natural. Alcance uma harmonia facial rejuvenescida.",
    "services.face.details": "Utilizando técnicas cirúrgicas avançadas, nossos procedimentos faciais visam restaurar a definição, elevar tecidos flácidos e tratar assimetrias respeitando suas expressões naturais.",
    
    "services.breast.title": "Mama",
    "services.breast.desc": "Alcance o volume, sustentação e simetria que deseja com procedimentos mamários personalizados.",
    "services.breast.details": "Seja para restaurar a firmeza perdida após a gravidez ou perda de peso, reduzir o desconforto nas costas ou reconstruir a forma, nossas opções oferecem perfis proporcionais e bonitos.",
    
    "services.body.title": "Corpo",
    "services.body.desc": "Contorne e esculpa sua silhueta com tratamentos cirúrgicos e não invasivos de alta definição.",
    "services.body.details": "Projetado para eliminar depósitos de gordura persistentes, remover excesso de pele e tonificar as paredes abdominais. Nossos tratamentos corporais esculpem uma silhueta harmoniosa.",
    
    "services.skin.title": "Pele",
    "services.skin.desc": "Rejuvenesça sua pele com terapias dérmicas de grau médico, injeções avançadas e renovação cutânea.",
    "services.skin.details": "Trate linhas finas, perda de volume, danos solares e cicatrizes de acne. Nossos procedimentos estéticos não cirúrgicos oferecem recuperação rápida e resultados radiantes.",
    "category.surgical_face": "Cirurgia Facial",
    "category.breast_aesthetics": "Estética de Mama",
    "category.body_contouring": "Contorno Corporal",
    "category.injectables": "Injetáveis e Pele",
    "procedure.rhinoplasty": "Rinoplastia",
    "procedure.facelift": "Lifting Facial (SMAS)",
    "procedure.blepharoplasty": "Blefaroplastia",
    "procedure.breast_augmentation": "Aumento de Mama",
    "procedure.breast_lift": "Mastopexia (Lifting)",
    "procedure.liposuction": "Lipoaspiração (HD)",
    "procedure.abdominoplasty": "Abdominoplastia",
    "procedure.botox_fillers": "Injetáveis e Botox",
    "procedure.thigh_lift": "Lifting de Coxas",
    "procedure.thigh_liposuction": "Lipoaspiração de Coxas",
    "procedure.arm_lift": "Lifting de Braços",
    "procedure.arm_liposuction": "Lipoaspiração de Braços",

    "specialist.dr_estrella.bio": "O Dr. Victor Estrella é um cirurgião plástico altamente reconhecido em Santo Domingo, especializado em lipoaspiração de alta definição, abdominoplastia avançada, cirurgia de mama e rejuvenescimento facial focado em harmonia e beleza natural.",
    "specialist.dr_sinclair.bio": "O Dr. Sinclair é especialista em rejuvenescimento facial, contorno corporal de alta definição e estética mamária avançada, reconhecido por seu atendimento humano e atencioso.",
    "specialists.role.director": "Cirurgião Plástico, Reconstrutivo e Estético Certificado",
    "specialists.role.associate": "Cirurgião Associado Sênior e Inovador Estético"
  },
  de: {
    // Nav & General
    "nav.home": "Startseite",
    "nav.about": "Über Uns",
    "nav.services": "Leistungen",
    "nav.specialists": "Spezialisten",
    "nav.gallery": "Galerie",
    "nav.testimonials": "Bewertungen",
    "nav.contact": "Kontakt",
    "nav.portal": "Portal",
    "nav.aesthetics": "Ästhetik",
    "general.consultation": "Beratung Buchen",
    "general.phone": "347 278 3792",

    // Hero
    "hero.renew": "Erneuere Dich",
    "hero.aesthetic": "Ästhetische Chirurgie",
    "hero.newlife": "Für ein Neues Leben",
    "hero.description": "Veränderung von Gesicht, Körper, Haut und Selbstvertrauen mit einem zertifizierten plastischen Chirurgen. Wir nutzen fortschrittliche medizinische Methoden, die auf Ihre Anatomie abgestimmt sind.",
    "hero.schedulenow": "Jetzt Buchen",
    "hero.dr_estrella": "dr. estrella",

    // Sub-hero Columns
    "subhero.1.title": "Individuelle Lösungen",
    "subhero.1.desc": "Ihre einzigartige Schönheitsreise wird mit maßgeschneiderten chirurgischen Konzepten geehrt, die exakt auf Ihre anatomischen Ziele abgestimmt sind.",
    "subhero.2.title": "Ästhetische Innovation",
    "subhero.2.desc": "Nutzen Sie modernste ästhetische Verfahren und chirurgische Entwicklungen für sichere, atemberaubende und langanhaltende Ergebnisse.",
    "subhero.3.title": "Erfahrene Experten",
    "subhero.3.desc": "Unser chirurgisches Team verfügt über staatliche Zertifizierungen und Jahrzehnte an Erfahrung für Ihre maximale Sicherheit.",
    "subhero.4.title": "Lückenlose Betreuung",
    "subhero.4.desc": "Genießen Sie umfassende Beratung und persönliche Unterstützung von Ihrem ersten Gespräch bis zu Ihrer vollständigen Genesung.",

    // About Us Section
    "about.title": "Über Dr. Victor Estrella",
    "about.heading": "Künstlerische Vision Verbunden mit Chirurgischer Meisterhand",
    "about.subheading": "Santo Domingo, Dominikanische Republik",
    "about.chief": "Leitender Plastischer Chirurg",
    "about.reg": "15+ Jahre Erfahrung",
    "about.visionary": "Ästhetischer Chirurg & Visionär",
    "about.quote": "\"Wahre Schönheit liegt im perfekten Zusammenspiel von Harmonie, Proportion und natürlicher Form.\"",
    "about.para1": "Dr. Victor Estrella widmet seine berufliche Karriere der Veränderung von Leben durch fortschrittliche ästhetische, rekonstruktive und plastische Chirurgie. In der Metropole Santo Domingo ansässig, gilt er als einer der führenden Spezialisten der Region für hochauflösende Körperkonturierung, restaurative Gesichtsbehandlungen und komplexe Brustästhetik.",
    "about.para2": "Durch die Verschmelzung eines präzisen Verständnisses der menschlichen Anatomie mit einem verfeinerten, klassisch geschulten künstlerischen Auge erzielt Dr. Estrella elegante, natürlich wirkende Transformationen, die perfekt zur angeborenen Struktur des Patienten passen. Sein Standard vermeidet künstliche Ergebnisse zugunsten einer verfeinerten Verjüngung.",
    "about.para3": "Ob lokale Patienten oder Medizintouristen aus Nordamerika, Europa und der Karibik – Dr. Estrella und sein klinisches Team garantieren weltweit anerkannte Sicherheitsstandards, sorgfältige Voruntersuchungen und eine maßgeschneiderte postoperative Betreuung.",
    "about.mission_title": "Patientenzentrierte Mission",
    "about.mission_desc": "Stärkung des Selbstvertrauens bei jedem operativen Schritt.",
    "about.board_title": "Ärztliche Zertifizierungen und Abschlüsse",
    "about.board_desc": "Für Ihre Sicherheit und Sorgenfreiheit praktiziert Dr. Victor Estrella mit vollen ärztlichen Zulassungen und internationalen Qualifikationen.",
    
    // About Credentials
    "about.cred.1.title": "Akademische Exzellenz",
    "about.cred.1.desc": "Medizinstudium an der renommierten Universidad Autónoma de Santo Domingo (UASD), gefolgt von einer anspruchsvollen Facharztausbildung in Allgemein- und plastischer Chirurgie.",
    "about.cred.1.desc_extra": "Spezialisierung auf Allgemeinchirurgie und Laparoskopie.",
    "about.cred.2.title": "Zertifiziert durch SODOCIPRE",
    "about.cred.2.desc": "Aktives Mitglied der SODOCIPRE (Dominikanische Gesellschaft für plastische, rekonstruktive und ästhetische Chirurgie), der höchsten Kontrollbehörde des Landes.",
    "about.cred.2.desc_extra": "FILACP – Federación Ibero Latinoamericana de Cirugía Plástica",
    "about.cred.3.title": "Globale Allianzen",
    "about.cred.3.desc": "Vollwertiges aktives Mitglied der FILACP (Iberolateinamerikanische Föderation für plastische Chirurgie) und internationaler Netzwerke.",

    // About Pillars
    "about.pillars.title": "Unsere Prinzipien",
    "about.pillars.heading": "Warum Patienten Vertrauen",
    "about.pillars.desc": "Jeder Eingriff ist ein gemeinsamer Weg. Wir befolgen kompromisslose Kernwerte, um sicherzustellen, dass Ihr klinisches Ergebnis sicher, vertraulich und ästhetisch perfekt realisiert wird.",
    "about.pillars.district": "Medizinisches Viertel Santo Domingo, DR",
    
    "about.pillar.1.title": "Individuelle Anatomie",
    "about.pillar.1.desc": "Ein maßgeschneidertes Konzept, das ausschließlich für Ihre Proportionen entwickelt wurde. Keine Standardvorlagen.",
    "about.pillar.2.title": "Hochauflösende Konturen",
    "about.pillar.2.desc": "Verwendung fortschrittlicher VASER- und MicroAire-Technologien für ein makelloses Body-Sculpting.",
    "about.pillar.3.title": "Kompromisslose Sicherheit",
    "about.pillar.3.desc": "Eingriffe werden ausschließlich in akkreditierten Krankenhäusern mit vollwertiger Intensivstation durchgeführt.",
    "about.pillar.4.title": "Zweisprachige Betreuung",
    "about.pillar.4.desc": "Concierge-Service für internationale Reisende, inklusive Transport, Pflegekräfte und Erholung.",

    // Services Section
    "services.portfolio": "Klinische Leistungsportfolios",
    "services.heading": "Unsere Chirurgischen & Ästhetischen Leistungen",
    "services.desc": "Verschönern Sie Gesicht, Körper, Haut und Selbstvertrauen mit zertifizierten plastischen Chirurgen. Wir verwenden modernste Methoden, die exakt auf Ihre Anatomie abgestimmt sind.",
    "services.view_all": "Alle Leistungen Anzeigen",
    "services.premium_category": "Premium Klinische Kategorie",
    "services.featured_treatments": "Hervorgehobene Behandlungen:",
    "services.learn_more": "Weitere Details Anzeigen",
    "services.show_less": "Weniger Anzeigen",
    "services.book_prefix": "Buchen",

    // Specialists Section
    "specialists.subtitle": "Klinischer Beirat & Spezialisten",
    "specialists.heading": "Treffen Sie Unser Chirurgisches Team",
    "specialists.desc": "Bei uns erwarten Sie zertifizierte ästhetische Chirurgen, die sich strengen professionellen Standards, anatomischer Präzision und erstklassigen Ergebnissen verschrieben haben.",
    "specialists.view_credentials": "Referenzen Anzeigen",
    "specialists.certified": "Zertifizierter Chirurg",

    // Gallery Section
    "gallery.subtitle": "Vorher-Nachher-Ergebnisse",
    "gallery.heading": "Fallstudien-Galerie",
    "gallery.desc": "Echte Patienten. Echte Ergebnisse. Ziehen Sie den Regler nach links oder rechts, um Vorher- und Nachher-Bilder von Gesichts- und Körperkonturierungen zu vergleichen.",
    "gallery.all": "Alle Ergebnisse",
    "gallery.drag_compare": "Ziehen zum Vergleichen",
    "gallery.before": "Vorher",
    "gallery.after": "Nachher",
    "gallery.see_more": "MEHR ANZEIGEN",
    "gallery.back_home": "Zurück zur Startseite",
    "gallery.g3.title": "Fettabsaugung 360, BBL & Bauchdeckenstraffung",
    "gallery.g4.title": "Oberschenkelstraffung",
    "gallery.g5.title": "Fettabsaugung & BBL (Brasilianisches Po-Lifting)",
    "gallery.g6.title": "Fettabsaugung 360, BBL & Erweiterte Bauchdeckenstraffung",
    "gallery.g7.title": "Brustverkleinerung bei Gigantomastie",
    "gallery.g8.title": "Fettabsaugung, BBL, Bruststraffung & Brustvergrößerung",

    // Testimonials Section
    "testimonials.subtitle": "Was Unsere Patienten Sagen",
    "testimonials.heading": "Erfolgsgeschichten von Patienten",
    "testimonials.desc": "Lesen Sie ehrliche Berichte und Bewertungen von Patienten, die eine ästhetische Behandlung oder Verjüngung bei uns erfahren haben.",

    // Contact & Booking Section
    "contact.subtitle": "Kontaktieren Sie Unser Medizinisches Büro",
    "contact.heading": "Klinisches Beratungsgespräch Anfordern",
    "contact.desc": "Machen Sie den ersten Schritt. Füllen Sie unser sicheres Vorbereitungsformular aus, und unser chirurgischer Koordinator wird Sie zeitnah kontaktieren.",
    "contact.visit_us": "Besuchen Sie Uns",
    "contact.visit_desc": "IPBMA Medical Associates, Av Independencia 655, Gazcue, Santo Domingo, Dominikanische Republik",
    "contact.bilingual": "Zweisprachige Koordinationsstelle",
    "contact.bilingual_desc": "Rund um die Uhr für in- und ausländische Patienten erreichbar.",
    "contact.evaluation_form": "MEDIZINISCHES BEWERTUNGSFORMULAR",
    "contact.female_patient": "WEIBLICHE PATIENTIN",
    "contact.male_patient": "MÄNNLICHER PATIENT",
    
    // Form Inputs
    "form.first_name": "Vorname",
    "form.last_name": "Nachname",
    "form.email": "E-Mail-Adresse",
    "form.phone": "Telefonnummer",
    "form.procedure": "Gewünschter Eingriff",
    "form.specialist": "Bevorzugter Chirurg",
    "form.date": "Wunschtermin",
    "form.time": "Wunschzeit",
    "form.notes": "Krankengeschichte / Ästhetische Ziele",
    "form.submit": "Sichere Beratungsanfrage Absenden",
    "form.submitting": "Anfrage wird verarbeitet...",
    "form.success": "Beratungsanfrage erfolgreich gesendet!",

    // Account Portal & Cabinet
    "account.cabinet": "Mein Patientenportal",
    "account.login": "Zugriff auf Ihre Patientenakte",
    "account.login_desc": "Melden Sie sich mit Ihren Zugangsdaten an, um Ihre Beratungstermine, postoperativen Anweisungen und sicheren medizinischen Formulare einzusehen.",
    "account.create": "Neue Patientenakte Registrieren",
    "account.create_desc": "Erstellen Sie ein sicheres Konto, um präoperative Fragebögen auszufüllen und Dokumente einzureichen.",
    "account.full_name": "Vollständiger Patientenname",
    "account.register_btn": "Registrieren & Einloggen",
    "account.login_btn": "Sicher Einloggen",
    "account.logout": "Abmelden",
    "account.welcome": "Willkommen zurück,",
    "account.scheduled_title": "Ihre Geplanten Beratungen",
    "account.no_consultations": "Sie haben derzeit keine geplanten Beratungstermine.",
    "account.clinical_history": "Krankengeschichte & Notizen",
    "account.history_placeholder": "Geben Sie Allergien oder Vorerkrankungen für das chirurgische Team ein...",
    "account.save_notes": "Medizinische Notizen Speichern",
    "account.notes_saved": "Notizen in klinischer Datenbank gespeichert.",
    "account.procedure_col": "Eingriff",
    "account.date_col": "Datum & Uhrzeit",
    "account.specialist_col": "Chirurg",
    "account.status_col": "Status",

    // Dynamic Data
    "services.face.title": "Gesicht",
    "services.face.desc": "Verjüngen Sie Gesicht und Hals mit fortschrittlichen, natürlich wirkenden Verfahren. Erreichen Sie harmonische Proportionen.",
    "services.face.details": "Mithilfe modernster chirurgischer Techniken zielen unsere Gesichtsbehandlungen darauf ab, Definitionen wiederherzustellen, schlaffes Gewebe zu straffen und Asymmetrien auszugleichen – für einen natürlichen Ausdruck.",
    
    "services.breast.title": "Brust",
    "services.breast.desc": "Erreichen Sie das gewünschte Volumen, die Straffung und Symmetrie mit individuell konzipierten Eingriffen.",
    "services.breast.details": "Ob Fülle nach einer Schwangerschaft oder Gewichtsabnahme, Entlastung bei Rückenschmerzen oder Rekonstruktion – unsere Brustbehandlungen bieten ein harmonisches und formschönes Profil.",
    
    "services.body.title": "Körper",
    "services.body.desc": "Konturieren und formen Sie Ihre Silhouette mit hochpräzisen chirurgischen und nicht-invasiven Body-Contouring-Verfahren.",
    "services.body.details": "Gezielter Abbau hartnäckiger Fettdepots, Straffung überschüssiger Haut und Festigung der Bauchdecke für eine wohlgeformte, athletische Silhouette.",
    
    "services.skin.title": "Haut",
    "services.skin.desc": "Verjüngen Sie Ihre Haut mit medizinischen Therapien, injizierbaren Fillern und hochmodernen Lasersystemen.",
    "services.skin.details": "Behandeln Sie feine Falten, Volumenverlust, Sonnenschäden und Aknenarben. Unsere nicht-operativen Verfahren bieten schnelle Erholungszeiten und strahlende Ergebnisse.",
    "category.surgical_face": "Gesichts-Chirurgie",
    "category.breast_aesthetics": "Brust-Ästhetik",
    "category.body_contouring": "Körperkonturierung",
    "category.injectables": "Injektionen & Haut",
    "procedure.rhinoplasty": "Nasenkorrektur (Rhinoplastik)",
    "procedure.facelift": "Facelift (SMAS)",
    "procedure.blepharoplasty": "Lidstraffung",
    "procedure.breast_augmentation": "Brustvergrößerung",
    "procedure.breast_lift": "Bruststraffung",
    "procedure.liposuction": "Fettabsaugung (HD)",
    "procedure.abdominoplasty": "Bauchdeckenstraffung",
    "procedure.botox_fillers": "Filler & Botox",
    "procedure.thigh_lift": "Oberschenkelstraffung",
    "procedure.thigh_liposuction": "Oberschenkel-Liposuktion",
    "procedure.arm_lift": "Oberarmstraffung",
    "procedure.arm_liposuction": "Oberarm-Liposuktion",

    "specialist.dr_estrella.bio": "Dr. Victor Estrella ist ein hochangesehener plastischer Chirurg in Santo Domingo, spezialisiert auf hochauflösende Liposuktion, fortschrittliche Abdominoplastik, Brustchirurgie und Gesichtsverjüngung mit Fokus auf Harmonie und natürliche Schönheit.",
    "specialist.dr_sinclair.bio": "Dr. Sinclair ist spezialisiert auf Gesichtsverjüngung, hochauflösendes Body-Contouring und fortschrittliche Brustästhetik, bekannt für seine einfühlsame, patientenorientierte Betreuung.",
    "specialists.role.director": "Zertifizierter plastischer, rekonstruktiver & ästhetischer Chirurg",
    "specialists.role.associate": "Leitender operativer Partner & Ästhetik-Innovator"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem('estrella_lang');
      if (stored && ['en', 'es', 'fr', 'pt', 'de'].includes(stored)) {
        return stored as Language;
      }
    } catch (e) {
      // Ignored
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('estrella_lang', lang);
    } catch (e) {
      // Ignored
    }
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
