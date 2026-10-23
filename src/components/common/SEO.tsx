import React, { useEffect } from 'react';

export interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  noindex?: boolean;
  structuredData?: object | object[];
}

const DEFAULT_ORIGIN = 'https://srm-resume-ai.srmist.edu.in';
const DEFAULT_IMAGE = `${DEFAULT_ORIGIN}/favicon.svg`;

/**
 * Reusable SEO Component for managing page titles, meta descriptions,
 * Open Graph, Twitter Cards, canonical links, and JSON-LD structured data.
 */
export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  canonical,
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
  noindex = false,
  structuredData
}) => {
  useEffect(() => {
    // 1. Set document title
    const formattedTitle = title.includes('SRM ResumeAI')
      ? title
      : `${title} | SRM ResumeAI`;
    document.title = formattedTitle;

    // Helper to safely set meta attribute
    const setMetaTag = (selector: string, attr: string, value: string) => {
      let element = document.querySelector(selector) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        const [attrName, attrVal] = selector.replace(/[\[\]']/g, '').split('=');
        if (attrName && attrVal) {
          element.setAttribute(attrName, attrVal);
          document.head.appendChild(element);
        }
      }
      if (element) {
        element.setAttribute(attr, value);
      }
    };

    // 2. Core Meta Tags
    setMetaTag('meta[name="description"]', 'content', description);
    if (keywords) {
      setMetaTag('meta[name="keywords"]', 'content', keywords);
    }
    setMetaTag(
      'meta[name="robots"]',
      'content',
      noindex
        ? 'noindex, nofollow'
        : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
    );

    // 3. Canonical Link
    const currentUrl = canonical
      ? (canonical.startsWith('http') ? canonical : `${DEFAULT_ORIGIN}${canonical}`)
      : `${DEFAULT_ORIGIN}${window.location.pathname}`;

    let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', currentUrl);

    // 4. Open Graph Tags
    setMetaTag('meta[property="og:title"]', 'content', formattedTitle);
    setMetaTag('meta[property="og:description"]', 'content', description);
    setMetaTag('meta[property="og:type"]', 'content', ogType);
    setMetaTag('meta[property="og:url"]', 'content', currentUrl);
    setMetaTag('meta[property="og:image"]', 'content', ogImage);

    // 5. Twitter Card Tags
    setMetaTag('meta[name="twitter:title"]', 'content', formattedTitle);
    setMetaTag('meta[name="twitter:description"]', 'content', description);
    setMetaTag('meta[name="twitter:image"]', 'content', ogImage);

    // 6. Structured Data Injection (JSON-LD)
    let jsonLdScript: HTMLScriptElement | null = null;
    if (structuredData) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.type = 'application/ld+json';
      jsonLdScript.id = 'page-json-ld';
      jsonLdScript.text = JSON.stringify(structuredData);
      document.head.appendChild(jsonLdScript);
    }

    // Cleanup on unmount or page change
    return () => {
      if (jsonLdScript && document.head.contains(jsonLdScript)) {
        document.head.removeChild(jsonLdScript);
      }
    };
  }, [title, description, keywords, canonical, ogType, ogImage, noindex, structuredData]);

  return null;
};
