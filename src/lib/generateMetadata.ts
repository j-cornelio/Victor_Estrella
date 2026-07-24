import { ProcedureDetail } from '../data/proceduresData';

export interface OpenGraphMetadata {
  title: string;
  description: string;
  image: string;
  url: string;
  type: string;
  siteName: string;
  locale: string;
}

export interface TwitterMetadata {
  card: string;
  title: string;
  description: string;
  image: string;
}

export interface MetadataResult {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  openGraph: OpenGraphMetadata;
  twitter: TwitterMetadata;
}

const DEFAULT_METADATA: Record<string, { title: string; description: string }> = {
  en: {
    title: 'Dr. Victor Estrella | Aesthetic & Reconstructive Surgery',
    description: 'Aesthetic and Reconstructive Surgery by Dr. Victor Estrella. Board-certified plastic surgeon in Santo Domingo, Dominican Republic. Schedule your consultation online.'
  },
  es: {
    title: 'Dr. Victor Estrella | Cirugía Plástica Estética y Reconstructiva',
    description: 'Cirugía Estética y Reconstructiva por el Dr. Victor Estrella. Cirujano plástico certificado en Santo Domingo, República Dominicana. Reserve su consulta en línea.'
  }
};

/**
 * Generates procedure-specific metadata for SEO, Open Graph, and Twitter tags
 */
export function generateMetadata(
  procedure: ProcedureDetail | null,
  language: string = 'es',
  procedureNameOverride?: string,
  category?: string
): MetadataResult {
  const isEs = language === 'es';
  const langKey = isEs ? 'es' : 'en';
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://drestrellaplasticsurgeon.com';
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const siteName = 'Dr. Victor Estrella | Aesthetic & Reconstructive Surgery';
  const locale = isEs ? 'es_DO' : 'en_US';
  const defaultImage = 'https://res.cloudinary.com/dkicj8zmk/image/upload/v1784816779/logo_tab_okeplm.png';

  if (!procedure) {
    let title = DEFAULT_METADATA[langKey]?.title || DEFAULT_METADATA.es.title;
    let description = DEFAULT_METADATA[langKey]?.description || DEFAULT_METADATA.es.description;

    if (category && category !== 'all') {
      const categoryNames: Record<string, { en: string; es: string }> = {
        face: { en: 'Facial Surgery Procedures', es: 'Procedimientos de Cirugía Facial' },
        breast: { en: 'Breast Aesthetic Procedures', es: 'Procedimientos de Cirugía Mamaria' },
        body: { en: 'Body Contouring Procedures', es: 'Procedimientos de Contorno Corporal' },
        skin: { en: 'Injectables & Aesthetics', es: 'Tratamientos Inyectables y Estéticos' }
      };
      const catName = categoryNames[category]?.[langKey] || category;
      title = `${catName} | Dr. Victor Estrella - Santo Domingo`;
      description = isEs
        ? `Explore nuestros procedimientos especializados en ${catName} realizados por el Dr. Victor Estrella en Santo Domingo, República Dominicana.`
        : `Explore our specialized ${catName} procedures performed by Dr. Victor Estrella in Santo Domingo, Dominican Republic.`;
    }

    const canonicalUrl = `${baseUrl}${currentPath}`;

    return {
      title,
      description,
      keywords: isEs
        ? 'cirugía plástica, cirujano plástico, Santo Domingo, República Dominicana, Dr. Victor Estrella, estética, mamoplastia, lipoescultura'
        : 'plastic surgery, plastic surgeon, Santo Domingo, Dominican Republic, Dr. Victor Estrella, aesthetics, rhinoplasty, liposuction',
      canonicalUrl,
      openGraph: {
        title,
        description,
        image: defaultImage,
        url: canonicalUrl,
        type: 'website',
        siteName,
        locale
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        image: defaultImage
      }
    };
  }

  // Procedure detail dynamic metadata
  const procName = procedureNameOverride || procedure.id;
  
  // Format localized title
  const title = isEs
    ? `${procName} en Santo Domingo | Dr. Victor Estrella - Cirujano Plástico`
    : `${procName} in Santo Domingo | Dr. Victor Estrella - Plastic Surgeon`;

  // Format localized description (limit length for search engines)
  const overviewText = (procedure.overview && procedure.overview[langKey as 'en' | 'es']) 
    ? procedure.overview[langKey as 'en' | 'es'] 
    : (procedure.overview?.es || procedure.overview?.en || '');
    
  const description = overviewText.length > 160 ? overviewText.slice(0, 157) + '...' : overviewText;

  // Procedure keywords
  const keywords = isEs
    ? `${procName}, ${procedure.category}, cirugía plástica Santo Domingo, Dr. Victor Estrella, precio ${procName}, recuperación ${procName}, República Dominicana, anestesia ${procedure.anesthesia?.es || ''}`
    : `${procName}, ${procedure.category}, plastic surgery Santo Domingo, Dr. Victor Estrella, ${procName} cost, ${procName} recovery, Dominican Republic`;

  const image = procedure.image || defaultImage;
  const canonicalUrl = `${baseUrl}${currentPath}?procedure=${procedure.id}`;

  return {
    title,
    description,
    keywords,
    canonicalUrl,
    openGraph: {
      title,
      description,
      image,
      url: canonicalUrl,
      type: 'article',
      siteName,
      locale
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      image
    }
  };
}
