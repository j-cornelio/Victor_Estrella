import { Product, Specialist, GalleryItem, Testimonial, ProcedurePricingItem, PricingAddon } from './types';
import { optimizeCloudinary } from './utils/imageOptimizer';

export const SERVICES = [
  {
    id: 'face',
    title: 'Face',
    description: 'Transform your face and neck with advanced natural-looking procedures. Achieve a refreshed, youthful facial harmony.',
    procedures: ['Blefaroplastia', 'Bichectomía', 'Frontoplastia', 'Lifting Facial Endoscópico', 'Liposucción de Papada'],
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600',
    details: 'Utilizing state-of-the-art surgical techniques, our facial procedures aim to restore definition, lift sagging tissues, and address specific asymmetry while maintaining your natural expressions and structure.'
  },
  {
    id: 'breast',
    title: 'Breast',
    description: 'Achieve your desired volume, lift, and symmetry with tailored breast procedures designed for natural contour.',
    procedures: ['Breast Augmentation', 'Breast Lift (Mastopexy)', 'Breast Reduction', 'Breast Reconstruction'],
    image: optimizeCloudinary('https://res.cloudinary.com/dkicj8zmk/image/upload/v1784141729/breasts_dyyjpb.png', 800),
    details: 'Whether seeking to restore fullness lost after pregnancy or weight loss, reduce back discomfort, or reconstruct shape, our breast options deliver balanced, proportional, and beautifully customized profiles.'
  },
  {
    id: 'body',
    title: 'Body',
    description: 'Contour and sculpt your silhouette with transformative surgical and non-invasive body-shaping treatments.',
    procedures: ['Tummy Tuck (Abdominoplasty)', 'Liposuction (Lipo 360)', 'Body Lift', 'Thigh Lift', 'Thigh Liposuction', 'Arm Lift', 'Arm Liposuction'],
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600',
    details: 'Designed to target stubborn fat deposits, remove excess skin, and tighten underlying abdominal walls. Our body treatments restore definition and contour to enhance your personal silhouette.'
  },
  {
    id: 'skin',
    title: 'Skin',
    description: 'Rejuvenate your skin with medical-grade dermal therapies, customized injectables, and advanced skin resurfacing.',
    procedures: ['Botox & Dysport', 'Dermal Fillers', 'Chemical Peels', 'Microneedling with PRP', 'Laser Resurfacing'],
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=600',
    details: 'Address fine lines, volume loss, sun damage, and acne scarring. Our non-surgical aesthetic skin treatments offer fast recovery and high-impact glowing results customized to your skin profile.'
  }
];

export const SPECIALISTS: Specialist[] = [
  {
    id: 'dr-estrella',
    name: 'Dr. Victor Estrella, MD',
    role: 'Board Certified Plastic, Reconstructive & Aesthetic Surgeon',
    image: optimizeCloudinary('https://res.cloudinary.com/dkicj8zmk/image/upload/v1786987014/vic_in_scrubs_ncpzcv.jpg', 600),
    bio: 'Dr. Victor Estrella is a highly recognized plastic surgeon in Santo Domingo, specializing in high-definition liposculpture, advanced abdominoplasty, breast surgery, and facial rejuvenation with a focus on harmony and natural-looking beauty.',
    rating: 5
  },
  {
    id: 'dr-sinclair',
    name: 'Dr. James Sinclair, MD',
    role: 'Senior Associate Surgeon & Aesthetics Innovator',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400',
    bio: 'Dr. Sinclair specializes in facial rejuvenation, high-definition body contouring, and advanced breast aesthetics, recognized for his compassionate, patient-first care.',
    rating: 5
  },
  {
    id: 'carly-boulineau',
    name: 'Carly Boulineau',
    role: 'Medical Assistant & CoolSculpting Specialist',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
    bio: 'Carly is certified in coolsculpting technology, body contouring assessments, and patient care coordination, dedicated to body-confidence journeys.',
    rating: 5
  },
  {
    id: 'brooke-tootle',
    name: 'Brooke Tootle',
    role: 'Front Office Coordinator',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
    bio: 'Brooke handles initial consultations, appointment programming, and patient onboarding, greeting every client with warmth and professionalism.',
    rating: 5
  }
];

export const PRODUCTS: Product[] = [
  // Skincare products
  {
    id: 'lumiskin-vitamin-c',
    name: 'Lumiskin C-Brightening Serum',
    price: 98,
    category: 'skincare',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400',
    description: 'A professional-grade 15% Vitamin C serum with hyaluronic acid and ferulic acid to reverse aging and brighten dull skin.',
    benefits: ['Fades dark spots and hyperpigmentation', 'Protects against environmental free radicals', 'Boosts skin elasticity and collagen production']
  },
  {
    id: 'lumiskin-hyaluronic',
    name: 'Lumiskin Hydro-Rescue Plumper',
    price: 85,
    category: 'skincare',
    image: 'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&q=80&w=400',
    description: 'Multi-molecular weight hyaluronic hydration gel that binds moisture deeply into cellular layers for instant plumpness.',
    benefits: ['Deeply hydrates up to 72 hours', 'Visibly reduces fine lines and wrinkles', 'Calms irritated or post-procedure skin']
  },
  {
    id: 'lumiskin-retinol',
    name: 'Lumiskin Youth Renewal 1% Retinol',
    price: 110,
    category: 'skincare',
    image: 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=400',
    description: 'Encapsulated slow-release medical retinol to accelerate cell turnover and smooth skin texture without irritation.',
    benefits: ['Diminishes fine wrinkles and dark spots', 'Smooths irregular, bumpy skin texture', 'Shrinks enlarged pores and clears acne']
  },
  {
    id: 'lumiskin-sunscreen',
    name: 'Lumiskin Sheer-Defense SPF 50',
    price: 54,
    category: 'skincare',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=400',
    description: 'Ultra-lightweight physical sunscreen with transparent zinc oxide and botanical antioxidants for sensitive skin protection.',
    benefits: ['Broad-spectrum UVA/UVB mineral defense', 'Resistant to water and sweat', 'No white cast, leaves a smooth matte finish']
  },
  // Med-Spa Treatments (can be purchased as packages)
  {
    id: 'treatment-botox',
    name: 'Botox Cosmetic Session (20 Units)',
    price: 280,
    category: 'treatment',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=400',
    description: 'Expertly administered FDA-approved Botox injections targeting frown lines, forehead creases, and crow’s feet.',
    benefits: ['Smooths severe lines for 3-4 months', 'Quick 15-minute lunchtime treatment', 'Zero downtime, visible results in 7-14 days']
  },
  {
    id: 'treatment-coolsculpting',
    name: 'CoolSculpting Elite Session',
    price: 750,
    category: 'treatment',
    image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=400',
    description: 'Advanced non-invasive cryolipolysis to freeze and eliminate stubborn fat cells permanently in treated target zones.',
    benefits: ['Reduces fat layers by up to 20-25%', 'Targets abdomen, flanks, chin, or thighs', 'Non-surgical with absolutely zero downtime']
  },
  {
    id: 'treatment-filler',
    name: 'Juvéderm Dermal Filler (1 Syringe)',
    price: 650,
    category: 'treatment',
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=400',
    description: 'Hyaluronic acid filler to restore youthful facial volume, plump lips, sculpt cheeks, and soften nasolabial lines.',
    benefits: ['Instant facial contouring & volume correction', 'Long-lasting natural beauty results up to 12 months', 'Minimally invasive with immediate satisfaction']
  },
  {
    id: 'treatment-microneedling',
    name: 'SkinPen Microneedling Treatment',
    price: 320,
    category: 'treatment',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400',
    description: 'Medical microneedling device creating microscopic channels to trigger skin’s natural healing, collagen, and elastin.',
    benefits: ['Reverses deep acne scars & stretch marks', 'Refines skin texture and tightens pore size', 'Promotes smooth, glowing skin regeneration']
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    title: 'LIFE-CHANGING RESULTS',
    quote: 'I am absolutely thrilled with my experience with Dr. Victor Estrella. He and his team not only met but exceeded my expectations. They listened attentively to my goals and concerns, offering personalized advice and support throughout. Highly recommend!',
    rating: 5,
    author: 'Sarah Jenkins',
    source: 'RealSelf verified patient'
  },
  {
    id: 't2',
    title: 'EXPERTISE AND COMPASSION',
    quote: 'Choosing Dr. Victor Estrella for my cosmetic surgery was one of the best decisions I\'ve made. Dr. Estrella\'s expertise and compassionate approach made me feel at ease from the initial consultation to the post-op care. The entire team demonstrated professionalism and genuine care.',
    rating: 5,
    author: 'Rebecca Thompson',
    source: 'RealSelf verified patient'
  },
  {
    id: 't3',
    title: 'CONFIDENCE RESTORED',
    quote: 'After researching several clinics, I chose Dr. Victor Estrella, and I\'m so glad I did. Dr. Estrella and his team not only enhanced my physical appearance but also restored my confidence. From the moment I walked into their office, I felt welcomed and understood.',
    rating: 5,
    author: 'Michelle Vance',
    source: 'RealSelf verified patient'
  },
  {
    id: 't4',
    title: 'NATURAL LOOKING OUTCOME',
    quote: 'Dr. DeLozier is a true artist. My facelift looks completely natural—as if I have slept well for ten years, not as if I\'ve had surgery! The staff is warm, professional, and supported me through every stage of recovery.',
    rating: 5,
    author: 'Catherine Dubois',
    source: 'RealSelf verified patient'
  }
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'g3',
    title: 'Liposuction 360, BBL & Tummy Tuck',
    before: optimizeCloudinary('https://res.cloudinary.com/dkicj8zmk/image/upload/v1784308433/Liposuction_360_BBL_Tummy_Tuck_before_snwgjy.png', 800),
    after: optimizeCloudinary('https://res.cloudinary.com/dkicj8zmk/image/upload/v1784308433/Liposuction_360_BBL_Tummy_Tuck_g8ikj7.png', 800),
    category: 'Body Contouring',
    objectFit: 'contain'
  },
  {
    id: 'g8',
    title: 'Liposuction, BBL & Breast Augmentation with Implants',
    before: optimizeCloudinary('https://res.cloudinary.com/dkicj8zmk/image/upload/v1784321692/Liposuction-BBL-Breast-lift-augmentation-implants-before_peva9k.png', 800),
    after: optimizeCloudinary('https://res.cloudinary.com/dkicj8zmk/image/upload/v1784321692/Liposuction-BBL-Breast-lift-augmentation-implants-after_nazaor.png', 800),
    category: 'Breast Aesthetics',
    objectFit: 'contain'
  },
  {
    id: 'g4',
    title: 'Thigh Lift (Cruroplasty)',
    before: optimizeCloudinary('https://res.cloudinary.com/dkicj8zmk/image/upload/v1784311240/Thigh_lift_before_mx7r3y.png', 800),
    after: optimizeCloudinary('https://res.cloudinary.com/dkicj8zmk/image/upload/v1784311240/Thigh_lift_after_u38pee.png', 800),
    category: 'Body Contouring'
  },
  {
    id: 'g5',
    title: 'Liposuction & BBL (Brazilian Butt Lift)',
    before: optimizeCloudinary('https://res.cloudinary.com/dkicj8zmk/image/upload/v1784310102/BBL_lipo_before_gdq6qm.png', 800),
    after: optimizeCloudinary('https://res.cloudinary.com/dkicj8zmk/image/upload/v1784310102/BBL_lipo_after_f4bxjh.png', 800),
    category: 'Body Contouring',
    objectFit: 'contain'
  },
  {
    id: 'g6',
    title: 'Liposuction 360, BBL & Tummy Tuck (Abdominoplasty)',
    before: optimizeCloudinary('https://res.cloudinary.com/dkicj8zmk/image/upload/v1784310571/Liposuction_360_BBL_TummyTuck_Abdominoplasty__after_g4uyuz.png', 800),
    after: optimizeCloudinary('https://res.cloudinary.com/dkicj8zmk/image/upload/v1784310571/Liposuction_360_BBL_TummyTuck_Abdominoplasty__after_1_azfo3y.png', 800),
    category: 'Body Contouring'
  },
  {
    id: 'g7',
    title: 'Breast Reduction for Gigantomastia',
    before: optimizeCloudinary('https://res.cloudinary.com/dkicj8zmk/image/upload/v1784322015/Breast-reduction-gigantomastia-before_srwtot.png', 800),
    after: optimizeCloudinary('https://res.cloudinary.com/dkicj8zmk/image/upload/v1784322015/Breast_reduction_for_gigantomastia_after_blbd8q.png', 800),
    category: 'Breast Aesthetics',
    objectFit: 'contain'
  }
];

// ==========================================
// LISTA OFICIAL DE PROCEDIMIENTOS Y PRECIOS
// Precios aproximados en USD (Dr. Víctor Estrella)
// ==========================================

export const OFFICIAL_PRICE_LIST: ProcedurePricingItem[] = [
  {
    id: 'lipo_senos_implantes',
    name: 'Liposucción + Senos con Implantes',
    nameEn: 'Liposuction + Breasts with Implants',
    procedurePrice: 6500,
    medicalExpenses: 1200,
    estimatedTotal: 7700,
    includesBreasts: true,
    category: 'combo'
  },
  {
    id: 'lipo_senos_sin_implantes',
    name: 'Liposucción + Senos sin Implantes',
    nameEn: 'Liposuction + Breasts without Implants',
    procedurePrice: 7000,
    medicalExpenses: 1200,
    estimatedTotal: 8200,
    includesBreasts: true,
    category: 'combo'
  },
  {
    id: 'lipo_bbl',
    name: 'Liposucción + BBL',
    nameEn: 'Liposuction + BBL (Brazilian Butt Lift)',
    procedurePrice: 4000,
    medicalExpenses: 1100,
    estimatedTotal: 5100,
    includesBreasts: false,
    category: 'body'
  },
  {
    id: 'abdominoplastia_flancos',
    name: 'Abdominoplastia + Liposucción de Flancos',
    nameEn: 'Abdominoplasty + Flank Liposuction',
    procedurePrice: null, // Consultar evaluación
    medicalExpenses: 1100,
    estimatedTotal: null, // Consultar evaluación
    includesBreasts: false,
    category: 'body',
    notes: 'Consultar evaluación médica'
  },
  {
    id: 'abdominoplastia_lipo360_bbl',
    name: 'Abdominoplastia (Tummy Tuck) + Liposucción 360 + BBL',
    nameEn: 'Tummy Tuck (Abdominoplasty) + Lipo 360 + BBL',
    procedurePrice: 6000,
    medicalExpenses: 1100,
    estimatedTotal: 7100,
    includesBreasts: false,
    category: 'combo'
  },
  {
    id: 'mommy_makeover_implantes',
    name: 'Mommy Makeover (Tummy Tuck + Lipo 360 + BBL + Senos)',
    nameEn: 'Mommy Makeover (Tummy Tuck + Lipo 360 + BBL + Breasts with Implants)',
    procedurePrice: 8000,
    medicalExpenses: 1200,
    estimatedTotal: 9200,
    includesBreasts: true,
    category: 'combo'
  },
  {
    id: 'mommy_makeover_sin_implantes',
    name: 'Mommy Makeover sin Implantes',
    nameEn: 'Mommy Makeover without Implants (Tummy Tuck + Lipo 360 + BBL + Breast Lift/Reduction)',
    procedurePrice: 8900,
    medicalExpenses: 1200,
    estimatedTotal: 10100,
    includesBreasts: true,
    category: 'combo'
  },
  {
    id: 'levantamiento_senos_sin_implantes',
    name: 'Levantamiento de Senos sin Implantes',
    nameEn: 'Breast Lift without Implants (Mastopexy)',
    procedurePrice: 4000,
    medicalExpenses: 1200,
    estimatedTotal: 5200,
    includesBreasts: true,
    category: 'breast'
  },
  {
    id: 'senos_con_implantes',
    name: 'Senos con Implantes (Aumento Mamario)',
    nameEn: 'Breast Augmentation with Implants',
    procedurePrice: 5000,
    medicalExpenses: 1200,
    estimatedTotal: 6200,
    includesBreasts: true,
    category: 'breast'
  },
  {
    id: 'reduccion_mamaria',
    name: 'Reducción Mamaria',
    nameEn: 'Breast Reduction (Reduction Mammoplasty)',
    procedurePrice: 4500,
    medicalExpenses: 1200,
    estimatedTotal: 5700,
    includesBreasts: true,
    category: 'breast'
  },
  {
    id: 'arm_lift',
    name: 'Arm Lift (Braquioplastia)',
    nameEn: 'Arm Lift (Brachioplasty)',
    procedurePrice: 4000,
    medicalExpenses: 1100,
    estimatedTotal: 5100,
    includesBreasts: false,
    category: 'body'
  },
  {
    id: 'senos_brazos_lipo_bbl_sin_implantes',
    name: 'Senos + Brazos + Liposucción + BBL (sin implantes)',
    nameEn: 'Breasts + Arms + Liposuction + BBL (without implants)',
    procedurePrice: 8000,
    medicalExpenses: 1200,
    estimatedTotal: 9200,
    includesBreasts: true,
    category: 'combo'
  },
  {
    id: 'cruroplastia',
    name: 'Cruroplastia (Muslos Internos)',
    nameEn: 'Thigh Lift / Cruroplasty (Inner Thighs)',
    procedurePrice: 4500,
    procedurePriceRange: { min: 4000, max: 5000 },
    medicalExpenses: 1100,
    estimatedTotal: 5600,
    estimatedTotalRange: { min: 5100, max: 6100 },
    includesBreasts: false,
    category: 'body'
  },
  {
    id: 'reparacion_ombligo',
    name: 'Reparación de Ombligo',
    nameEn: 'Belly Button Repair (Umbilicoplasty)',
    procedurePrice: 1000,
    medicalExpenses: null,
    estimatedTotal: 1000,
    includesBreasts: false,
    category: 'other'
  }
];

export const PRICING_ADDONS: PricingAddon[] = [
  {
    id: 'vaser',
    name: 'Tecnología VASER Ultrasónica',
    nameEn: 'VASER Ultrasound Technology',
    additionalCost: 800,
    description: 'Se suma al procedimiento. No es opcional en algunos casos, especialmente en pacientes con liposucciones previas o fibrosis.'
  },
  {
    id: 'imc_mayor_35',
    name: 'IMC mayor de 35 (Protocolo Alta Complejidad)',
    nameEn: 'BMI greater than 35 (High Complexity Protocol)',
    additionalCost: 800,
    description: 'Se suma al procedimiento para protocolos de monitorización, anestesia extendida y seguridad clínica.'
  }
];

export const PRICING_CONDITIONS = {
  currency: 'USD',
  medicalExpensesIncluded: 'Los gastos médicos incluyen: sangre, seguro, evaluaciones y analíticas.',
  medicalExpensesDetails: '$1,100 para procedimientos sin cirugía de senos · $1,200 cuando el procedimiento incluye senos · Excepto donde se indique "No aplica".',
  vaserNotice: 'VASER no es opcional en algunos casos, especialmente en pacientes con liposucciones previas o fibrosis.',
  generalDisclaimer: 'Los precios pueden variar según evaluación médica, IMC y antecedentes quirúrgicos. Implantes no incluidos excepto donde se especifica.'
};

/**
 * Helper to get the official estimated total USD price for any procedure string
 */
export function getEstimatedPriceForProcedure(procedureName: string): number {
  if (!procedureName) return 4500;
  
  const normalized = procedureName.toLowerCase();
  
  // 1. Check exact or close matches in OFFICIAL_PRICE_LIST
  if (normalized.includes('mommy') && (normalized.includes('sin implante') || normalized.includes('without implant'))) {
    return 10100;
  }
  if (normalized.includes('mommy')) {
    return 9200;
  }
  if (normalized.includes('brazos') && normalized.includes('senos') && normalized.includes('lipo')) {
    return 9200;
  }
  if (normalized.includes('lipo') && (normalized.includes('sin implante') || normalized.includes('without implant'))) {
    return 8200;
  }
  if (normalized.includes('lipo') && normalized.includes('seno') && (normalized.includes('implante') || normalized.includes('implant'))) {
    return 7700;
  }
  if ((normalized.includes('tummy') || normalized.includes('abdomino')) && normalized.includes('360') && normalized.includes('bbl')) {
    return 7100;
  }
  if (normalized.includes('aumento mamario') || (normalized.includes('breast') && normalized.includes('augmentation')) || normalized.includes('senos con implante')) {
    return 6200;
  }
  if (normalized.includes('reducción mamaria') || normalized.includes('breast reduction')) {
    return 5700;
  }
  if (normalized.includes('cruroplastia') || normalized.includes('thigh lift') || normalized.includes('muslos')) {
    return 5600;
  }
  if (normalized.includes('levantamiento de seno') || normalized.includes('mastopexy') || normalized.includes('breast lift')) {
    return 5200;
  }
  if (normalized.includes('braquioplastia') || normalized.includes('arm lift')) {
    return 5100;
  }
  if (normalized.includes('bbl') || normalized.includes('lipoescultura') || normalized.includes('liposuction')) {
    return 5100;
  }
  if (normalized.includes('ombligo') || normalized.includes('belly button') || normalized.includes('umbilico')) {
    return 1000;
  }
  if (normalized.includes('abdominoplastia') || normalized.includes('tummy tuck')) {
    return 6000;
  }
  if (normalized.includes('rinoplastia') || normalized.includes('rhinoplasty')) {
    return 3500;
  }
  if (normalized.includes('blefaro') || normalized.includes('eyelid')) {
    return 2200;
  }
  if (normalized.includes('bichectom') || normalized.includes('buccal')) {
    return 1800;
  }
  if (normalized.includes('botox') || normalized.includes('filler') || normalized.includes('peel') || normalized.includes('microneedling')) {
    return 650;
  }

  return 5100; // Default reasonable baseline
}

