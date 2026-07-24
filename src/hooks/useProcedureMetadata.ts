import { useEffect } from 'react';
import { ProcedureDetail } from '../data/proceduresData';
import { generateMetadata, MetadataResult } from '../lib/generateMetadata';

/**
 * Custom hook that dynamically injects procedure-specific meta tags
 * (title, description, Open Graph, Twitter Cards, canonical URL) into the document <head>.
 */
export function useProcedureMetadata(
  procedure: ProcedureDetail | null,
  language: string = 'es',
  procedureNameOverride?: string,
  category?: string
): MetadataResult {
  const metadata = generateMetadata(procedure, language, procedureNameOverride, category);

  useEffect(() => {
    const previousTitle = document.title;

    // 1. Update Document Title
    document.title = metadata.title;

    // Helper function to update or create <meta> elements
    const updateMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
      let tag = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attrName, attrValue);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    // Helper function to update or create canonical <link> element
    const updateCanonicalLink = (url: string) => {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', url);
    };

    // 2. Inject Primary SEO Tags
    updateMetaTag('name', 'description', metadata.description);
    updateMetaTag('name', 'keywords', metadata.keywords);

    // 3. Inject Open Graph Tags
    updateMetaTag('property', 'og:title', metadata.openGraph.title);
    updateMetaTag('property', 'og:description', metadata.openGraph.description);
    updateMetaTag('property', 'og:image', metadata.openGraph.image);
    updateMetaTag('property', 'og:url', metadata.openGraph.url);
    updateMetaTag('property', 'og:type', metadata.openGraph.type);
    updateMetaTag('property', 'og:site_name', metadata.openGraph.siteName);
    updateMetaTag('property', 'og:locale', metadata.openGraph.locale);

    // 4. Inject Twitter Card Tags
    updateMetaTag('name', 'twitter:card', metadata.twitter.card);
    updateMetaTag('name', 'twitter:title', metadata.twitter.title);
    updateMetaTag('name', 'twitter:description', metadata.twitter.description);
    updateMetaTag('name', 'twitter:image', metadata.twitter.image);

    // 5. Inject Canonical URL
    updateCanonicalLink(metadata.canonicalUrl);

    // Cleanup hook: restore default site title on unmount or procedure change
    return () => {
      if (previousTitle) {
        document.title = previousTitle;
      }
    };
  }, [
    metadata.title,
    metadata.description,
    metadata.keywords,
    metadata.canonicalUrl,
    metadata.openGraph.image,
    metadata.openGraph.url,
    metadata.openGraph.locale
  ]);

  return metadata;
}
