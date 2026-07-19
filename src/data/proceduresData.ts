export interface ProcedureDetail {
  id: string;
  nameKey: string;
  category: 'face' | 'breast' | 'body' | 'skin';
  duration: { en: string; es: string };
  anesthesia: { en: string; es: string };
  recovery: { en: string; es: string };
  hospitalStay: { en: string; es: string };
  scars: { en: string; es: string };
  overview: { en: string; es: string };
  benefits: { en: string[]; es: string[] };
  idealCandidate: { en: string; es: string };
  preOp: { en: string[]; es: string[] };
  postOp: { en: string[]; es: string[] };
  faqs: { q: { en: string; es: string }; a: { en: string; es: string } }[];
  image: string;
}

export const PROCEDURES_DATA: ProcedureDetail[] = [
  // FACIAL PROCEDURES
  {
    id: 'rhinoplasty',
    nameKey: 'procedure.rhinoplasty',
    category: 'face',
    duration: { en: '2 - 3 Hours', es: '2 - 3 Horas' },
    anesthesia: { en: 'General Anesthesia', es: 'Anestesia General' },
    recovery: { en: '1 - 2 Weeks (Splint removed after 7 days)', es: '1 - 2 Semanas (Férula retirada a los 7 días)' },
    hospitalStay: { en: 'Outpatient (Same day discharge)', es: 'Ambulatorio (Alta el mismo día)' },
    scars: { en: 'Virtually invisible (Closed) or tiny trans-columellar (Open)', es: 'Virtualmente invisibles (Cerrada) o pequeña trans-columelar (Abierta)' },
    overview: {
      en: 'Rhinoplasty is a customized surgical procedure designed to reshape, resize, or reconstruct the nasal structure. Dr. Estrella focuses on achieving facial harmony while optimizing respiratory function, ensuring a natural-looking nasal bridge and tip that complements your unique facial features.',
      es: 'La rinoplastia es un procedimiento quirúrgico personalizado diseñado para remodelar, redimensionar o reconstruir la estructura nasal. El Dr. Estrella se enfoca en lograr la armonía facial al mismo tiempo que optimiza la función respiratoria, garantizando un puente y una punta de aspecto natural.'
    },
    benefits: {
      en: [
        'Improves facial symmetry and nasal proportions',
        'Refines nasal tip projection and bridge contour',
        'Corrects breathing difficulties (deviated septum)',
        'Enhances self-confidence with a personalized, non-operated appearance'
      ],
      es: [
        'Mejora la simetría facial y las proporciones de la nariz',
        'Refina la proyección de la punta y el contorno del dorso nasal',
        'Corrige dificultades respiratorias (tabique desviado)',
        'Aumenta la autoconfianza con un aspecto natural y no sobreoperado'
      ]
    },
    idealCandidate: {
      en: 'Individuals with fully developed facial structures (typically age 16+) looking to improve the appearance or function of their nose, who are in good overall health.',
      es: 'Personas con estructuras faciales completamente desarrolladas (generalmente mayores de 16 años) que buscan mejorar la apariencia o función de su nariz y que gozan de buena salud general.'
    },
    preOp: {
      en: [
        'Avoid taking aspirin, anti-inflammatories, or herbal supplements that increase bleeding 2 weeks prior.',
        'Stop smoking entirely at least 4 weeks before and after surgery to ensure proper healing.',
        'Obtain complete pre-operative laboratory tests and clearance from a cardiologist.',
        'Arrange for a companion to drive you home and assist you during the first 24 hours.'
      ],
      es: [
        'Evitar tomar aspirina, antiinflamatorios o suplementos de hierbas que aumenten el sangrado 2 semanas antes.',
        'Dejar de fumar por completo al menos 4 semanas antes y después de la cirugía para asegurar la cicatrización.',
        'Realizarse análisis de laboratorio preoperatorios completos y obtener la evaluación cardiovascular.',
        'Coordinar que un acompañante lo lleve a casa y lo asista durante las primeras 24 horas.'
      ]
    },
    postOp: {
      en: [
        'Keep your head elevated at a 45-degree angle even during sleep for the first week.',
        'Apply cold compresses around the eyes (never directly on the nose) to minimize swelling.',
        'Avoid blowing your nose; use saline sprays to keep nasal passages moist as prescribed.',
        'Refrain from strenuous activities, heavy lifting, or wearing glasses resting on the nasal bridge for 4-6 weeks.'
      ],
      es: [
        'Mantener la cabeza elevada en un ángulo de 45 grados incluso al dormir durante la primera semana.',
        'Aplicar compresas frías alrededor de los ojos (nunca directamente en la nariz) para minimizar la inflamación.',
        'Evitar sonarse la nariz; utilizar aerosoles salinos prescritos para mantener los conductos nasales húmedos.',
        'Abstenerse de realizar actividades extenuantes, levantar objetos pesados o usar gafas apoyadas en el puente nasal durante 4 a 6 semanas.'
      ]
    },
    faqs: [
      {
        q: { en: 'Will rhinoplasty affect my breathing?', es: '¿Afectará la rinoplastia mi respiración?' },
        a: {
          en: 'Rhinoplasty can actually improve your breathing if performed alongside a septoplasty to correct a deviated septum. Dr. Estrella evaluates both cosmetic and functional aspects during your consultation.',
          es: 'La rinoplastia en realidad puede mejorar su respiración si se realiza junto con una septoplastia para corregir un tabique desviado. El Dr. Estrella evalúa tanto los aspectos estéticos como los funcionales durante su consulta.'
        }
      },
      {
        q: { en: 'When will I see the final results?', es: '¿Cuándo veré los resultados finales?' },
        a: {
          en: 'While most swelling resolves within 4-6 weeks, subtle changes and the final shape of the nasal tip can take up to a full year to mature completely.',
          es: 'Aunque la mayor parte de la inflamación desaparece en 4-6 semanas, los cambios sutiles y la forma final de la punta nasal pueden tardar hasta un año completo en madurar.'
        }
      }
    ],
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'facelift',
    nameKey: 'procedure.facelift',
    category: 'face',
    duration: { en: '3 - 5 Hours', es: '3 - 5 Horas' },
    anesthesia: { en: 'General or Deep Sedation', es: 'Anestesia General o Sedación Profunda' },
    recovery: { en: '2 Weeks (Return to social activities)', es: '2 Semanas (Regreso a actividades sociales)' },
    hospitalStay: { en: '1 Night stay recommended', es: '1 Noche de internamiento recomendada' },
    scars: { en: 'Discreetly hidden within the natural contours of the ear and hairline', es: 'Ocultas discretamente en los contornos naturales del oído y la línea del cabello' },
    overview: {
      en: 'A Facelift (Rhytidectomy) is the gold standard in facial rejuvenation. Dr. Estrella performs advanced SMAS (Superficial Musculoaponeurotic System) facelifts, which tighten the underlying muscle structure and remove excess skin. This technique prevents a "pulled" look, restoring a youthfully sharp jawline and natural neck contour.',
      es: 'Un Estiramiento Facial (Ritidectomía) es el estándar de oro en el rejuvenecimiento facial. El Dr. Estrella realiza estiramientos SMAS avanzados, tensando la estructura muscular subyacente y eliminando el exceso de piel para evitar un aspecto "estirado" artificial.'
    },
    benefits: {
      en: [
        'Redefines and sharpens the jawline and neck contours (jowls correction)',
        'Lifts and restores youthful volume to the mid-face and cheeks',
        'Softens deep nasolabial folds and marionette lines',
        'Subtle, long-lasting rejuvenation results that make you look 10-15 years younger'
      ],
      es: [
        'Redefine y perfila la mandíbula y el contorno del cuello (corrección de papada)',
        'Eleva y restaura el volumen juvenil en las mejillas y tercio medio facial',
        'Suaviza los surcos nasogenianos profundos y líneas de marioneta',
        'Resultados de rejuvenecimiento sutiles y duraderos que restan de 10 a 15 años de apariencia'
      ]
    },
    idealCandidate: {
      en: 'Patients experiencing moderate-to-severe sagging of facial skin and muscle structure, usually in their 40s to 70s, with healthy tissue elasticity.',
      es: 'Pacientes que experimentan flacidez moderada a severa de la piel facial y estructura muscular, generalmente entre 40 y 70 años, con buena elasticidad tisular.'
    },
    preOp: {
      en: [
        'Complete cardiovascular clearance and lab tests are strictly required.',
        'Stop all anti-coagulant medications, vitamins, and tobacco 3-4 weeks prior.',
        'Keep skin thoroughly hydrated and avoid sunburns or active chemical peels before the date.',
        'Prepare comfortable, button-front shirts to avoid pulling clothes over your head post-surgery.'
      ],
      es: [
        'Se requiere estrictamente evaluación cardiovascular completa y análisis de laboratorio.',
        'Suspender anticoagulantes, vitaminas y tabaco de 3 a 4 semanas antes.',
        'Mantener la piel hidratada y evitar quemaduras solares o peelings químicos activos.',
        'Preparar ropa cómoda que se abotone por delante para evitar pasarla por la cabeza tras la cirugía.'
      ]
    },
    postOp: {
      en: [
        'Wear the prescribed facial compression support garment as instructed (typically 24/7 for the first week).',
        'Expect mild swelling, tightness, and bruising, which peak around day 3-4 and fade quickly.',
        'Clean incision lines gently with saline water and apply antibacterial ointments daily.',
        'Protect incision scars from direct sunlight with wide-brim hats and medical-grade sunscreen for 6 months.'
      ],
      es: [
        'Usar la mentonera o faja de compresión facial según lo indicado (generalmente 24/7 la primera semana).',
        'Es normal presentar inflamación y hematomas, que alcanzan su punto máximo al día 3 o 4 y disminuyen rápido.',
        'Limpiar las líneas de incisión con agua salina y aplicar ungüentos antibacterianos diariamente.',
        'Proteger las cicatrices del sol directo con sombreros de ala ancha y protector solar médico durante 6 meses.'
      ]
    },
    faqs: [
      {
        q: { en: 'Will I look "pulled" or unnatural?', es: '¿Me veré "estirado/a" o poco natural?' },
        a: {
          en: 'No. By focusing on repositioning the deep muscular layer (SMAS) rather than just pulling the skin tight, Dr. Estrella achieves highly natural, expressive, and soft results.',
          es: 'No. Al reposicionar la capa muscular profunda (SMAS) en lugar de solo estirar la piel, el Dr. Estrella logra resultados muy naturales, expresivos y suaves.'
        }
      }
    ],
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'blepharoplasty',
    nameKey: 'procedure.blepharoplasty',
    category: 'face',
    duration: { en: '1 - 2 Hours', es: '1 - 2 Horas' },
    anesthesia: { en: 'Local with Sedation or General', es: 'Local con Sedación o General' },
    recovery: { en: '7 - 10 Days', es: '7 - 10 Días' },
    hospitalStay: { en: 'Outpatient', es: 'Ambulatorio' },
    scars: { en: 'Completely hidden within upper eyelid fold or just below lower eyelashes', es: 'Ocultas en el pliegue del párpado superior o justo debajo de las pestañas inferiores' },
    overview: {
      en: 'Blepharoplasty (Eyelid surgery) rejuvenates tired-looking eyes. It involves removing excess sagging skin from the upper eyelids and treating fatty deposits under the eyes that create puffy "bags". This reveals an rested, awake, and highly refreshed facial harmony.',
      es: 'La blefaroplastia (cirugía de párpados) rejuvenece los ojos de aspecto cansado. Consiste en eliminar el exceso de piel flácida de los párpados superiores y tratar las acumulaciones de grasa que forman las "bolsas" inferiores.'
    },
    benefits: {
      en: [
        'Eliminates puffiness and bulging fat bags under the eyes',
        'Removes drooping excess skin that hood the natural upper eye fold',
        'Can restore peripheral vision obstructed by sagging upper lid skin',
        'Gives a significantly rested, radiant and youthful eye contour'
      ],
      es: [
        'Elimina la hinchazón y las bolsas de grasa debajo de los ojos',
        'Remueve el exceso de piel caída que encapucha el párpado superior',
        'Puede restaurar la visión periférica obstruida por la piel caída',
        'Aporta un contorno de ojos significativamente descansado, radiante y juvenil'
      ]
    },
    idealCandidate: {
      en: 'Men and women with excess eyelid skin, puffiness, or bags under the eyes who wish to restore a brighter, youthful expression.',
      es: 'Hombres y mujeres con exceso de piel, hinchazón o bolsas en los párpados que deseen restaurar una expresión de mirada despierta y juvenil.'
    },
    preOp: {
      en: [
        'Undergo an ophthalmic check-up if you have dry eyes or glaucoma.',
        'Stop taking supplements or medications that increase bleeding.',
        'Avoid wearing contact lenses to the clinic on the surgery day.'
      ],
      es: [
        'Realizarse un chequeo oftalmológico si padece de ojo seco o glaucoma.',
        'Suspender suplementos o medicamentos que predispongan al sangrado.',
        'Evitar el uso de lentes de contacto el día del procedimiento.'
      ]
    },
    postOp: {
      en: [
        'Apply cold packs frequently for the first 48 hours to minimize eyelid swelling.',
        'Cleanse incisions carefully with prescribed ophthalmic drops and ointments.',
        'Wear dark sunglasses outdoors to protect healing tissues from UV rays and wind.'
      ],
      es: [
        'Aplicar compresas frías frecuentemente las primeras 48 horas para minimizar la inflamación.',
        'Limpiar las incisiones cuidadosamente con las gotas y ungüentos oftálmicos indicados.',
        'Usar gafas de sol oscuras al salir para proteger los párpados de la radiación UV y el viento.'
      ]
    },
    faqs: [
      {
        q: { en: 'Are the eyelid scars noticeable?', es: '¿Son notables las cicatrices del párpado?' },
        a: {
          en: 'No. The skin of the eyelids heals exceptionally well. Incisions are hidden directly in the crease of the upper lid or immediately below the lash line, making them virtually imperceptible once healed.',
          es: 'No. La piel del párpado cicatriza extraordinariamente rápido. Las incisiones se ocultan en el pliegue natural o bajo las pestañas, haciéndolas imperceptibles.'
        }
      }
    ],
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600'
  },

  // BREAST PROCEDURES
  {
    id: 'breast_augmentation',
    nameKey: 'procedure.breast_augmentation',
    category: 'breast',
    duration: { en: '1 - 2 Hours', es: '1 - 2 Horas' },
    anesthesia: { en: 'General Anesthesia', es: 'Anestesia General' },
    recovery: { en: '1 Week (Return to office work)', es: '1 Semana (Retorno a trabajo de oficina)' },
    hospitalStay: { en: 'Outpatient (Same day)', es: 'Ambulatorio (Mismo día)' },
    scars: { en: 'Minimal (Hidden in sub-mammary fold or around the lower areola)', es: 'Mínimas (Ocultas en el surco submamario o alrededor del borde inferior de la areola)' },
    overview: {
      en: 'Breast Augmentation (Mammaplasty) increases fullness, improves symmetry, and restores volume lost due to pregnancy, aging, or weight changes. Dr. Estrella uses premium FDA-approved silicone implants, carefully determining the ideal placement (sub-muscular or sub-glandular) to achieve soft, natural and proportional curves.',
      es: 'El Aumento de Mamas aumenta el volumen, mejora la simetría y restaura la plenitud perdida. El Dr. Estrella utiliza implantes de silicona premium aprobados por la FDA, logrando curvas suaves, naturales y proporcionales.'
    },
    benefits: {
      en: [
        'Restores fullness and youthful volume to the breasts',
        'Balances structural asymmetry between breasts',
        'Enhances body contour proportions in clothes and swimwear',
        'Uses top-tier cohesive silicone gel implants for long-term safety and feel'
      ],
      es: [
        'Restaura el volumen y plenitud juvenil de los senos',
        'Equilibra la asimetría estructural entre ambas mamas',
        'Mejora las proporciones del contorno corporal con la ropa y trajes de baño',
        'Utiliza implantes de gel de silicona cohesivo de alta gama para máxima seguridad y textura'
      ]
    },
    idealCandidate: {
      en: 'Healthy adult women looking to enhance their breast size or restore volume, with realistic expectations regarding breast proportions.',
      es: 'Mujeres adultas sanas que buscan aumentar el tamaño o restaurar la firmeza, con expectativas realistas respecto a las proporciones de su figura.'
    },
    preOp: {
      en: [
        'Schedule a baseline screening mammogram or breast ultrasound.',
        'Avoid taking supplements, vitamin E, or aspirin that increase bleeding risks.',
        'Choose the desired size and profile class under Dr. Estrella\'s expert architectural guidance.'
      ],
      es: [
        'Programar una mamografía o ecografía mamaria de control preoperatorio.',
        'Suspender suplementos, vitamina E o aspirina que puedan inducir sangrados.',
        'Elegir el tamaño y perfil deseados bajo la guía experta del Dr. Estrella.'
      ]
    },
    postOp: {
      en: [
        'Wear a seamless surgical support bra day and night for 4-6 weeks.',
        'Refrain from lifting your elbows above your shoulders or lifting heavy items for 2 weeks.',
        'Gently massage the breasts as instructed to help settle the implants into their natural position.',
        'Avoid sleeping on your stomach or chest for at least 6 weeks.'
      ],
      es: [
        'Usar el brasier de soporte postquirúrgico día y noche durante 4 a 6 semanas.',
        'Evitar levantar los codos por encima de los hombros o cargar objetos pesados durante 2 semanas.',
        'Realizar masajes mamarios suaves según las instrucciones para ayudar a posicionar los implantes.',
        'Evitar dormir boca abajo o sobre el pecho por lo menos 6 semanas.'
      ]
    },
    faqs: [
      {
        q: { en: 'Can I breastfeed after getting implants?', es: '¿Puedo amamantar después de tener implantes?' },
        a: {
          en: 'In most cases, yes. Breast augmentation placed under the chest muscle does not affect the mammary glands or milk ducts, keeping breastfeeding perfectly viable.',
          es: 'En la mayoría de los casos, sí. El implante colocado debajo del músculo pectoral no interfiere con las glándulas mamarias ni conductos, manteniendo la lactancia viable.'
        }
      }
    ],
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'breast_lift',
    nameKey: 'procedure.breast_lift',
    category: 'breast',
    duration: { en: '2 - 3 Hours', es: '2 - 3 Horas' },
    anesthesia: { en: 'General Anesthesia', es: 'Anestesia General' },
    recovery: { en: '1 - 2 Weeks', es: '1 - 2 Semanas' },
    hospitalStay: { en: 'Outpatient or 1 Night stay', es: 'Ambulatorio o 1 Noche de estadía' },
    scars: { en: 'Around the areola, vertical line, or anchor pattern depending on ptosis grade', es: 'Alrededor de la areola, línea vertical o en patrón de ancla según el grado de caída' },
    overview: {
      en: 'Breast Lift (Mastopexy) raises and reshapes sagging breasts. Over time, factors like pregnancy, breastfeeding, weight fluctuations, and gravity cause the skin to lose elasticity. Dr. Estrella removes excess skin, tightens the surrounding tissue, and repositions the nipple-areola complex higher, giving the chest a youthful, firm, and pert projection.',
      es: 'El Levantamiento de Mamas (Mastopexia) eleva y remodela los senos caídos. El Dr. Estrella elimina el exceso de piel, tensa el tejido circundante y eleva el complejo pezón-areola a una posición más alta y juvenil.'
    },
    benefits: {
      en: [
        'Lifts breasts to a more youthful, elevated position on the chest wall',
        'Restores structural firmness, tightness and pertness',
        'Reduces enlarged areolas to match the newly shaped breast profile',
        'Can be combined with implants (Augmentation-Mastopexy) for both lift and volume'
      ],
      es: [
        'Eleva las mamas a una posición más juvenil y firme en el tórax',
        'Restaura la firmeza estructural y la tensión del tejido',
        'Reduce el tamaño de areolas agrandadas para un perfil mamario estético',
        'Se puede combinar con implantes (Mastopexia con Aumento) para lograr elevación y volumen'
      ]
    },
    idealCandidate: {
      en: 'Women with drooping breasts, nipples pointing downward, or stretched skin who do not require substantial volume reduction.',
      es: 'Mujeres con mamas caídas, pezones apuntando hacia abajo o piel estirada que no requieran una reducción sustancial de volumen.'
    },
    preOp: {
      en: [
        'Ensure a recent normal mammogram is completed.',
        'Refrain from smoking 4 weeks prior to ensure optimal skin healing.',
        'Maintain a stable weight before undergoing surgery.'
      ],
      es: [
        'Asegurarse de tener una mamografía reciente con resultados normales.',
        'Evitar fumar 4 semanas antes para asegurar una óptima cicatrización de la piel.',
        'Mantener un peso estable antes de someterse a la cirugía.'
      ]
    },
    postOp: {
      en: [
        'Wear the post-surgical compression bra continuously as directed.',
        'Avoid any upper body strain, reaching, or heavy lifting for 3 weeks.',
        'Sleep strictly on your back with pillows elevating your upper body.'
      ],
      es: [
        'Usar el brasier de compresión postquirúrgico continuamente según las instrucciones.',
        'Evitar esfuerzos del torso, estirarse de más o cargar objetos pesados durante 3 semanas.',
        'Dormir estrictamente boca arriba con almohadas que eleven la parte superior del cuerpo.'
      ]
    },
    faqs: [
      {
        q: { en: 'Does a breast lift add size?', es: '¿El levantamiento de senos aumenta el tamaño?' },
        a: {
          en: 'No, a standard mastopexy only repositions existing tissue. If you desire larger breasts, Dr. Estrella can perform an Augmentation-Mastopexy, combining the lift with cohesive gel implants.',
          es: 'No, una mastopexia estándar solo reposiciona el tejido existente. Si desea mayor volumen, el Dr. Estrella puede realizar una Mastopexia con Aumento.'
        }
      }
    ],
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600'
  },

  // BODY PROCEDURES
  {
    id: 'liposuction',
    nameKey: 'procedure.liposuction',
    category: 'body',
    duration: { en: '2 - 4 Hours', es: '2 - 4 Horas' },
    anesthesia: { en: 'General Anesthesia', es: 'Anestesia General' },
    recovery: { en: '10 - 14 Days (With compression garments and lymphatic massage)', es: '10 - 14 Días (Con faja de compresión y masajes de drenaje linfático)' },
    hospitalStay: { en: 'Outpatient or 1 Night stay depending on volume', es: 'Ambulatorio o 1 Noche según el volumen extraído' },
    scars: { en: 'Tiny, 3-5mm incisions hidden in natural folds or underwear lines', es: 'Diminutas incisiones de 3-5 mm ocultas en pliegues naturales o líneas de la ropa interior' },
    overview: {
      en: 'Liposuction 360 (High-Definition Liposculpture) is Dr. Estrella\'s signature body contouring technique. It targets the entire midsection (abdomen, flanks, mid-back, and lower back) to sculpt an athletic, curvy, and balanced silhouette. Using advanced fat-grafting (BBL), the harvested fat can be processed and transferred to enhance gluteal volume and contour.',
      es: 'La Liposucción 360 (Lipoescultura de Alta Definición) es la técnica de contorno corporal insignia del Dr. Estrella. Trata toda la zona media (abdomen, flancos, espalda media y baja) para esculpir una silueta atlética, curvilínea y equilibrada.'
    },
    benefits: {
      en: [
        'Sculpts a highly defined, athletic abdomen and hourglass waistline',
        '360-degree contouring that treats front, sides, and back in a single session',
        'Permanently eliminates stubborn fat deposits resistant to diet and exercise',
        'Enables structural fat grafting (Brazilian Butt Lift) to sculpt buttocks and hips'
      ],
      es: [
        'Esculpe un abdomen definido y atlético y una cintura de reloj de arena',
        'Moldeo de 360 grados que trata abdomen, flancos y espalda en una sola sesión',
        'Elimina permanentemente los depósitos de grasa difíciles resistentes a la dieta y ejercicio',
        'Permite la transferencia de grasa (BBL) para definir y dar volumen a glúteos y caderas'
      ]
    },
    idealCandidate: {
      en: 'Individuals near their ideal body weight with stubborn localized fat deposits and good skin elasticity, committed to a stable, healthy lifestyle.',
      es: 'Personas cerca de su peso ideal con depósitos de grasa localizada y buena elasticidad cutánea, comprometidas con un estilo de vida saludable.'
    },
    preOp: {
      en: [
        'Complete extensive laboratory panel tests, chest X-ray, and cardiovascular assessment.',
        'Stop taking vitamin E, green tea, Ginkgo Biloba, and anti-inflammatories.',
        'Purchase post-surgical compression garments (fajas) and arrange lymphatic drainage massage therapy sessions in advance.'
      ],
      es: [
        'Completar un panel extenso de laboratorio, radiografía de tórax y evaluación cardiovascular.',
        'Suspender vitamina E, té verde, ginkgo biloba y antiinflamatorios.',
        'Adquirir las fajas de compresión postquirúrgicas y programar los masajes de drenaje linfático con anticipación.'
      ]
    },
    postOp: {
      en: [
        'Wear the high-compression post-surgical faja 24/7 as instructed for the first month.',
        'Attend mandatory lymphatic drainage massages starting 2-3 days post-op to prevent fluid retention (seromas) and fibrosis.',
        'Stay active with light, frequent walks inside to promote healthy circulation and prevent blood clots.',
        'Avoid hot baths, saunas, and strenuous gym workouts for 6 weeks.'
      ],
      es: [
        'Usar la faja de alta compresión 24/7 durante el primer mes.',
        'Realizarse los masajes de drenaje linfático obligatorios a partir de los 2-3 días para evitar la retención de líquidos (seromas) y fibrosis.',
        'Caminar de forma suave y frecuente para promover la circulación saludable y evitar coágulos.',
        'Evitar baños calientes, saunas y entrenamientos pesados en el gimnasio por 6 semanas.'
      ]
    },
    faqs: [
      {
        q: { en: 'Is the fat transfer to the buttocks safe?', es: '¿Es segura la transferencia de grasa a los glúteos?' },
        a: {
          en: 'Yes. Dr. Estrella performs fat grafting (BBL) safely by injecting fat exclusively into the subcutaneous layer (above the muscle), adhering to strict international clinical safety standards.',
          es: 'Sí. El Dr. Estrella realiza la transferencia de grasa (BBL) de forma segura inyectando grasa exclusivamente en el plano subcutáneo (sobre el músculo), bajo estrictos estándares clínicos.'
        }
      }
    ],
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'abdominoplasty',
    nameKey: 'procedure.abdominoplasty',
    category: 'body',
    duration: { en: '3 - 4 Hours', es: '3 - 4 Horas' },
    anesthesia: { en: 'General Anesthesia', es: 'Anestesia General' },
    recovery: { en: '3 - 4 Weeks (Return to desk job after 2 weeks)', es: '3 - 4 Semanas (Retorno a trabajo de escritorio a las 2 semanas)' },
    hospitalStay: { en: '1 Night stay included', es: '1 Noche de internamiento incluida' },
    scars: { en: 'Horizontal line low on the abdomen (easily hidden by bikini/underwear) and inside the belly button', es: 'Línea horizontal baja en el abdomen (fácil de ocultar en bikini/ropa interior) y dentro del ombligo' },
    overview: {
      en: 'Abdominoplasty (Tummy Tuck) restores a flat, tight, and firm abdomen. It is ideal after significant weight loss or pregnancies, which can stretch the skin and separate the abdominal muscles (diastasis recti). Dr. Estrella removes excess hanging skin, repairs and tightens the weakened abdominal wall, and meticulously sculpts a natural-looking belly button (umbilicoplasty).',
      es: 'La Abdominoplastia (Tummy Tuck) restaura un abdomen plano, firme y definido. Es ideal tras pérdidas masivas de peso o embarazos que han estirado la piel y separado los músculos abdominales (diástasis de rectos).'
    },
    benefits: {
      en: [
        'Removes loose, sagging excess skin and stubborn stretch marks of the lower abdomen',
        'Repairs separated abdominal muscles (diastasis recti) to restore a tight core',
        'Significantly narrows and sculpts the waistline for an elegant hourglass form',
        'Provides a beautifully flat, smooth tummy that looks highly toned'
      ],
      es: [
        'Remueve la piel flácida y colgante y las estrías del abdomen inferior',
        'Repara los músculos abdominales separados (diástasis) para devolver firmeza',
        'Estrecha y esculpe significativamente la cintura para una silueta estilizada',
        'Proporciona un abdomen plano y liso de aspecto tonificado'
      ]
    },
    idealCandidate: {
      en: 'Patients with loose abdominal skin, stubborn lower belly fat, or muscle separation due to pregnancy or weight loss, who do not plan future pregnancies.',
      es: 'Pacientes con piel abdominal flácida, grasa acumulada o separación muscular por embarazos o pérdida de peso, que no planeen futuros embarazos.'
    },
    preOp: {
      en: [
        'Achieve a stable weight for at least 3-6 months.',
        'Stop smoking completely at least 6 weeks before to ensure optimal tissue oxygenation.',
        'Get custom fitting for abdominal binders and post-surgical compression fajas.'
      ],
      es: [
        'Alcanzar un peso estable durante al menos 3 a 6 meses.',
        'Dejar de fumar por completo al menos 6 semanas antes para asegurar una óptima oxigenación tisular.',
        'Tomar medidas para la faja y tabla abdominal de soporte postquirúrgico.'
      ]
    },
    postOp: {
      en: [
        'Walk with a slight forward bend for the first 10-14 days to avoid tension on the abdominal incision.',
        'Maintain surgical drains in place as directed, recording outputs daily until they are removed (usually 7-10 days).',
        'Wear the abdominal binder and compression faja diligently to minimize swelling and support the muscle repair.',
        'Avoid lifting anything heavier than 10 lbs or doing core exercises for 6-8 weeks.'
      ],
      es: [
        'Caminar con una ligera flexión hacia adelante los primeros 10-14 días para evitar tensión en la incisión.',
        'Mantener los drenajes quirúrgicos según las indicaciones, anotando el volumen diario hasta su retiro.',
        'Usar la faja de compresión y tabla abdominal diligentemente para minimizar la inflamación.',
        'Evitar levantar más de 10 libras o realizar ejercicios abdominales durante 6 a 8 semanas.'
      ]
    },
    faqs: [
      {
        q: { en: 'Does a tummy tuck remove stretch marks?', es: '¿La abdominoplastia elimina las estrías?' },
        a: {
          en: 'Yes, but only the stretch marks located on the lower abdomen (below the belly button) that are removed along with the excess skin. Stretch marks on the upper abdomen will be shifted lower and tightened.',
          es: 'Sí, pero solo las estrías ubicadas en el abdomen inferior (debajo del ombligo) que se eliminan junto con la piel excedente. Las del abdomen superior se desplazarán hacia abajo haciéndose menos notorias.'
        }
      }
    ],
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600'
  },

  // SKIN / NON-SURGICAL
  {
    id: 'botox_fillers',
    nameKey: 'procedure.botox_fillers',
    category: 'skin',
    duration: { en: '15 - 45 Minutes', es: '15 - 45 Minutos' },
    anesthesia: { en: 'None or Topical Numbing Cream', es: 'Ninguna o Crema Anestésica Tópica' },
    recovery: { en: 'Immediate (Zero downtime)', es: 'Inmediata (Sin tiempo de inactividad)' },
    hospitalStay: { en: 'Outpatient (Lunchtime procedure)', es: 'Procedimiento de consultorio' },
    scars: { en: 'None (Micro-needle injection sites only)', es: 'Ninguna (Solo puntos de micro-inyección temporal)' },
    overview: {
      en: 'Non-Surgical Facial Rejuvenation combines Botox injections and Hyaluronic Acid dermal fillers (like Juvéderm) to soften lines and restore volume. Botox relaxes the active muscles causing wrinkles (forehead, crow\'s feet), while dermal fillers plump areas with volume loss, such as lips, cheeks, and under-eye hollows, providing an instant, refreshed, and hydrated youthfulness.',
      es: 'El Rejuvenecimiento Facial No Quirúrgico combina aplicaciones de Botox y rellenos dérmicos de Ácido Hialurónico (Juvéderm) para suavizar arrugas y restaurar volumen perdido de forma inmediata.'
    },
    benefits: {
      en: [
        'Instantly smooths dynamic forehead wrinkles, frown lines, and crow\'s feet',
        'Restores youthful volume to sunken cheeks and hollow under-eye areas',
        'Sculpts, defines, and plumps lips for a soft, natural hydrated volume',
        'Non-invasive treatment with immediate results and absolutely zero downtime'
      ],
      es: [
        'Suaviza al instante arrugas de la frente, entrecejo y patas de gallo',
        'Restaura el volumen juvenil en mejillas hundidas y ojeras',
        'Esculpe, define y da volumen a los labios para un aspecto hidratado y natural',
        'Tratamiento no invasivo con resultados inmediatos y sin tiempo de recuperación'
      ]
    },
    idealCandidate: {
      en: 'Individuals seeking to prevent or reverse signs of aging, smooth fine wrinkles, or enhance facial contours without undergoing surgical downtime.',
      es: 'Personas que buscan prevenir o revertir los signos del envejecimiento, suavizar arrugas finas o modelar contornos faciales de forma rápida.'
    },
    preOp: {
      en: [
        'Avoid drinking alcohol or taking blood-thinning supplements (like fish oil, Vitamin E) 3 days prior to minimize bruising.',
        'Arrive at the clinic with a clean, makeup-free face.',
        'Inform the practitioner of any history of cold sores (for antiviral pre-treatment).'
      ],
      es: [
        'Evitar el alcohol o suplementos que diluyan la sangre (aceite de pescado, Vitamina E) 3 días antes para minimizar hematomas.',
        'Llegar a la clínica con el rostro limpio y sin maquillaje.',
        'Informar al especialista si tiene antecedentes de herpes labial (para profilaxis).'
      ]
    },
    postOp: {
      en: [
        'Keep your head upright and avoid lying down for 4 hours following Botox injections.',
        'Avoid intense exercise, hot tubs, saunas, or massaging the treated areas for 24-48 hours.',
        'Apply ice packs gently for a few minutes at a time to reduce any minor swelling or redness.',
        'Refrain from undergoing facials or facial massages for 2 weeks.'
      ],
      es: [
        'Mantener la cabeza erguida y evitar acostarse durante las 4 horas posteriores a la aplicación de Botox.',
        'Evitar ejercicio intenso, saunas o masajear las zonas tratadas por 24-48 horas.',
        'Aplicar compresas frías suavemente para reducir inflamación menor o enrojecimiento.',
        'Abstenerse de realizarse limpiezas faciales profundas o masajes faciales por 2 semanas.'
      ]
    },
    faqs: [
      {
        q: { en: 'How long do Botox and Fillers last?', es: '¿Cuánto duran el Botox y los Rellenos?' },
        a: {
          en: 'Botox typically lasts between 3 to 4 months. Hyaluronic acid fillers last between 9 to 18 months, depending on the product used and the area treated.',
          es: 'El Botox dura típicamente de 3 a 4 meses. Los rellenos de ácido hialurónico duran de 9 a 18 meses, dependiendo del área y del producto específico.'
        }
      }
    ],
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=600'
  }
];
